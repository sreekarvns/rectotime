# Stress Model Entrepreneurship Roadmap (RectoTime)

Date: 2026-03-13
Owner: Product + ML + Frontend

## 1) Business Goal and Positioning

Primary business goal:
- Convert the current stress score feature into a retention and revenue engine.

Product positioning:
- "Personal stress-to-action coach" for students and young professionals.
- Wellness support, not medical diagnosis.

North-star metric:
- Weekly Active Users completing >=3 stress check-ins per week.

Primary revenue hypothesis:
- Users pay for personalization, trends, and accountability loops, not raw predictions.

## 1.1) Wearable Integration Strategy (Reduce Daily Input Friction)

Problem:
- Current stress model asks too many manual fields for daily use.
- Users will not enter blood pressure, occupation code, or multiple health fields every day.

Goal:
- Move from manual input to passive data sync and 1-tap check-in.

Recommended approach (best for current web-first stack):
- Use a third-party wearable aggregator API first (Terra / Human API / Validic class of providers).
- Let users connect existing apps and devices (Fitbit, Garmin, Oura, Samsung ecosystem where supported by provider).
- Keep your app as the product layer for coaching, scoring, and habit loops.

Platform reality:
- Pure web apps cannot directly read Samsung watch sensors.
- For Samsung-specific direct integration, mobile app + platform SDK path is usually required.
- Faster startup path is aggregator OAuth + synced health metrics via backend API.

Daily UX target:
- Day 1 onboarding: Connect wearable account once.
- Daily use: zero manual health form + optional 5-second self check-in ("How stressed do you feel 1-5?").

MVP signal set (auto-collected):
- Resting heart rate
- HRV (if available)
- Sleep duration
- Sleep efficiency/quality proxy
- Daily steps
- Active minutes

Model redesign for low-friction usage:
- Build `Stress Lite` model using only wearable features (+ optional short self-report).
- Keep current full-input model as `Stress Pro` fallback or for research mode.
- Add robust missing-data handling (not all wearables provide HRV).

Backend architecture additions:
- `POST /integrations/connect` -> start provider OAuth
- `GET /integrations/callback` -> exchange token
- `POST /integrations/webhook` -> ingest wearable updates
- `GET /health/latest` -> normalized latest metrics per user
- `POST /predict/stress/lite` -> no-manual-input stress prediction

Security and compliance baseline:
- Explicit consent screen for health data collection
- Data minimization (store only required metrics)
- Revocation flow (disconnect provider + delete synced data)
- Wellness disclaimer (non-medical use)

Provider decision framework:
- Integration speed: SDK/API docs quality, webhook support
- Coverage: Fitbit/Garmin/Oura/Samsung route support
- Cost: MAU/API call pricing and startup credits
- Reliability: sync lag and uptime

2-week execution sprint (implementation order):
1. Pick aggregator vendor and create sandbox app credentials.
2. Add integration tables and encrypted token storage in backend.
3. Build connect/disconnect UI and provider status card.
4. Implement webhook ingestion and feature normalization job.
5. Ship `stress_lite` endpoint and front-end auto-predict card.
6. Track activation KPI: `% users who connect wearable in first session`.

Core KPIs for this change:
- Form abandonment rate down by >=50%
- Stress check-ins/user/week up to >=3
- Day-7 retention uplift >=10% for connected users

## 1.2) Beyond Wearables: Phone Health Ecosystems + Global App Integrations

Objective:
- Support users who only use phone apps (no smartwatch) and users who already track activity in popular third-party platforms.

Important platform constraints:
- Apple HealthKit and Samsung Health are best supported through mobile app integrations.
- Web-only apps usually need an aggregator or backend connector, not direct on-device sensor access.
- Strava and similar services are API-friendly via OAuth and work well for web + mobile products.

Recommended integration layers:
- Layer 1 (Fast launch): Aggregator provider for broad multi-device coverage.
- Layer 2 (Direct high-value): Strava + Google Fit route where API access is straightforward.
- Layer 3 (Deep ecosystem): Native iOS/Android bridges for Apple Health and Samsung Health quality and reliability.

Global integration candidates (brainstormed and prioritized):

Tier A: Integrate first (largest ROI)
- Apple Health (iPhone ecosystem): steps, heart rate, sleep, workouts.
- Samsung Health (Samsung Android ecosystem): steps, heart rate, sleep, activity.
- Google Fit / Health Connect path (Android-wide): normalized fitness/health records.
- Strava: walks/runs/cycling, strong daily activity adherence signal.

Tier B: Integrate next (strong wellness audience)
- Fitbit: large global installed base.
- Garmin Connect: active user segment with detailed metrics.
- Oura: high-quality sleep/readiness data for stress estimation.
- WHOOP: recovery/strain segment for stress + fatigue indicators.

Tier C: Optional expansion (regional/niche value)
- Huawei Health (large in specific regions).
- Xiaomi Mi Fitness / Zepp Life ecosystem.
- Polar Flow and Suunto (sports-focused users).
- Withings (sleep + health device users).

Third-party app categories to include:
- Activity and cardio: Strava, Nike Run Club, Adidas Running.
- Meditation and recovery: Calm, Headspace, Balance (if partner APIs available).
- Sleep-focused apps: Sleep Cycle and similar providers with export/API support.

What to sync from each source (minimum viable schema):
- date
- total_steps
- resting_heart_rate
- sleep_duration_minutes
- active_minutes
- workout_count
- source_provider

Nice-to-have fields:
- HRV
- sleep_score/readiness
- resting HR trend (7-day)
- workout intensity zones

Normalization strategy:
- Build one internal schema and map every provider into it.
- Add source-specific quality flags (`high_confidence`, `estimated`, `missing`).
- Use feature fallback hierarchy (e.g., if HRV missing, rely more on sleep + resting HR + steps).

Sign-up and connection flows to reduce friction:
- "Continue with Apple Health" (in iOS app)
- "Continue with Samsung Health" (in Android app)
- "Connect Strava" (web + mobile)
- "Connect later" + temporary 1-question daily self-report

Recommended rollout order (pragmatic):
1. Ship aggregator + Strava OAuth first (quick wins for web users).
2. Add Android Health Connect pathway (covers many Android apps/devices).
3. Add iOS HealthKit bridge (Apple users).
4. Add Samsung Health deep link/SDK path in Android app.
5. Expand to Fitbit/Garmin/Oura/WHOOP direct if needed for cost/performance.

Business KPI impact expected from this wider integration strategy:
- Connection rate (first week) >=35%
- Daily stress auto-check usage >=50% of active users
- Manual form usage share <20% after 30 days
- Retention uplift strongest in connected cohorts vs non-connected cohorts

## 1.3) Execution Checklist: Engineering Tickets by Sprint

Use this as the implementation backlog for the broader integration plan.

### Sprint 1 (Week 1): Foundation and data model

Backend tickets:
- Ticket B1.1: Create normalized health schema and provider mapping contract.
  - Files: `ml/api/main.py`
  - Deliverables:
    - `NormalizedHealthMetrics` model with fields:
      - `date`, `total_steps`, `resting_heart_rate`, `sleep_duration_minutes`, `active_minutes`, `workout_count`, `source_provider`
      - optional: `hrv`, `sleep_score`, `readiness_score`
    - mapping helper functions per provider
  - Acceptance criteria:
    - incoming payloads from 2 providers map into normalized schema
    - missing fields do not crash processing

- Ticket B1.2: Add persistent tables/files for integrations and health records.
  - Files: `ml/api/main.py` (or future DB module)
  - Deliverables:
    - `integrations` store (user, provider, connected, token metadata)
    - `health_metrics` store (user, provider, normalized metrics, synced_at)
  - Acceptance criteria:
    - user can connect/disconnect and latest record persists

Frontend tickets:
- Ticket F1.1: Add integration state model to dashboard.
  - Files: `src/components/Dashboard/MLInsights.tsx`, `src/types/index.ts`
  - Deliverables:
    - provider list UI model
    - connection status badges
  - Acceptance criteria:
    - connected/disconnected state survives refresh

Analytics tickets:
- Ticket A1.1: Track connection funnel events.
  - Files: `src/components/Dashboard/MLInsights.tsx`, `src/utils/storage.ts`, `ml/api/main.py`
  - Events:
    - `integration_connect_clicked`
    - `integration_connect_success`
    - `integration_connect_failed`
  - Acceptance criteria:
    - funnel counts visible in analytics panel

### Sprint 2 (Week 2): OAuth connectors (Strava + aggregator first)

Backend tickets:
- Ticket B2.1: Strava OAuth implementation.
  - Files: `ml/api/main.py`
  - Endpoints:
    - `GET /integrations/connect?provider=strava`
    - `GET /integrations/callback`
    - `DELETE /integrations/disconnect`
  - Acceptance criteria:
    - user can connect Strava and store token metadata securely

- Ticket B2.2: Aggregator OAuth path (Terra/Human API/Validic route).
  - Files: `ml/api/main.py`
  - Endpoints:
    - `GET /integrations/providers`
    - `GET /integrations/connect`
    - `POST /integrations/webhook`
  - Acceptance criteria:
    - at least one aggregator provider can push data to webhook

Frontend tickets:
- Ticket F2.1: Provider cards and onboarding copy.
  - Files: `src/components/Dashboard/MLInsights.tsx`
  - Deliverables:
    - provider cards for Strava, Samsung route, Apple route, aggregator
    - setup/error messaging
  - Acceptance criteria:
    - all provider buttons trigger connect flow and show result states

### Sprint 3 (Week 3): Phone ecosystem integration paths

Backend tickets:
- Ticket B3.1: Add Android Health Connect ingestion adapter.
  - Files: `ml/api/main.py` (API contract), mobile bridge module later
  - Endpoint:
    - `POST /integrations/webhook` with `source_provider=health_connect`
  - Acceptance criteria:
    - receives and normalizes Android phone health data

- Ticket B3.2: Add iOS HealthKit ingestion adapter.
  - Files: `ml/api/main.py` (API contract), mobile bridge module later
  - Endpoint:
    - `POST /integrations/webhook` with `source_provider=apple_health`
  - Acceptance criteria:
    - receives and normalizes iPhone health data

Frontend tickets:
- Ticket F3.1: Phone-first connect CTAs.
  - Files: `src/components/Dashboard/MLInsights.tsx`
  - Deliverables:
    - "Continue with Samsung Health" (Android app flow)
    - "Continue with Apple Health" (iOS app flow)
    - fallback: "Connect Strava"
  - Acceptance criteria:
    - platform-appropriate CTA labels and flow guidance are shown

### Sprint 4 (Week 4): Stress Lite quality and fallback logic

Backend tickets:
- Ticket B4.1: Improve `/predict/stress/lite` fallback logic.
  - Files: `ml/api/main.py`
  - Deliverables:
    - weighted fallback for missing HRV/sleep score
    - source quality score in response (`data_quality`)
  - Acceptance criteria:
    - endpoint works with partial metrics and returns confidence band

- Ticket B4.2: Add daily auto-prediction job endpoint.
  - Files: `ml/api/main.py`
  - Endpoint:
    - `POST /predict/stress/lite/daily-run` (internal trigger)
  - Acceptance criteria:
    - daily predictions generated for connected users

Frontend tickets:
- Ticket F4.1: Reduce manual form prominence.
  - Files: `src/components/Dashboard/MLInsights.tsx`
  - Deliverables:
    - manual form hidden by default when provider connected
    - one-tap auto-check button as primary action
  - Acceptance criteria:
    - >=80% of stress predictions in QA come from auto-check path

### Sprint 5 (Week 5): Reporting, segmentation, and growth experiments

Backend tickets:
- Ticket B5.1: Segment analytics by source/provider.
  - Files: `ml/api/main.py`
  - Endpoint:
    - `GET /analytics/funnel/by-source?window_days=30`
  - Acceptance criteria:
    - separate funnel metrics for `strava`, `apple_health`, `samsung_health`, `aggregator`

- Ticket B5.2: Export provider-level CSV reports.
  - Files: `ml/api/main.py`
  - Endpoint:
    - `GET /analytics/funnel/export?window_days=30&group_by=source`
  - Acceptance criteria:
    - CSV includes provider-level conversion rows

Frontend tickets:
- Ticket F5.1: Add source-filtered funnel view.
  - Files: `src/components/Dashboard/MLInsights.tsx`
  - Deliverables:
    - filter chips for All/Apple/Samsung/Strava/Aggregator
  - Acceptance criteria:
    - panel updates from backend grouped endpoint

## 1.4) Ticket Prioritization Matrix (Must/Should/Could)

Must (ship first):
- Strava OAuth + aggregator connector
- `stress_lite` from normalized metrics
- auto-check primary UX
- analytics funnel for connect -> predict -> action -> trial

Should (ship next):
- Apple Health and Health Connect adapters
- provider-level funnel segmentation
- quality/confidence scoring for missing data

Could (later optimization):
- direct Samsung Health deep SDK integration in native app
- WHOOP / Polar / Suunto direct connectors
- readiness and HRV advanced trend explainability

## 1.5) Ready-to-Start Tasks for Tomorrow

Task 1:
- Configure provider credentials in environment:
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - `FITBIT_CLIENT_ID`
  - `OURA_CLIENT_ID`
  - `TERRA_API_KEY`

Task 2:
- Add Strava provider entry and callback token exchange in `ml/api/main.py`.

Task 3:
- Add provider source field to every analytics event in `src/components/Dashboard/MLInsights.tsx`.

Task 4:
- Add `data_quality` score in `/predict/stress/lite` response.

Task 5:
- Run a 10-user pilot and track:
  - connection success rate
  - auto-check usage rate
  - D7 retention by connected vs non-connected users

## 2) Target Segments and Value Propositions

Segment A: Students (exam pressure)
- Pain: inconsistent routine, late sleep, anxiety spikes.
- Value: daily action plan + exam-week coping playbook.

Segment B: Remote workers/freelancers
- Pain: blurred work-life boundary, burnout risk.
- Value: stress trend insights + break and sleep interventions.

Segment C: Startup teams (B2B pilot)
- Pain: invisible burnout risk, productivity drops.
- Value: anonymous team wellness trends + manager nudges.

## 3) Packaging and Monetization

Free tier:
- 1 stress prediction/day
- 1 generic recommendation
- 7-day trend preview

Pro tier (B2C): $4.99-$9.99/month test band
- Unlimited check-ins
- Personalized intervention plans
- Weekly stress trend + risk forecast
- Reminders + habit streaks

Team tier (B2B): $2-$6/user/month test band
- Anonymous team dashboard
- Team trend alerts
- Monthly wellness report export

Pricing experiment:
- A/B test $4.99 vs $7.99 for 14 days each cohort.
- Success threshold: paid conversion >=4% from active users.

## 4) Product and Technical Milestones (12 Weeks)

### Phase 1 (Weeks 1-2): Make predictions actionable

Business outcome:
- Improve user-perceived value and day-7 retention.

Implementation:
- Extend stress response from score+message to include:
  - risk_band (low/moderate/high)
  - key_drivers (top 3 factors)
  - actions (3 personalized actions)
  - expected_impact_range (e.g., -0.3 to -0.8 in 7 days)

Current file mapping:
- `ml/api/main.py`: expand `/predict/stress` response contract.
- `src/components/Dashboard/MLInsights.tsx`: render action cards and driver tags.
- `src/types/index.ts`: add StressActionPlan interfaces.

Suggested API response v2:
```json
{
  "stress_level": 6.7,
  "risk_band": "high",
  "message": "High stress detected.",
  "key_drivers": ["sleep_duration", "heart_rate", "daily_steps"],
  "actions": [
    {
      "title": "Sleep Wind-down",
      "description": "30-min no-screen wind-down before bed.",
      "frequency": "daily",
      "minutes": 30
    },
    {
      "title": "Micro Walk",
      "description": "10-min walk after lunch.",
      "frequency": "daily",
      "minutes": 10
    }
  ],
  "expected_impact_range": {
    "min": -0.3,
    "max": -0.8,
    "window_days": 7
  }
}
```

KPI targets:
- +20% increase in stress feature repeat usage.
- D7 retention uplift >=8% among users who open stress insights.

### Phase 2 (Weeks 3-5): Build habit loop and engagement

Business outcome:
- Increase weekly active usage and stickiness.

Implementation:
- Add daily check-in flow and simple streak tracking.
- Show 7-day and 28-day trends (line chart + risk trajectory).
- Trigger reminder notifications for missed check-ins.

Current file mapping:
- `src/components/Dashboard/MLInsights.tsx`: add trend module and daily check-in CTA.
- `src/utils/storage.ts`: persist check-ins locally (or to backend when available).
- `extension/popup.js` and `extension/background.js`: optional reminder nudges.

KPI targets:
- Average check-ins/user/week >=2.5
- WAU/MAU >=0.35

### Phase 3 (Weeks 6-8): Subscription and paywall

Business outcome:
- Validate monetization and willingness to pay.

Implementation:
- Gated features: advanced insights, longer trend windows, and personalized plans.
- Add "upgrade" moments after users see risk trends.
- Add trial: 7-day Pro access on first high-risk detection.

Current file mapping:
- `src/components/Dashboard/MLInsights.tsx`: gate premium components.
- `src/constants/config.ts`: pricing and feature flags.
- `src/contexts/AuthContext.tsx`: entitlement checks.

KPI targets:
- Free -> paid conversion >=4%
- Trial -> paid conversion >=15%
- 30-day paid churn <10%

### Phase 4 (Weeks 9-12): Trust, B2B pilot, and model operations

Business outcome:
- Build defensibility and pilot team plan.

Implementation:
- Add confidence signal and explainability snippet per prediction.
- Add fairness checks (by gender/age groups) and drift monitoring.
- Launch 1-2 team pilots with anonymous aggregate dashboard.

Current file mapping:
- `ml/notebooks/stress_eda.ipynb`: fairness and drift analysis notebook section.
- `ml/api/main.py`: include confidence and explanation payload.
- `README.md` or new docs: wellness disclaimer and privacy policy links.

KPI targets:
- B2B pilot: >=1 signed pilot with >=20 seats
- Team weekly engagement >=50%
- Model drift alerting in place (monthly evaluation)

## 5) Model Improvements That Support Business Outcomes

Current model state:
- Regression score with static thresholds and generic messages.

Improve for product value:
- Add calibration and confidence intervals.
- Add feature attribution (SHAP or permutation importance).
- Convert score into risk bands tuned to retention outcomes.
- Retrain cadence: monthly or when drift threshold breached.

Candidate backend additions:
- `ml/api/main.py`:
  - `/predict/stress` v2 payload
  - `/predict/stress/batch` for weekly trend generation
- `ml/models/`:
  - save model metadata (version, train date, features)

MLOps minimum:
- Store metadata JSON next to model file.
- Add offline evaluation script for RMSE, MAE, calibration.
- Log prediction distribution for drift checks.

## 6) Go-To-Market Execution

Channel 1: Campus and student communities
- Offer "Exam Stress Sprint" challenge for 14 days.
- Incentive: free Pro month for completion.

Channel 2: Creator partnerships
- Productivity and study influencers demonstrate before/after trend charts.

Channel 3: Startup team pilots
- Founders/HR ops get anonymous trend reports and manager tips.

Landing page message tests:
- Variant A: "Reduce stress in 7 days with daily action plans"
- Variant B: "Spot burnout early and recover productivity"

## 7) KPI Dashboard (Weekly)

Acquisition:
- New signups
- Activation rate (first stress prediction in 24h)

Engagement:
- Check-ins/user/week
- Stress insight open rate
- Weekly return rate

Monetization:
- Free->trial conversion
- Trial->paid conversion
- ARPU

Outcomes:
- Avg stress score change after 14 days
- High-risk user reduction rate
- Self-reported wellbeing improvement

## 8) Risks and Controls

Risk: wellness app perceived as medical diagnosis
- Control: explicit non-medical disclaimer and escalation guidance.

Risk: bias from sensitive features
- Control: fairness audits and neutral recommendations.

Risk: low retention despite prediction novelty
- Control: action plans, reminders, and weekly progress narratives.

Risk: data privacy concerns
- Control: minimal data collection, transparent policy, and consent prompts.

## 9) Immediate Sprint Backlog (Next 10 Days)

1. Ship stress response v2 contract with actionable recommendations.
2. Add frontend cards for key drivers and action plan rendering.
3. Add event tracking for prediction, action viewed, action completed.
4. Implement 7-day trend chart from stored check-in history.
5. Add simple paywall stub around advanced trends.

Definition of done:
- End-to-end stress v2 response visible in dashboard.
- Metrics events flowing for retention and monetization funnel.
- One pricing experiment configuration live behind feature flags.

## 10) Suggested Team Split

Product:
- Segment messaging, pricing tests, KPI reviews.

ML:
- Model confidence, explanation, drift checks, retraining pipeline.

Frontend:
- Check-in UX, trend visuals, action cards, premium gates.

Growth:
- Campus pilot and creator campaign execution.
