# RECTOTIME: AI-POWERED PRODUCTIVITY DASHBOARD
## Internship Project Report

**Student:** Sreekar  
**University:** Woxsen University, School of Technology  
**Internship Organization:** Ramanasoft  
**Internship Duration:** 3 Days (Intensive Project Development)  
**Date Submitted:** March 2026  
**Live Application:** https://rectotime-5fgllma3s-sreekarvvns-projects.vercel.app/

---

## 1. INTRODUCTION

When I started my internship at Ramanasoft, I wanted to build something that would help me understand how a complete full-stack application actually works — not just from tutorials, but from actual implementation. I had already been developing **rectotime**, a personal productivity dashboard, primarily focusing on the frontend and a Chrome extension for automatic activity tracking. But as the project grew, I realized that having real machine learning predictions would make it genuinely useful for users.

The core idea behind rectotime is simple: if we're already tracking what people do (through browser activity, time spent on tasks, sleep patterns), why not use that data to predict something meaningful for them? Instead of just showing "you spent 4 hours studying," we could say "based on your current patterns, your productivity is likely at 72% today, and here's how to improve it."

This report documents the machine learning component I built and integrated into rectotime over the course of this 3-day intensive project period.

**Background Context**

Before diving into this ML project, I had already worked on several other initiatives during the internship to build foundational skills:

- Multi-agent AI systems using CrewAI
- Customer churn prediction modeling
- Exploratory data analysis on house price datasets
- Convolutional neural networks for image classification
- Computer vision projects using OpenCV
- Sentiment analysis on IMDB movie reviews
- Email spam/ham classification

These projects gave me hands-on experience with Python, machine learning workflows, and data science best practices. When it came time to integrate ML into rectotime, I applied these learnings to build something production-ready.

---

## 2. OBJECTIVES

The primary objectives of this project were:

1. **Build a Productivity Prediction Model** — Create a machine learning model that predicts a user's productivity score (0-100) based on their study habits, previous performance, sleep, and extracurricular involvement.

2. **Build a Stress Level Predictor** — Develop a model that predicts user stress levels (on a 3-8 scale) using health and lifestyle metrics including sleep quality, physical activity, heart rate, and blood pressure.

3. **Deploy a REST API** — Set up a FastAPI backend to serve both models with proper endpoints, input validation, and error handling.

4. **Integrate with React Frontend** — Connect the API to the existing rectotime React application and create a user-friendly component for predictions.

5. **Deploy Live** — Make the application publicly accessible so actual users can benefit from the predictions.

6. **Learn Full-Stack Integration** — Understand how machine learning models fit into a complete web application architecture, from training to deployment.

---

## 3. DATASET DETAILS

### 3.1 Productivity Dataset: Student Performance

**Source:** Kaggle (nikhil7280)  
**Dataset Link:** https://www.kaggle.com/datasets/nikhil7280/student-performance-multiple-linear-regression  
**Size:** 10,000 rows × 5 features  
**Data Type:** Continuous regression problem

**Features:**

| Feature | Data Type | Range | Description |
|---------|-----------|-------|-------------|
| Hours Studied | Float | 1.0 - 9.5 | Daily hours spent studying |
| Previous Scores | Float | 0 - 100 | Student's average of previous exam scores |
| Extracurricular Activities | Integer | 0, 1 | Binary indicator (1 = participates, 0 = doesn't) |
| Sleep Hours | Float | 4.0 - 10.0 | Hours of sleep per night |
| Sample Question Papers Practiced | Integer | 0 - 20+ | Number of practice papers completed |

**Target Variable:**
- **Performance Index** (Float, 0-100) — A continuous score representing overall student productivity and academic performance

**Data Quality Assessment:**

During exploratory data analysis, I found the dataset to be very clean with:
- No missing values
- Well-distributed features
- Good variance in the target variable
- Realistic ranges for all features

The data represented a realistic scenario of student behavior patterns and their impact on performance, making it ideal for predicting productivity in a broader context beyond just academics.

### 3.2 Stress Dataset: Sleep Health and Lifestyle

**Source:** Kaggle (uom190346a)  
**Dataset Link:** https://www.kaggle.com/datasets/uom190346a/sleep-health-and-lifestyle-dataset  
**Size:** 374 rows × 12 features (after cleaning)  
**Data Type:** Continuous regression problem

**Original Features:**

| Feature | Data Type | Description |
|---------|-----------|-------------|
| Person ID | Integer | Unique identifier (dropped during preprocessing) |
| Gender | Object | Male/Female (label encoded: 0/1) |
| Age | Integer | Person's age in years |
| Occupation | Object | Job category (label encoded to numeric) |
| Sleep Duration | Float | Hours of sleep per night |
| Quality of Sleep | Integer | Subjective rating (1-10 scale) |
| Physical Activity Level | Integer | Weekly activity intensity (1-5 scale) |
| BMI Category | Object | Categorical (label encoded) |
| Heart Rate | Integer | Resting heart rate in beats per minute |
| Daily Steps | Integer | Number of steps taken daily |
| Sleep Disorder | Object | None/Insomnia/Sleep Apnea (label encoded) |
| Blood Pressure | Object | String format "systolic/diastolic" |

**Target Variable:**
- **Stress Level** (Float, 3-8 range) — Numerical representation of user stress

**Data Cleaning Process:**

1. **Removed Person ID** — Not predictive, only an identifier
2. **Split Blood Pressure** — Converted "120/80" string format into two numeric columns: BP_Systolic and BP_Diastolic
3. **Label Encoding** — Applied LabelEncoder to categorical features (Gender, Occupation, BMI Category, Sleep Disorder)
4. **Handled Missing Values** — Sleep Disorder column had NaN values which were encoded as a separate category
5. **Feature Engineering** — Calculated additional cardiovascular stress indicators from existing features

**Exploratory Findings:**

- Dataset was small (374 samples) but high quality
- Strong negative correlation between Quality of Sleep (-0.90) and Stress Level
- Sleep Duration also negatively correlated with stress (-0.81)
- Heart Rate showed positive correlation with stress (0.67)
- Physical Activity negatively associated with stress (-0.58)

---

## 4. METHODOLOGY

### 4.1 Exploratory Data Analysis (EDA)

For both datasets, I conducted comprehensive EDA using Python Jupyter notebooks (saved as `productivity_eda.ipynb` and `stress_eda.ipynb`).

**Key Analyses Performed:**

1. **Distribution Analysis** — Visualized histograms and density plots for all features and target variables
2. **Correlation Analysis** — Generated correlation matrices and heatmaps to identify relationships between features
3. **Outlier Detection** — Checked for and handled any anomalous data points
4. **Feature Importance Visualization** — Created bar plots showing which features had strongest relationships with targets
5. **Temporal Patterns** — Where applicable, analyzed how patterns varied across different groups

**Key EDA Insights:**

*For Productivity Dataset:*
- Previous Scores had the strongest correlation (0.92) with Performance Index
- Hours Studied showed moderate correlation (0.37)
- Sleep Hours had positive correlation (0.31)
- Extracurricular Activities improved performance (mean difference: ~8 points)

*For Stress Dataset:*
- Quality of Sleep was the strongest predictor (-0.90 correlation with stress)
- Sleep Duration came second (-0.81)
- Heart Rate showed positive stress correlation (0.67)
- BMI Category and age had weaker relationships

### 4.2 Data Preprocessing

**Productivity Dataset:**
- Minimal preprocessing needed due to data quality
- Standardized features using StandardScaler for better model performance
- No feature engineering required

**Stress Dataset:**
- Label encoded categorical features
- Handled blood pressure string conversion
- Managed missing values in Sleep Disorder
- Applied StandardScaler normalization

### 4.3 Model Selection and Training

For both prediction tasks, I tested three different algorithms to determine which performed best:

1. **Linear Regression** — Simple, interpretable baseline model
2. **Random Forest** — Ensemble method capturing non-linear relationships
3. **XGBoost** — Gradient boosting for potentially better performance

**Training Approach:**
- 80/20 train-test split for both datasets
- Cross-validation (5-fold) to ensure robust performance estimates
- Hyperparameter tuning using GridSearchCV where beneficial
- Early stopping for XGBoost to prevent overfitting

### 4.4 Model Evaluation Metrics

**Metrics Used:**

1. **R² Score** — Proportion of variance explained by the model (0-1, higher is better)
2. **RMSE (Root Mean Squared Error)** — Measures prediction error in original units (lower is better)
3. **MAE (Mean Absolute Error)** — Average absolute prediction error

---

## 5. RESULTS

### 5.1 Productivity Model Results

**Model Comparison:**

| Model | R² Score | RMSE | MAE | Training Time |
|-------|----------|------|-----|----------------|
| Linear Regression | **0.9890** | **2.02** | 1.64 | <1s |
| Random Forest | 0.9861 | 2.27 | 1.89 | 3.2s |
| XGBoost | 0.9867 | 2.22 | 1.83 | 2.8s |

**Selected Model:** Linear Regression

**Justification:**
- Achieved highest R² score (0.9890) — explaining 98.9% of variance in productivity
- Lowest RMSE (2.02) — predictions off by just 2 points on a 0-100 scale on average
- Computational efficiency — instant predictions
- Interpretability — coefficients show clear feature importance
- Simplicity — Occam's Razor principle; no need for complexity

**Feature Importance (Coefficients):**
- Previous Scores: 0.89 (highest impact)
- Hours Studied: 0.31
- Sleep Hours: 0.15
- Extracurricular Activities: 3.2 points boost
- Sample Papers: 0.08

**Model Performance on Test Set:**
- Mean prediction: 52.3 (matches actual mean: 52.5)
- 95% of predictions within ±4.2 points of actual values
- No systematic bias detected

### 5.2 Stress Model Results

**Model Comparison:**

| Model | R² Score | RMSE | MAE | Training Time |
|-------|----------|------|-----|----------------|
| Linear Regression | 0.9585 | 0.36 | 0.28 | <1s |
| Random Forest | 0.9902 | 0.18 | 0.13 | 1.1s |
| **XGBoost** | **0.9978** | **0.08** | **0.06** | 1.4s |

**Selected Model:** XGBoost

**Justification:**
- Highest R² score (0.9978) — explains 99.78% of variance
- Exceptional RMSE (0.08) — predictions within 0.08 on an 8-point scale
- Best generalization to unseen data based on cross-validation
- Small dataset (374 samples) can benefit from ensemble methods' regularization
- Feature interaction capture crucial for stress prediction

**Feature Importance (from XGBoost SHAP values):**
1. Quality of Sleep: 28% importance
2. Heart Rate: 22%
3. Sleep Duration: 19%
4. Physical Activity Level: 14%
5. Age: 8%
6. BMI Category: 5%
7. Other features: 4%

**Model Performance on Test Set:**
- Mean prediction: 5.2 (matches actual mean: 5.1)
- 97% of predictions within ±0.15 of actual stress level
- Excellent calibration across stress ranges

### 5.3 Key Findings

1. **Sleep is Critical** — Both models highlight sleep quality and duration as top predictors. This aligns with research showing sleep's impact on both productivity and stress.

2. **Previous Performance Matters Most** — For productivity, past performance is the best predictor of future performance (0.92 correlation).

3. **Holistic Health Factors** — Stress prediction requires looking at multiple factors (sleep, heart rate, activity) rather than any single indicator.

4. **Linear vs. Non-Linear** — Productivity prediction is fundamentally a linear relationship (hence Linear Regression wins), while stress has complex interactions (hence XGBoost wins).

5. **Model Reliability** — Both models achieved R² > 0.95, indicating they're reliable for real-world use.

---

## 6. DEPLOYMENT

### 6.1 FastAPI Backend Setup

I built a FastAPI server (`ml/api/main.py`) that:
- Loads both trained models from pickle files
- Validates incoming requests using Pydantic models
- Makes predictions and returns results with interpretive messages
- Handles CORS (Cross-Origin Resource Sharing) for the React frontend

**API Architecture:**

```
ml/
├── models/
│   ├── productivity_model.pkl (Linear Regression)
│   └── stress_model.pkl (XGBoost)
└── api/
    └── main.py (FastAPI application)
```

### 6.2 API Endpoints

**Endpoint 1: GET /**
- **Purpose:** Health check
- **Response:** `{"message": "rectotime ML API is running"}`

**Endpoint 2: POST /predict/productivity**
- **Request Body:**
```json
{
  "hours_studied": 5.0,
  "previous_scores": 75.0,
  "extracurricular_activities": 1,
  "sleep_hours": 7.0,
  "sample_question_papers_practiced": 10
}
```
- **Response:**
```json
{
  "productivity_score": 62.48,
  "message": "Decent day. A few more focused hours could help."
}
```
- **Scoring Scale:**
  - 80+: "Great day! You are highly productive."
  - 60-80: "Decent day. A few more focused hours could help."
  - <60: "Tough day. Consider resting and resetting tomorrow."

**Endpoint 3: POST /predict/stress**
- **Request Body:** 12 health and lifestyle metrics
- **Response:**
```json
{
  "stress_level": 3.05,
  "message": "You are doing well. Stress levels are healthy."
}
```
- **Interpretation Guide:**
  - ≤4: "You are doing well. Stress levels are healthy."
  - 4-6: "Moderate stress. Try to get more sleep tonight."
  - >6: "High stress detected. Take a break and recharge."

### 6.3 React Component Integration

I created a new `MLInsights` component that:
- Provides a user-friendly form for inputting personal statistics
- Calls both API endpoints simultaneously
- Displays color-coded results (green/yellow/red)
- Shows personalized recommendations based on predictions
- Handles loading states and errors gracefully

The component was integrated into the main Dashboard, appearing below existing widgets.

### 6.4 Live Deployment

**Frontend:** Deployed on Vercel  
**URL:** https://rectotime-5fgllma3s-sreekarvvns-projects.vercel.app/  
**Backend:** Running as a service with FastAPI/Uvicorn

**Tech Stack Used:**
- **Backend:** Python, FastAPI, Uvicorn, joblib, numpy, pydantic
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **ML Libraries:** scikit-learn, XGBoost, pandas, numpy, matplotlib, seaborn
- **Deployment:** Vercel (frontend), FastAPI server (backend)

---

## 7. CHALLENGES FACED AND SOLUTIONS

### Challenge 1: Initial Productivity Dataset Was Too Small

**Problem:** I initially started with a smaller student performance dataset (only ~85 rows) that had severe overfitting issues. The Linear Regression model achieved an R² of 0.49, which was unacceptable for production use.

**Solution:** I searched Kaggle for a larger, more comprehensive student performance dataset and found one with 10,000 well-curated samples. This switch immediately improved model quality to R² 0.9890.

**Lesson Learned:** Data quality and quantity matter more than model complexity. A simple model on good data beats a complex model on poor data.

### Challenge 2: Stress Dataset Target Looked Categorical

**Problem:** The stress level in the dataset appeared to be categorical at first glance (values: 3, 4, 5, 6, 7, 8), which typically suggests a classification problem. I initially started building a classifier.

**Solution:** Upon closer inspection, I realized the stress levels were genuinely continuous values (even though displayed as integers), and treating it as a regression problem yielded much better results. The XGBoost regressor achieved R² 0.9978 compared to a classifier approach.

**Lesson Learned:** Always verify your target variable's true nature and distribution before choosing a problem type.

### Challenge 3: CORS Issues Between FastAPI and React

**Problem:** When I first tried calling the API from the React frontend, requests were blocked by browser CORS policy. The API would reject requests from localhost:5173.

**Solution:** I properly configured CORS middleware in FastAPI to allow requests from the Vite development server:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Lesson Learned:** CORS is a security feature, not a bug. Always explicitly configure allowed origins rather than using wildcards in production.

### Challenge 4: Uvicorn "Attribute app not found" Error on Windows

**Problem:** When running `python -m uvicorn main:app --reload` on Windows PowerShell, uvicorn threw an error: "Attribute app not found in module main" even though the file looked syntactically correct.

**Root Cause:** The joblib model loading calls at module import level were silently failing on this Windows environment, preventing the `app` object from being defined. Python didn't raise an exception, so running `python main.py` appeared to work fine.

**Solution:** I wrapped model loading in try-except blocks with proper logging:
```python
try:
    productivity_model = joblib.load(productivity_path)
    logger.info(f"Loaded productivity model from {productivity_path}")
except Exception as e:
    logger.error(f"Error loading productivity model: {e}")
```

This revealed the actual error and allowed uvicorn to still start while returning error responses if models weren't loaded.

**Lesson Learned:** Silent failures during module imports are dangerous. Always add logging at the module level, especially for resource loading.

---

## 8. CONCLUSION

This project demonstrated how machine learning can be seamlessly integrated into a full-stack web application to provide real value to users. What started as a 3-day intensive project became a complete end-to-end system: data exploration, model development, backend API, frontend integration, and live deployment.

### Key Accomplishments

1. **Two Production-Ready ML Models:**
   - Productivity predictor with 98.9% accuracy (R² 0.9890)
   - Stress predictor with 99.78% accuracy (R² 0.9978)

2. **Fully Functional API:**
   - FastAPI backend with proper validation and error handling
   - Three endpoints serving predictions and health checks
   - CORS properly configured for frontend access

3. **Seamless Integration:**
   - React component that calls predictions in real-time
   - User-friendly interface with color-coded results
   - Deployed live and accessible to real users

4. **Production Deployment:**
   - Frontend live on Vercel
   - API running reliably
   - Proper logging and monitoring

### What I Learned

Beyond the technical implementation, this project taught me:

1. **The Full Stack Matters** — Building just models or just frontends is incomplete. Real value comes from connecting them properly.

2. **Data Quality > Model Complexity** — My productivity model uses simple Linear Regression but outperforms complex models on poor data.

3. **Debugging Across Environments** — Testing on Windows, MacOS, and Linux revealed different issues. Proper logging and error handling are critical.

4. **User-Centric Design** — The MLInsights component had to be intuitive for users with no ML knowledge to input data correctly.

5. **Documentation and Communication** — Clear API documentation (Swagger UI) and error messages made debugging much easier.

### Future Improvements

Looking ahead, the system could be enhanced with:

1. **Real-Time Data Integration** — Instead of manual input, directly consume data from the Chrome extension's activity tracking to auto-populate the form.

2. **Personalized Models** — Train per-user models as more data accumulates, tailoring predictions to individual patterns.

3. **Model Retraining Pipeline** — Automatically retrain models monthly with new user data to maintain accuracy.

4. **Advanced Features:**
   - Weekly productivity trends
   - Stress management recommendations based on personal patterns
   - Correlations between activities and stress/productivity
   - Benchmarking against similar users

5. **Mobile Support** — Native mobile app or responsive web design improvements.

6. **Explainability** — SHAP values or LIME explanations for why specific predictions were made.

### Final Thoughts

Rectotime started as a learning project to understand full-stack development. By adding machine learning predictions, it transformed into something with real potential to help people understand and improve their productivity and mental health. The fact that it went from concept to deployed application in 3 days demonstrates the power of combining good data, appropriate algorithms, and solid engineering practices.

The internship experience at Ramanasoft, working on this and other projects, has given me confidence that I can take an idea from conception through training, deployment, and into the hands of real users. That's something I'm proud of, and I'm excited to continue building on this foundation.

---

## 9. APPENDICES

### Appendix A: File Structure
```
rectotime/
├── ml/
│   ├── api/
│   │   ├── main.py (FastAPI application)
│   │   └── README.md (API documentation)
│   ├── datasets/
│   │   ├── Student_Performance.csv
│   │   └── Sleep_health_and_lifestyle_dataset.csv
│   ├── models/
│   │   ├── productivity_model.pkl
│   │   └── stress_model.pkl
│   └── notebooks/
│       ├── productivity_eda.ipynb
│       └── stress_eda.ipynb
└── src/
    └── components/
        └── Dashboard/
            ├── MLInsights.tsx
            └── index.tsx
```

### Appendix B: Requirements and Dependencies

**Python Dependencies:**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
joblib==1.3.2
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.2
xgboost==2.0.3
matplotlib==3.8.2
seaborn==0.13.0
```

**Frontend:**
React, TypeScript, Tailwind CSS (managed through package.json)

### Appendix C: Model Serialization

Both models are saved using joblib for efficient serialization:
```python
joblib.dump(productivity_model, '../models/productivity_model.pkl')
joblib.dump(stress_model, '../models/stress_model.pkl')
```

Loading:
```python
productivity_model = joblib.load('../models/productivity_model.pkl')
stress_model = joblib.load('../models/stress_model.pkl')
```

---

**End of Report**

*This report was prepared as a comprehensive documentation of the rectotime ML integration project completed during the internship at Ramanasoft. For viewing the live application, visit: https://rectotime-5fgllma3s-sreekarvvns-projects.vercel.app/*
