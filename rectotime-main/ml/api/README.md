# Rectotime ML API

FastAPI backend for rectotime's productivity and stress prediction using trained ML models.

## Overview

This API exposes two machine learning models trained on student performance and sleep health datasets:
- **Productivity Model**: Linear Regression predicting productivity scores (0-100)
- **Stress Model**: XGBoost predicting stress levels (3-8)

## Setup

### Prerequisites
- Python 3.8+
- pip or conda

### Installation

```bash
cd ml/api
pip install fastapi uvicorn pydantic joblib numpy
```

### Running the Server

```bash
# From ml/api directory
python -m uvicorn main:app --reload
```

The server starts at `http://127.0.0.1:8000`

## API Endpoints

### Authentication Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google` (Google ID token sign-in)
- `POST /auth/forgot-password` (requests reset email)
- `POST /auth/reset-password` (sets new password with reset token)
- `POST /auth/logout`
- `GET /auth/csrf`

Auth behavior notes:
- User email and password hash are stored in `ml/api/users.json`.
- Passwords are never stored in plaintext (bcrypt hash only).
- Session auth uses HttpOnly cookie + CSRF double-submit token.

### GET /
Returns API status

**Response:**
```json
{"message": "rectotime ML API is running"}
```

### POST /predict/productivity
Predicts student productivity score based on study habits and sleep.

**Request:**
```json
{
  "hours_studied": 5.0,
  "previous_scores": 75.0,
  "extracurricular_activities": 1,
  "sleep_hours": 7.0,
  "sample_question_papers_practiced": 10
}
```

**Response:**
```json
{
  "productivity_score": 62.48,
  "message": "Decent day. A few more focused hours could help."
}
```

**Score Interpretation:**
- ≥80: "Great day! You are highly productive."
- 60-80: "Decent day. A few more focused hours could help."
- <60: "Tough day. Consider resting and resetting tomorrow."

### POST /predict/stress
Predicts user stress level based on health and lifestyle metrics.

**Request:**
```json
{
  "gender": 1,
  "age": 25,
  "occupation": 2,
  "sleep_duration": 7.0,
  "quality_of_sleep": 8,
  "physical_activity_level": 3,
  "bmi_category": 1,
  "heart_rate": 70,
  "daily_steps": 8000,
  "sleep_disorder": 0,
  "bp_systolic": 120,
  "bp_diastolic": 80
}
```

**Response:**
```json
{
  "stress_level": 3.05,
  "risk_band": "low",
  "message": "You are doing well. Stress levels are healthy.",
  "key_drivers": ["maintenance"],
  "actions": [
    {
      "title": "Keep Current Routine",
      "description": "Your habits look balanced. Maintain sleep and activity consistency.",
      "frequency": "daily",
      "minutes": 10
    }
  ],
  "expected_impact_range": {
    "min": -0.1,
    "max": -0.3,
    "window_days": 7
  }
}
```

**Stress Level Interpretation:**
- ≤4: "You are doing well. Stress levels are healthy."
- 4-6: "Moderate stress. Try to get more sleep tonight."
- >6: "High stress detected. Take a break and recharge."

### POST /analytics/events
Stores product analytics events (prediction view, action view/completion, trial starts).

**Request:**
```json
{
  "name": "prediction_viewed",
  "timestamp": "2026-03-13T09:00:00.000Z",
  "metadata": {
    "module": "ml_insights"
  }
}
```

**Response:**
```json
{"status": "ok"}
```

### GET /analytics/funnel
Returns 30-day (or custom window) funnel metrics.

**Query Params:**
- `window_days` (optional, default `30`)

**Response:**
```json
{
  "window_days": 30,
  "prediction_viewed": 120,
  "action_viewed": 76,
  "action_completed": 40,
  "trial_started": 9,
  "action_view_rate": 0.6333,
  "action_completion_rate": 0.5263,
  "trial_conversion_rate": 0.075
}
```

### GET /analytics/funnel/export
Exports funnel metrics as CSV for reports and investor updates.

**Query Params:**
- `window_days` (optional, default `30`)

**Response (text/csv):**
```csv
window_days,prediction_viewed,action_viewed,action_completed,trial_started,action_view_rate,action_completion_rate,trial_conversion_rate
30,120,76,40,9,0.633333,0.526316,0.075000
```

### POST /integrations/sync-now
Triggers an immediate provider sync (currently implemented for `strava`).

**Query Params:**
- `provider` (example: `strava`)
- `user_id`

**Response:**
```json
{
  "status": "ok",
  "provider": "strava",
  "user_id": "test-user",
  "metrics": {
    "user_id": "test-user",
    "provider": "strava",
    "daily_steps": 8560,
    "active_minutes": 62,
    "heart_rate": 148.5,
    "workout_count": 2,
    "synced_at": "2026-03-14T10:20:00"
  }
}
```

## Interactive API Documentation

Visit `http://127.0.0.1:8000/docs` for interactive Swagger UI documentation.

## CORS Configuration

The API accepts requests from `http://localhost:5173` (Vite dev server).

To modify allowed origins, edit the `CORSMiddleware` configuration in `main.py`:

```python
allow_origins=["http://localhost:5173", "additional-origin"]
```

## Model Files

Required model files in `../models/`:
- `productivity_model.pkl` (Linear Regression)
- `stress_model.pkl` (XGBoost)

The API will start even if models are missing, returning error responses for prediction endpoints.

## Integration Credentials

Set environment variables before using OAuth integrations:

- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `FITBIT_CLIENT_ID` (optional unless using Fitbit)
- `GARMIN_CLIENT_ID` (optional unless using Garmin)
- `OURA_CLIENT_ID` (optional unless using Oura)
- `TERRA_API_KEY` (optional unless using Terra)

## Auth & Security Environment Variables

Set these before deployment:

- `JWT_SECRET_KEY` (required in production)
- `COOKIE_SECURE=true` (required in production HTTPS)
- `COOKIE_SAMESITE=lax` (or `none` with `COOKIE_SECURE=true`)
- `CORS_ORIGINS=https://your-frontend-domain`
- `GOOGLE_CLIENT_ID` (required for `POST /auth/google`)
- `FRONTEND_BASE_URL=https://your-frontend-domain` (used for reset links)

Password reset email delivery:

- `SMTP_HOST`
- `SMTP_PORT` (default `587`)
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_USE_TLS=true`

Reset token controls:

- `RESET_TOKEN_TTL_MINUTES=30`
- `RETURN_RESET_TOKEN=false` (keep `false` in production)

Notes:
- Strava now performs real token exchange in `/integrations/callback`.
- Other providers currently use a placeholder callback path until direct token exchange is implemented.

## Troubleshooting

### "Attribute app not found in module main"

This error occurs if model files fail to load during module import. Check the server logs for specific loading errors.

### CORS Errors

Ensure the frontend origin is in the `allow_origins` list in `main.py`.

### Model Loading Errors

Verify model files exist at `ml/models/` relative to the api directory.
