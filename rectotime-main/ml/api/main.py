from fastapi import FastAPI, Depends, HTTPException, Header, Request, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from jose import jwt, JWTError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import joblib
import numpy as np
import os
import json
import secrets
import hashlib
import urllib.parse
import urllib.request
import urllib.error
import smtplib
import ssl
from email.message import EmailMessage
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

app = FastAPI(title="rectotime ML API", version="1.0")

# ──────────────────────────────────────────────────────
# SECURITY CONFIGURATION
# ──────────────────────────────────────────────────────

# JWT — secret MUST be set via JWT_SECRET_KEY env var in production.
_JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
if not _JWT_SECRET_KEY:
    _JWT_SECRET_KEY = secrets.token_urlsafe(32)
    print(
        "WARNING: JWT_SECRET_KEY env var is not set. "
        "Tokens will be invalidated on every restart. "
        "Set JWT_SECRET_KEY for production deployments."
    )
JWT_SECRET_KEY: str = _JWT_SECRET_KEY
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24
SESSION_COOKIE_NAME = "rectotime_session"
CSRF_COOKIE_NAME = "rectotime_csrf"
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "lax").lower()
if COOKIE_SAMESITE not in {"lax", "strict", "none"}:
    COOKIE_SAMESITE = "lax"
if COOKIE_SAMESITE == "none" and not COOKIE_SECURE:
    # Browsers reject SameSite=None cookies unless Secure=true.
    COOKIE_SAMESITE = "lax"

# Password hashing — bcrypt with automatic work-factor selection.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Bearer token extractor (does NOT auto-raise — we use optional auth where needed).
_bearer_scheme = HTTPBearer(auto_error=False)

# OAuth redirect-URI whitelist — expand when deploying to production.
ALLOWED_REDIRECT_URIS = {
    "http://127.0.0.1:8000/integrations/callback",
    "http://localhost:8000/integrations/callback",
}

# Analytics — allowed event names (prevents arbitrary data injection into logs).
ALLOWED_EVENT_NAMES = frozenset({
    "prediction_viewed",
    "action_viewed",
    "action_completed",
    "stress_pro_trial_started",
    "wearable_connected",
    "wearable_synced",
    "integration_connect_clicked",
    "integration_connect_success",
    "integration_connect_failed",
    "integration_sync_success",
    "integration_sync_failed",
})


# ──────────────────────────────────────────────────────
# SECURITY HEADERS MIDDLEWARE
# ──────────────────────────────────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# CORS — cookie-based auth requires credentials=true and explicit origins.
# Set CORS_ORIGINS="https://app.example.com,https://www.example.com" in production.
_raw_origins = os.environ.get("CORS_ORIGINS", "")
_allowed_origins: list = [o.strip() for o in _raw_origins.split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
ANALYTICS_FILE = os.path.join(BASE_DIR, "analytics_events.jsonl")
USERS_FILE = os.path.join(BASE_DIR, "users.json")
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "").strip()
FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "http://localhost:5173").rstrip("/")
RETURN_RESET_TOKEN = os.environ.get("RETURN_RESET_TOKEN", "false").lower() == "true"
RESET_TOKEN_TTL_MINUTES = int(os.environ.get("RESET_TOKEN_TTL_MINUTES", "30"))

# SMTP config for password reset emails.
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "").strip() or SMTP_USERNAME
SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"

productivity_model = None
stress_model = None

try:
    productivity_model = joblib.load(os.path.join(MODELS_DIR, "productivity_model.pkl"))
except Exception as e:
    print(f"Warning: Could not load productivity model: {e}")

try:
    stress_model = joblib.load(os.path.join(MODELS_DIR, "stress_model.pkl"))
except Exception as e:
    print(f"Warning: Could not load stress model: {e}")


# Pydantic Models
class ProductivityInput(BaseModel):
    hours_studied: float
    previous_scores: float
    extracurricular_activities: int
    sleep_hours: float
    sample_question_papers_practiced: int


class StressInput(BaseModel):
    gender: int
    age: int
    occupation: int
    sleep_duration: float
    quality_of_sleep: int
    physical_activity_level: int
    bmi_category: int
    heart_rate: int
    daily_steps: int
    sleep_disorder: int
    bp_systolic: int
    bp_diastolic: int


class AnalyticsEventInput(BaseModel):
    name: str = Field(max_length=100)
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class AuthSignupInput(BaseModel):
    name: str
    email: str
    password: str


class AuthLoginInput(BaseModel):
    email: str
    password: str


class GoogleAuthInput(BaseModel):
    id_token: str


class ForgotPasswordInput(BaseModel):
    email: str


class ResetPasswordInput(BaseModel):
    token: str
    new_password: str


class OAuthConnectInput(BaseModel):
    provider: str
    redirect_uri: str = "http://127.0.0.1:8000/integrations/callback"


def _stress_risk_band(score: float) -> str:
    if score <= 4:
        return "low"
    if score <= 6:
        return "moderate"
    return "high"


def _stress_key_drivers(data: StressInput) -> list[str]:
    drivers: list[tuple[str, float]] = []

    # Simple heuristic ranking for v2 payload to highlight actionable factors.
    drivers.append(("sleep_duration", max(0.0, 7.5 - data.sleep_duration)))
    drivers.append(("quality_of_sleep", max(0.0, 8 - data.quality_of_sleep)))
    drivers.append(("heart_rate", max(0.0, data.heart_rate - 72) / 15))
    drivers.append(("daily_steps", max(0.0, 9000 - data.daily_steps) / 3000))
    drivers.append(("physical_activity_level", max(0.0, 3 - data.physical_activity_level)))

    drivers.sort(key=lambda item: item[1], reverse=True)
    top_drivers = [name for name, weight in drivers if weight > 0]
    return top_drivers[:3] if top_drivers else ["maintenance"]


def _stress_actions(data: StressInput, score: float) -> list[dict]:
    actions: list[dict] = []

    if data.sleep_duration < 7:
        actions.append(
            {
                "title": "Sleep Wind-down",
                "description": "Add a 30-minute no-screen wind-down before bed.",
                "frequency": "daily",
                "minutes": 30,
            }
        )

    if data.daily_steps < 8000 or data.physical_activity_level < 3:
        actions.append(
            {
                "title": "Micro Walk",
                "description": "Take a 10-minute walk after lunch to reset stress.",
                "frequency": "daily",
                "minutes": 10,
            }
        )

    if data.heart_rate > 80:
        actions.append(
            {
                "title": "Breathing Reset",
                "description": "Use box breathing for 5 minutes during high-pressure moments.",
                "frequency": "2x daily",
                "minutes": 5,
            }
        )

    if score > 6 and len(actions) < 3:
        actions.append(
            {
                "title": "Focus Break Blocks",
                "description": "Schedule a 5-minute break every 50 minutes of focused work.",
                "frequency": "workdays",
                "minutes": 5,
            }
        )

    if not actions:
        actions.append(
            {
                "title": "Keep Current Routine",
                "description": "Your habits look balanced. Maintain sleep and activity consistency.",
                "frequency": "daily",
                "minutes": 10,
            }
        )

    return actions[:3]


def _expected_impact_range(score: float) -> dict:
    if score <= 4:
        return {"min": -0.1, "max": -0.3, "window_days": 7}
    if score <= 6:
        return {"min": -0.2, "max": -0.6, "window_days": 7}
    return {"min": -0.4, "max": -1.0, "window_days": 7}


def _read_analytics_events() -> list[dict]:
    if not os.path.exists(ANALYTICS_FILE):
        return []

    events: list[dict] = []
    with open(ANALYTICS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return events


def _safe_iso_datetime(raw_timestamp: Optional[str]) -> datetime:
    if not raw_timestamp:
        return datetime.utcnow()
    try:
        normalized = raw_timestamp.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        # Normalize timezone-aware values to naive UTC for safe comparisons.
        if parsed.tzinfo is not None:
            return parsed.replace(tzinfo=None)
        return parsed
    except ValueError:
        return datetime.utcnow()


def _compute_funnel_metrics(events: list[dict], window_days: int) -> dict:
    cutoff = datetime.utcnow() - timedelta(days=window_days)

    recent = []
    for event in events:
        timestamp = _safe_iso_datetime(event.get("timestamp"))
        if timestamp >= cutoff:
            recent.append(event)

    prediction_viewed = len([e for e in recent if e.get("name") == "prediction_viewed"])
    action_viewed = len([e for e in recent if e.get("name") == "action_viewed"])
    action_completed = len([e for e in recent if e.get("name") == "action_completed"])
    trial_started = len([e for e in recent if e.get("name") == "stress_pro_trial_started"])

    return {
        "window_days": window_days,
        "prediction_viewed": prediction_viewed,
        "action_viewed": action_viewed,
        "action_completed": action_completed,
        "trial_started": trial_started,
        "action_view_rate": (action_viewed / prediction_viewed) if prediction_viewed else 0,
        "action_completion_rate": (action_completed / action_viewed) if action_viewed else 0,
        "trial_conversion_rate": (trial_started / prediction_viewed) if prediction_viewed else 0,
    }


# Endpoints
@app.get("/")
def read_root():
    return {"message": "rectotime ML API is running", "version": "1.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


def _hash_password(password: str) -> str:
    """Hash a password with bcrypt (includes built-in salt)."""
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    """
    Constant-time password verification.
    Transparently handles legacy SHA-256 hashes (64 hex chars) for migration.
    After first successful login the hash is re-stored as bcrypt.
    """
    if len(hashed) == 64 and all(c in "0123456789abcdef" for c in hashed):
        # Legacy unsalted SHA-256 path — compare and schedule upgrade.
        import hashlib as _hashlib
        return _hashlib.sha256(plain.encode("utf-8")).hexdigest() == hashed
    return pwd_context.verify(plain, hashed)


def _create_access_token(user_id: str) -> str:
    """Issue a signed JWT that expires in JWT_EXPIRE_HOURS hours."""
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=JWT_EXPIRE_HOURS * 3600,
        path="/",
    )


def _set_csrf_cookie(response: Response, csrf_token: str) -> None:
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=JWT_EXPIRE_HOURS * 3600,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )


def _clear_csrf_cookie(response: Response) -> None:
    response.delete_cookie(
        key=CSRF_COOKIE_NAME,
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )


def _generate_csrf_token() -> str:
    return secrets.token_urlsafe(24)


def _sha256_string(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _is_email_provider_configured() -> bool:
    return bool(SMTP_HOST and SMTP_PORT and SMTP_USERNAME and SMTP_PASSWORD and SMTP_FROM_EMAIL)


def _send_password_reset_email(to_email: str, reset_link: str) -> bool:
    if not _is_email_provider_configured():
        return False

    message = EmailMessage()
    message["Subject"] = "Reset your Rectotime password"
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = to_email
    message.set_content(
        "We received a request to reset your Rectotime password.\n\n"
        f"Use this link to set a new password:\n{reset_link}\n\n"
        f"This link expires in {RESET_TOKEN_TTL_MINUTES} minutes.\n"
        "If you did not request this, you can ignore this email."
    )

    context = ssl.create_default_context()
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            if SMTP_USE_TLS:
                server.starttls(context=context)
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
        return True
    except Exception as exc:
        print(f"WARNING: Failed to send password reset email: {exc}")
        return False


def _find_user_by_email(users: list[dict], normalized_email: str) -> Optional[dict]:
    for user in users:
        if (user.get("email") or "").lower() == normalized_email:
            return user
    return None


def _verify_google_id_token(id_token: str) -> dict:
    if not id_token:
        raise HTTPException(status_code=400, detail="Missing Google ID token")

    url = (
        "https://oauth2.googleapis.com/tokeninfo?"
        + urllib.parse.urlencode({"id_token": id_token})
    )
    req = urllib.request.Request(url, method="GET")

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except (urllib.error.URLError, TimeoutError):
        raise HTTPException(status_code=503, detail="Google token verification unavailable")
    except json.JSONDecodeError:
        raise HTTPException(status_code=401, detail="Invalid Google token payload")

    if GOOGLE_CLIENT_ID and payload.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google token audience mismatch")

    issuer = payload.get("iss")
    if issuer not in {"https://accounts.google.com", "accounts.google.com"}:
        raise HTTPException(status_code=401, detail="Google token issuer mismatch")

    exp_raw = payload.get("exp")
    try:
        exp = int(exp_raw)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Google token missing expiry")

    if exp <= int(datetime.utcnow().timestamp()):
        raise HTTPException(status_code=401, detail="Google token expired")

    if payload.get("email_verified") not in {"true", True}:
        raise HTTPException(status_code=401, detail="Google email is not verified")

    email = (payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=401, detail="Google token missing email")

    return payload


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    session_token: Optional[str] = Cookie(None, alias=SESSION_COOKIE_NAME),
) -> str:
    """FastAPI dependency — validates JWT from Authorization header or HttpOnly cookie."""
    token: Optional[str] = credentials.credentials if credentials else session_token
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token claims")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_csrf(
    csrf_cookie: Optional[str] = Cookie(None, alias=CSRF_COOKIE_NAME),
    x_csrf_token: Optional[str] = Header(None, alias="X-CSRF-Token"),
) -> None:
    """Double-submit CSRF check for cookie-authenticated state-changing routes."""
    if not csrf_cookie or not x_csrf_token or csrf_cookie != x_csrf_token:
        raise HTTPException(status_code=403, detail="CSRF validation failed")


def _public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "createdAt": user["createdAt"],
    }


@app.post("/auth/signup")
@limiter.limit("5/minute")
def auth_signup(request: Request, data: AuthSignupInput, response: Response):
    users = _read_json_file(USERS_FILE, [])

    if len(data.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    normalized_email = data.email.strip().lower()
    if any((user.get("email") or "").lower() == normalized_email for user in users):
        return {"ok": False, "error": "Email already exists"}

    new_user = {
        "id": secrets.token_urlsafe(12),
        "name": data.name.strip(),
        "email": normalized_email,
        "password_hash": _hash_password(data.password),
        "createdAt": datetime.utcnow().isoformat(),
    }
    users.append(new_user)
    _write_json_file(USERS_FILE, users)
    token = _create_access_token(new_user["id"])
    csrf_token = _generate_csrf_token()
    _set_auth_cookie(response, token)
    _set_csrf_cookie(response, csrf_token)
    return {"ok": True, "user": _public_user(new_user), "csrfToken": csrf_token}


@app.post("/auth/login")
@limiter.limit("10/minute")
def auth_login(request: Request, data: AuthLoginInput, response: Response):
    users = _read_json_file(USERS_FILE, [])

    normalized_email = data.email.strip().lower()

    user = _find_user_by_email(users, normalized_email)
    if user:
        stored_hash = user.get("password_hash", "")
        if _verify_password(data.password, stored_hash):
            # Migrate legacy SHA-256 hash to bcrypt on first login.
            if len(stored_hash) == 64 and all(c in "0123456789abcdef" for c in stored_hash):
                user["password_hash"] = _hash_password(data.password)
                _write_json_file(USERS_FILE, users)
            token = _create_access_token(user["id"])
            csrf_token = _generate_csrf_token()
            _set_auth_cookie(response, token)
            _set_csrf_cookie(response, csrf_token)
            return {"ok": True, "user": _public_user(user), "csrfToken": csrf_token}

    # Generic error — don't reveal whether the email exists.
    return {"ok": False, "error": "Invalid email or password"}


@app.post("/auth/google")
@limiter.limit("20/minute")
def auth_google(request: Request, data: GoogleAuthInput, response: Response):
    payload = _verify_google_id_token(data.id_token)
    users = _read_json_file(USERS_FILE, [])

    email = payload["email"].strip().lower()
    name = (
        payload.get("name")
        or payload.get("given_name")
        or email.split("@")[0]
    ).strip()

    user = _find_user_by_email(users, email)
    if not user:
        user = {
            "id": secrets.token_urlsafe(12),
            "name": name,
            "email": email,
            # Random non-usable password hash for OAuth-created accounts.
            "password_hash": _hash_password(secrets.token_urlsafe(24)),
            "auth_provider": "google",
            "createdAt": datetime.utcnow().isoformat(),
        }
        users.append(user)
        _write_json_file(USERS_FILE, users)
    else:
        if not user.get("auth_provider"):
            user["auth_provider"] = "google"
            _write_json_file(USERS_FILE, users)

    token = _create_access_token(user["id"])
    csrf_token = _generate_csrf_token()
    _set_auth_cookie(response, token)
    _set_csrf_cookie(response, csrf_token)
    return {"ok": True, "user": _public_user(user), "csrfToken": csrf_token}


@app.post("/auth/forgot-password")
@limiter.limit("5/minute")
def auth_forgot_password(request: Request, data: ForgotPasswordInput):
    users = _read_json_file(USERS_FILE, [])
    normalized_email = data.email.strip().lower()
    user = _find_user_by_email(users, normalized_email)

    debug_reset_token = None
    if user:
        raw_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)
        user["password_reset"] = {
            "token_hash": _sha256_string(raw_token),
            "expiresAt": expires_at.isoformat(),
            "issuedAt": datetime.utcnow().isoformat(),
        }
        _write_json_file(USERS_FILE, users)

        reset_link = f"{FRONTEND_BASE_URL}/forgot-password?token={urllib.parse.quote(raw_token)}"
        _send_password_reset_email(user["email"], reset_link)

        if RETURN_RESET_TOKEN:
            debug_reset_token = raw_token

    response = {
        "ok": True,
        "message": "If this email exists, a password reset link has been sent.",
    }
    if debug_reset_token:
        response["debugResetToken"] = debug_reset_token
    return response


@app.post("/auth/reset-password")
@limiter.limit("10/minute")
def auth_reset_password(request: Request, data: ResetPasswordInput):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    users = _read_json_file(USERS_FILE, [])
    token_hash = _sha256_string(data.token.strip())
    now = datetime.utcnow()

    for user in users:
        reset_meta = user.get("password_reset") or {}
        if reset_meta.get("token_hash") != token_hash:
            continue

        expires_at_raw = reset_meta.get("expiresAt")
        expires_at = _safe_iso_datetime(expires_at_raw) if expires_at_raw else now
        if expires_at < now:
            user.pop("password_reset", None)
            _write_json_file(USERS_FILE, users)
            raise HTTPException(status_code=400, detail="Reset token expired")

        user["password_hash"] = _hash_password(data.new_password)
        user.pop("password_reset", None)
        _write_json_file(USERS_FILE, users)
        return {"ok": True, "message": "Password reset successful"}

    raise HTTPException(status_code=400, detail="Invalid reset token")


@app.post("/auth/logout")
def auth_logout(response: Response, _: None = Depends(require_csrf)):
    _clear_auth_cookie(response)
    _clear_csrf_cookie(response)
    return {"ok": True}


@app.get("/auth/csrf")
def auth_csrf(response: Response, _: str = Depends(get_current_user_id)):
    csrf_token = _generate_csrf_token()
    _set_csrf_cookie(response, csrf_token)
    return {"ok": True, "csrfToken": csrf_token}


@app.post("/predict/productivity")
def predict_productivity(data: ProductivityInput):
    if productivity_model is None:
        return {"error": "Productivity model not loaded"}
    
    features = np.array([
        data.hours_studied,
        data.previous_scores,
        data.extracurricular_activities,
        data.sleep_hours,
        data.sample_question_papers_practiced
    ]).reshape(1, -1)
    
    score = float(productivity_model.predict(features)[0])
    
    if score >= 80:
        message = "Great day! You are highly productive."
    elif score >= 60:
        message = "Decent day. A few more focused hours could help."
    else:
        message = "Tough day. Consider resting and resetting tomorrow."
    
    return {"productivity_score": score, "message": message}


@app.post("/predict/stress")
def predict_stress(data: StressInput):
    if stress_model is None:
        return {"error": "Stress model not loaded"}
    
    features = np.array([
        data.gender,
        data.age,
        data.occupation,
        data.sleep_duration,
        data.quality_of_sleep,
        data.physical_activity_level,
        data.bmi_category,
        data.heart_rate,
        data.daily_steps,
        data.sleep_disorder,
        data.bp_systolic,
        data.bp_diastolic
    ]).reshape(1, -1)
    
    score = float(stress_model.predict(features)[0])
    
    if score <= 4:
        message = "You are doing well. Stress levels are healthy."
    elif score <= 6:
        message = "Moderate stress. Try to get more sleep tonight."
    else:
        message = "High stress detected. Take a break and recharge."

    return {
        "stress_level": score,
        "risk_band": _stress_risk_band(score),
        "message": message,
        "key_drivers": _stress_key_drivers(data),
        "actions": _stress_actions(data, score),
        "expected_impact_range": _expected_impact_range(score),
    }


@app.post("/analytics/events")
@limiter.limit("30/minute")
def ingest_analytics_event(request: Request, data: AnalyticsEventInput):
    if data.name not in ALLOWED_EVENT_NAMES:
        raise HTTPException(status_code=422, detail=f"Unknown event name '{data.name}'")

    event = {
        "name": data.name,
        "timestamp": data.timestamp or datetime.utcnow().isoformat(),
        "metadata": data.metadata or {},
    }

    with open(ANALYTICS_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")

    return {"status": "ok"}


@app.get("/analytics/funnel")
def get_analytics_funnel(window_days: int = 30):
    if not 1 <= window_days <= 365:
        raise HTTPException(status_code=422, detail="window_days must be between 1 and 365")
    events = _read_analytics_events()
    return _compute_funnel_metrics(events, window_days)


@app.get("/analytics/funnel/export", response_class=PlainTextResponse)
def export_analytics_funnel(window_days: int = 30):
    events = _read_analytics_events()
    metrics = _compute_funnel_metrics(events, window_days)

    csv_lines = [
        "window_days,prediction_viewed,action_viewed,action_completed,trial_started,action_view_rate,action_completion_rate,trial_conversion_rate",
        (
            f"{metrics['window_days']},{metrics['prediction_viewed']},{metrics['action_viewed']},"
            f"{metrics['action_completed']},{metrics['trial_started']},{metrics['action_view_rate']:.6f},"
            f"{metrics['action_completion_rate']:.6f},{metrics['trial_conversion_rate']:.6f}"
        ),
    ]
    return "\n".join(csv_lines)


@app.get("/product/snapshot")
def get_product_snapshot():
    events = _read_analytics_events()
    funnel_30d = _compute_funnel_metrics(events, 30)

    providers: dict[str, dict[str, Any]] = {}
    configured_count = 0
    for key, meta in SUPPORTED_PROVIDERS.items():
        configured = bool(os.environ.get(meta["client_id_env"], ""))
        if configured:
            configured_count += 1
        providers[key] = {
            "name": meta["name"],
            "description": meta["description"],
            "configured": configured,
            "setup_url": meta["setup_url"],
        }

    return {
        "product": {
            "name": "RectoTime",
            "tagline": "A time-aware operating system for focused work",
            "version": "1.1",
            "generated_at": datetime.utcnow().isoformat(),
        },
        "system": {
            "api_status": "healthy",
            "models_loaded": {
                "productivity": productivity_model is not None,
                "stress": stress_model is not None,
            },
            "analytics_events": len(events),
        },
        "integrations": {
            "providers_total": len(SUPPORTED_PROVIDERS),
            "providers_configured": configured_count,
            "providers": providers,
        },
        "growth": {
            "analytics_30d": funnel_30d,
            "focus_loops": [
                {
                    "title": "Sense",
                    "description": "Capture health, activity, and workflow signals automatically.",
                },
                {
                    "title": "Decide",
                    "description": "Translate signals into predictions, priorities, and next-best actions.",
                },
                {
                    "title": "Protect",
                    "description": "Prevent burnout with stress-aware pacing and recovery guidance.",
                },
            ],
        },
    }


# ─────────────────────────────────────────────────────────
# WEARABLE / THIRD-PARTY HEALTH INTEGRATION
# ─────────────────────────────────────────────────────────

TOKENS_FILE = os.path.join(BASE_DIR, "wearable_tokens.json")
WEARABLE_DATA_FILE = os.path.join(BASE_DIR, "wearable_data.json")

# Provider registry.  OAuth credentials are read from env vars — never hard-coded.
SUPPORTED_PROVIDERS: Dict[str, Dict[str, str]] = {
    "strava": {
        "name": "Strava",
        "description": "Walk/run/cycling activity data",
        "auth_base": "https://www.strava.com/oauth/authorize",
        "token_url": "https://www.strava.com/oauth/token",
        "scopes": "read,activity:read_all",
        "client_id_env": "STRAVA_CLIENT_ID",
        "setup_url": "https://www.strava.com/settings/api",
    },
    "fitbit": {
        "name": "Fitbit",
        "description": "Heart rate, sleep, steps and activity",
        "auth_base": "https://www.fitbit.com/oauth2/authorize",
        "scopes": "heartrate sleep activity profile",
        "client_id_env": "FITBIT_CLIENT_ID",
        "setup_url": "https://dev.fitbit.com/apps/new",
    },
    "garmin": {
        "name": "Garmin Connect",
        "description": "HR, HRV, sleep stages and activity",
        "auth_base": "https://connect.garmin.com/oauthConfirm",
        "scopes": "HEALTH_SLEEP HEALTH_HEART_RATE HEALTH_ACTIVITY",
        "client_id_env": "GARMIN_CLIENT_ID",
        "setup_url": "https://developer.garmin.com",
    },
    "oura": {
        "name": "Oura Ring",
        "description": "Readiness score, sleep and HR data",
        "auth_base": "https://cloud.ouraring.com/oauth/authorize",
        "scopes": "daily sleep personal",
        "client_id_env": "OURA_CLIENT_ID",
        "setup_url": "https://cloud.ouraring.com/docs",
    },
    "terra": {
        "name": "Terra (Samsung / Apple / Withings)",
        "description": "Universal aggregator covering 50+ devices and apps",
        "auth_base": "https://widget.tryterra.co/session",
        "scopes": "all",
        "client_id_env": "TERRA_API_KEY",
        "setup_url": "https://tryterra.co/dashboard",
    },
}


class WearableMetrics(BaseModel):
    user_id: str
    provider: str
    heart_rate: Optional[float] = None          # resting HR bpm
    hrv: Optional[float] = None                  # HRV ms if available
    sleep_duration: Optional[float] = None       # hours
    sleep_quality_score: Optional[float] = None  # 0-10 proxy
    daily_steps: Optional[int] = None
    active_minutes: Optional[int] = None
    timestamp: Optional[str] = None


class StressLiteInput(BaseModel):
    """Wearable-only stress prediction — no manual demographic fields needed."""
    heart_rate: Optional[float] = None
    sleep_duration: Optional[float] = None
    sleep_quality_score: Optional[float] = None
    daily_steps: Optional[int] = None
    active_minutes: Optional[int] = None
    hrv: Optional[float] = None
    # Optional 0-5 self-report to improve calibration.
    self_report: Optional[int] = None


def _read_json_file(path: str, default: Any) -> Any:
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return default


def _write_json_file(path: str, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)


def _normalize_activity_level(active_minutes: Optional[int]) -> int:
    """Convert wearable active-minutes to the 1-5 model scale."""
    if active_minutes is None:
        return 2
    if active_minutes >= 60:
        return 5
    if active_minutes >= 45:
        return 4
    if active_minutes >= 30:
        return 3
    if active_minutes >= 15:
        return 2
    return 1


def _stress_features_from_lite(data: StressLiteInput) -> np.ndarray:
    """
    Build the 12-feature vector the trained model expects, filling in
    population-mean defaults for demographic fields not available from wearables.
    Defaults are derived from Sleep Health and Lifestyle dataset averages.
    """
    sleep_dur = data.sleep_duration if data.sleep_duration is not None else 6.5
    sleep_qual = int(data.sleep_quality_score) if data.sleep_quality_score is not None else 6
    activity = _normalize_activity_level(data.active_minutes)
    hr = int(data.heart_rate) if data.heart_rate is not None else 75
    steps = data.daily_steps if data.daily_steps is not None else 7000

    return np.array([
        1,    # gender — neutral default
        35,   # age — population midpoint
        4,    # occupation — Manager (median code)
        sleep_dur,
        sleep_qual,
        activity,
        1,    # bmi_category — Normal Weight
        hr,
        steps,
        0,    # sleep_disorder — not captured by wearable
        120,  # bp_systolic — normal
        80,   # bp_diastolic — normal
    ]).reshape(1, -1)


def _stress_key_drivers_lite(data: StressLiteInput) -> list:
    drivers = []
    if data.sleep_duration is not None:
        drivers.append(("sleep_duration", max(0.0, 7.5 - data.sleep_duration)))
    if data.sleep_quality_score is not None:
        drivers.append(("sleep_quality", max(0.0, 8 - data.sleep_quality_score)))
    if data.heart_rate is not None:
        drivers.append(("heart_rate", max(0.0, data.heart_rate - 72) / 15))
    if data.daily_steps is not None:
        drivers.append(("daily_steps", max(0.0, 9000 - data.daily_steps) / 3000))
    if data.active_minutes is not None:
        drivers.append(("activity", max(0.0, 30 - data.active_minutes) / 30))
    drivers.sort(key=lambda item: item[1], reverse=True)
    top = [name for name, weight in drivers if weight > 0]
    return top[:3] if top else ["maintenance"]


def _stress_actions_lite(data: StressLiteInput, score: float) -> list:
    actions = []
    sleep_dur = data.sleep_duration or 7.0
    steps = data.daily_steps or 7000
    hr = data.heart_rate or 72
    active = data.active_minutes or 30

    if sleep_dur < 7:
        actions.append({
            "title": "Sleep Wind-down",
            "description": "Add a 30-minute no-screen wind-down before bed.",
            "frequency": "daily",
            "minutes": 30,
        })
    if steps < 8000 or active < 30:
        actions.append({
            "title": "Micro Walk",
            "description": "Take a 10-minute walk after lunch to reset stress.",
            "frequency": "daily",
            "minutes": 10,
        })
    if hr > 80:
        actions.append({
            "title": "Breathing Reset",
            "description": "Use box breathing for 5 minutes during high-pressure moments.",
            "frequency": "2x daily",
            "minutes": 5,
        })
    if score > 6 and len(actions) < 3:
        actions.append({
            "title": "Focus Break Blocks",
            "description": "Schedule a 5-minute break every 50 minutes of work.",
            "frequency": "workdays",
            "minutes": 5,
        })
    if not actions:
        actions.append({
            "title": "Keep Current Routine",
            "description": "Your wearable data looks balanced. Keep it up!",
            "frequency": "daily",
            "minutes": 10,
        })
    return actions[:3]


def _exchange_strava_code_for_token(code: str) -> Dict[str, Any]:
    """Exchange Strava authorization code for access token details."""
    client_id = os.environ.get("STRAVA_CLIENT_ID", "")
    client_secret = os.environ.get("STRAVA_CLIENT_SECRET", "")

    if not client_id or not client_secret:
        return {
            "error": "Strava credentials not configured. Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.",
        }

    payload = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        SUPPORTED_PROVIDERS["strava"]["token_url"],
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            body = response.read().decode("utf-8")
            token_data = json.loads(body)
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        return {"error": f"Strava token exchange failed: {exc.code}", "details": details}
    except (urllib.error.URLError, TimeoutError) as exc:
        return {"error": f"Strava token exchange network error: {exc}"}
    except json.JSONDecodeError:
        return {"error": "Strava token exchange returned invalid JSON"}

    if "access_token" not in token_data:
        return {"error": "Strava token response missing access_token", "details": token_data}

    expires_in = int(token_data.get("expires_in", 21600))
    expires_at = (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat()

    return {
        "connected": True,
        "connected_at": datetime.utcnow().isoformat(),
        "token_type": token_data.get("token_type", "Bearer"),
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token"),
        "expires_at": expires_at,
        "athlete": token_data.get("athlete", {}),
        "scopes": token_data.get("scope", ""),
    }


def _refresh_strava_token(refresh_token: str) -> Dict[str, Any]:
    client_id = os.environ.get("STRAVA_CLIENT_ID", "")
    client_secret = os.environ.get("STRAVA_CLIENT_SECRET", "")

    if not client_id or not client_secret:
        return {"error": "Strava credentials not configured for token refresh."}

    payload = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        SUPPORTED_PROVIDERS["strava"]["token_url"],
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            token_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        return {"error": f"Strava refresh failed: {exc.code}", "details": details}
    except (urllib.error.URLError, TimeoutError) as exc:
        return {"error": f"Strava refresh network error: {exc}"}
    except json.JSONDecodeError:
        return {"error": "Strava refresh returned invalid JSON"}

    if "access_token" not in token_data:
        return {"error": "Strava refresh response missing access_token", "details": token_data}

    expires_in = int(token_data.get("expires_in", 21600))
    return {
        "access_token": token_data.get("access_token"),
        "refresh_token": token_data.get("refresh_token", refresh_token),
        "token_type": token_data.get("token_type", "Bearer"),
        "expires_at": (datetime.utcnow() + timedelta(seconds=expires_in)).isoformat(),
        "athlete": token_data.get("athlete", {}),
        "scopes": token_data.get("scope", ""),
    }


def _strava_get_activities(access_token: str, per_page: int = 20) -> Dict[str, Any]:
    url = f"https://www.strava.com/api/v3/athlete/activities?per_page={per_page}"
    request = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            data = json.loads(response.read().decode("utf-8"))
            return {"activities": data}
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="ignore")
        return {"error": f"Strava activities fetch failed: {exc.code}", "details": details}
    except (urllib.error.URLError, TimeoutError) as exc:
        return {"error": f"Strava activities network error: {exc}"}
    except json.JSONDecodeError:
        return {"error": "Strava activities returned invalid JSON"}


def _aggregate_strava_metrics(activities: list, user_id: str) -> Dict[str, Any]:
    if not activities:
        return {
            "user_id": user_id,
            "provider": "strava",
            "daily_steps": 0,
            "active_minutes": 0,
            "heart_rate": None,
            "workout_count": 0,
            "sleep_duration": None,
            "sleep_quality_score": None,
            "timestamp": datetime.utcnow().isoformat(),
        }

    today = datetime.utcnow().date().isoformat()
    todays = [a for a in activities if str(a.get("start_date_local", "")).startswith(today)]
    selected = todays if todays else activities[:5]

    total_seconds = 0.0
    total_steps_est = 0
    hr_values = []

    for item in selected:
        moving_time = float(item.get("moving_time", 0) or 0)
        total_seconds += moving_time
        item_type = str(item.get("type", "")).lower()

        if item_type in {"walk", "hike", "run"}:
            # Strava does not always provide steps; estimate from distance.
            distance_m = float(item.get("distance", 0) or 0)
            total_steps_est += int(distance_m / 0.8)

        avg_hr = item.get("average_heartrate")
        if isinstance(avg_hr, (int, float)):
            hr_values.append(float(avg_hr))

    if total_steps_est == 0:
        # Fallback estimate based on active minutes to avoid zeros for cycling/swim.
        total_steps_est = int((total_seconds / 60.0) * 90)

    avg_hr_value = round(sum(hr_values) / len(hr_values), 1) if hr_values else None

    return {
        "user_id": user_id,
        "provider": "strava",
        "daily_steps": max(0, total_steps_est),
        "active_minutes": int(total_seconds / 60.0),
        "heart_rate": avg_hr_value,
        "workout_count": len(selected),
        "sleep_duration": None,
        "sleep_quality_score": None,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── Wearable endpoints ──────────────────────────────────

@app.get("/integrations/providers")
def list_providers():
    result = {}
    for key, meta in SUPPORTED_PROVIDERS.items():
        configured = bool(os.environ.get(meta["client_id_env"], ""))
        result[key] = {
            "name": meta["name"],
            "description": meta["description"],
            "configured": configured,
        }
    return result


@app.post("/integrations/connect")
def start_oauth(
    data: OAuthConnectInput,
    user_id: str = Depends(get_current_user_id),
    _: None = Depends(require_csrf),
):
    provider = data.provider
    redirect_uri = data.redirect_uri
    # Validate redirect_uri against whitelist to prevent OAuth token hijacking.
    if redirect_uri not in ALLOWED_REDIRECT_URIS:
        raise HTTPException(status_code=400, detail="Invalid redirect_uri")

    if provider not in SUPPORTED_PROVIDERS:
        return {"error": f"Unknown provider: {provider}"}

    meta = SUPPORTED_PROVIDERS[provider]
    client_id = os.environ.get(meta["client_id_env"], "")

    if not client_id:
        return {
            "status": "not_configured",
            "message": f"Set the {meta['client_id_env']} environment variable to enable {meta['name']}.",
            "setup_url": meta["setup_url"],
        }

    state = secrets.token_urlsafe(24)
    tokens = _read_json_file(TOKENS_FILE, {})
    tokens.setdefault("_pending_states", {})[state] = {
        "user_id": user_id,
        "provider": provider,
    }
    _write_json_file(TOKENS_FILE, tokens)

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": meta["scopes"],
        "state": state,
    }
    oauth_url = f"{meta['auth_base']}?{urllib.parse.urlencode(params)}"
    return {"oauth_url": oauth_url, "state": state}


@app.get("/integrations/callback")
def oauth_callback(code: str, state: str, provider: Optional[str] = None):
    tokens = _read_json_file(TOKENS_FILE, {})
    pending = tokens.get("_pending_states", {})

    if state not in pending:
        return {"error": "Invalid or expired OAuth state. Please reconnect."}

    session = pending.pop(state)
    user_id = session["user_id"]
    state_provider = session["provider"]

    if provider and provider != state_provider:
        return {"error": "Provider mismatch for OAuth state."}

    provider = state_provider

    provider_token_record: Dict[str, Any]
    if provider == "strava":
        provider_token_record = _exchange_strava_code_for_token(code)
        if provider_token_record.get("error"):
            _write_json_file(TOKENS_FILE, tokens)
            return {
                "error": provider_token_record["error"],
                "details": provider_token_record.get("details"),
            }
    else:
        # Non-Strava providers still use placeholder flow for now.
        # In production, exchange code for access/refresh tokens per provider.
        provider_token_record = {
            "connected": True,
            "connected_at": datetime.utcnow().isoformat(),
            "code": code,
        }

    tokens.setdefault(user_id, {})[provider] = provider_token_record
    _write_json_file(TOKENS_FILE, tokens)
    return {"status": "connected", "provider": provider, "user_id": user_id}


@app.get("/integrations/status")
def get_integration_status(user_id: str = Depends(get_current_user_id)):
    tokens = _read_json_file(TOKENS_FILE, {})
    user_tokens = tokens.get(user_id, {})
    connected = {
        k: {"connected_at": v["connected_at"]}
        for k, v in user_tokens.items()
        if v.get("connected")
    }
    return {"user_id": user_id, "connected_providers": connected}


@app.delete("/integrations/disconnect")
def disconnect_provider(
    provider: str,
    user_id: str = Depends(get_current_user_id),
    _: None = Depends(require_csrf),
):
    tokens = _read_json_file(TOKENS_FILE, {})
    if user_id in tokens and provider in tokens[user_id]:
        del tokens[user_id][provider]
        _write_json_file(TOKENS_FILE, tokens)

    data = _read_json_file(WEARABLE_DATA_FILE, {})
    key = f"{user_id}:{provider}"
    if key in data:
        del data[key]
        _write_json_file(WEARABLE_DATA_FILE, data)

    return {"status": "disconnected", "provider": provider}


@app.post("/integrations/sync-now")
def sync_provider_now(
    provider: str,
    user_id: str = Depends(get_current_user_id),
    _: None = Depends(require_csrf),
):
    tokens = _read_json_file(TOKENS_FILE, {})
    user_provider = tokens.get(user_id, {}).get(provider)

    if not user_provider or not user_provider.get("connected"):
        return {"error": f"Provider '{provider}' is not connected for this user."}

    if provider != "strava":
        return {
            "status": "not_supported_yet",
            "message": f"Sync now for '{provider}' is not implemented yet.",
        }

    access_token = user_provider.get("access_token")
    expires_at_raw = user_provider.get("expires_at")

    if not access_token:
        return {"error": "Connected Strava account missing access token. Reconnect required."}

    expires_at = _safe_iso_datetime(expires_at_raw) if expires_at_raw else datetime.utcnow()
    if expires_at <= datetime.utcnow() + timedelta(minutes=1):
        refresh_token = user_provider.get("refresh_token")
        if not refresh_token:
            return {"error": "Strava token expired and no refresh token available. Reconnect required."}
        refreshed = _refresh_strava_token(refresh_token)
        if refreshed.get("error"):
            return refreshed
        user_provider.update(refreshed)
        tokens.setdefault(user_id, {})[provider] = user_provider
        _write_json_file(TOKENS_FILE, tokens)
        access_token = user_provider.get("access_token")

    fetched = _strava_get_activities(access_token)
    if fetched.get("error"):
        return fetched

    metrics = _aggregate_strava_metrics(fetched.get("activities", []), user_id)
    data = _read_json_file(WEARABLE_DATA_FILE, {})
    key = f"{user_id}:{provider}"
    data[key] = {
        **metrics,
        "synced_at": datetime.utcnow().isoformat(),
    }
    _write_json_file(WEARABLE_DATA_FILE, data)

    return {
        "status": "ok",
        "provider": provider,
        "user_id": user_id,
        "metrics": data[key],
    }


@app.post("/integrations/webhook")
def receive_wearable_webhook(
    metrics: WearableMetrics,
    x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret"),
):
    """Receive wearable health data via webhook.
    Validate with X-Webhook-Secret header when WEBHOOK_SECRET env var is set.
    """
    webhook_secret = os.environ.get("WEBHOOK_SECRET", "")
    if webhook_secret and x_webhook_secret != webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    data = _read_json_file(WEARABLE_DATA_FILE, {})
    key = f"{metrics.user_id}:{metrics.provider}"
    data[key] = {
        **metrics.dict(),
        "synced_at": datetime.utcnow().isoformat(),
    }
    _write_json_file(WEARABLE_DATA_FILE, data)
    return {"status": "ok"}


@app.get("/health/latest")
def get_latest_health_metrics(
    provider: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    data = _read_json_file(WEARABLE_DATA_FILE, {})

    if provider:
        entry = data.get(f"{user_id}:{provider}")
        if not entry:
            return {"error": "No synced data found for this provider"}
        return entry

    user_entries = {k: v for k, v in data.items() if k.startswith(f"{user_id}:")}
    if not user_entries:
        return {"error": "No synced data found"}

    latest = sorted(
        user_entries.values(),
        key=lambda x: x.get("synced_at", ""),
        reverse=True,
    )[0]
    return latest


@app.post("/predict/stress/lite")
def predict_stress_lite(data: StressLiteInput):
    """Stress prediction from wearable-only inputs — no manual form needed."""
    if stress_model is None:
        return {"error": "Stress model not loaded"}

    features = _stress_features_from_lite(data)
    score = float(stress_model.predict(features)[0])

    # Blend with optional self-report (0-5 → 3-8 scale) at 30% weight.
    if data.self_report is not None:
        self_report_scaled = 3.0 + (data.self_report / 5.0) * 5.0
        score = 0.7 * score + 0.3 * self_report_scaled

    if score <= 4:
        message = "You are doing well. Stress levels are healthy."
    elif score <= 6:
        message = "Moderate stress. Try to get more sleep tonight."
    else:
        message = "High stress detected. Take a break and recharge."

    return {
        "stress_level": score,
        "risk_band": _stress_risk_band(score),
        "message": message,
        "key_drivers": _stress_key_drivers_lite(data),
        "actions": _stress_actions_lite(data, score),
        "expected_impact_range": _expected_impact_range(score),
        "source": "wearable",
    }
