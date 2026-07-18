import streamlit as st
import requests
import json

# Configuration
API_URL = "http://localhost:8000"  # Change to your deployed API URL (e.g., HuggingFace Spaces)

# Page config
st.set_page_config(
    page_title="rectotime",
    page_icon="⏰",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Dark theme
st.markdown("""
    <style>
        .main {
            background-color: #0e1117;
            color: #c9d1d9;
        }
    </style>
""", unsafe_allow_html=True)

# Header
st.title("⏰ rectotime")
st.markdown("*Your AI-powered productivity & stress companion*")
st.divider()

# Tabs
tab1, tab2 = st.tabs(["📊 Productivity Predictor", "😰 Stress Predictor"])

# ===== PRODUCTIVITY TAB =====
with tab1:
    st.header("Productivity Score Prediction")
    
    col1, col2 = st.columns(2)
    
    with col1:
        hours_studied = st.slider("Hours Studied", 0.0, 9.0, 5.0, 0.5)
        previous_scores = st.slider("Previous Scores", 40.0, 100.0, 75.0, 1.0)
        extracurricular = st.selectbox("Extracurricular Activities", ["Yes", "No"])
    
    with col2:
        sleep_hours = st.slider("Sleep Hours", 4.0, 9.0, 7.0, 0.5)
        sample_papers = st.slider("Sample Papers Practiced", 0, 9, 5)
    
    if st.button("🎯 Predict Productivity", key="prod_btn"):
        try:
            response = requests.post(
                f"{API_URL}/predict/productivity",
                json={
                    "hours_studied": hours_studied,
                    "previous_scores": previous_scores,
                    "extracurricular_activities": 1 if extracurricular == "Yes" else 0,
                    "sleep_hours": sleep_hours,
                    "sample_question_papers_practiced": sample_papers
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                score = result.get("productivity_score", 0)
                message = result.get("message", "")
                
                # Display results
                st.metric("Productivity Score", f"{score:.2f}/100")
                st.progress(min(score / 100, 1.0))
                
                if score >= 80:
                    st.success(f"✅ {message}")
                elif score >= 60:
                    st.warning(f"⚠️ {message}")
                else:
                    st.error(f"❌ {message}")
            else:
                st.error(f"Error: {response.status_code}")
        
        except requests.exceptions.ConnectionError:
            st.error("🔴 API is currently unavailable. Please check if the API is deployed and the URL is correct.")
        except Exception as e:
            st.error(f"Error: {str(e)}")

# ===== STRESS TAB =====
with tab2:
    st.header("Stress Level Prediction")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        sleep_duration = st.slider("Sleep Duration (hours)", 5.0, 9.0, 7.0, 0.5)
        quality_of_sleep = st.slider("Sleep Quality", 1, 10, 7)
        physical_activity = st.slider("Physical Activity Level", 0, 100, 50)
    
    with col2:
        heart_rate = st.slider("Heart Rate (bpm)", 60, 100, 75)
        daily_steps = st.slider("Daily Steps", 1000, 15000, 7000, 500)
        gender = st.selectbox("Gender", ["Male", "Female"])
    
    with col3:
        age = st.slider("Age", 18, 60, 30)
        occupation = st.selectbox("Occupation", [
            "Accountant", "Doctor", "Engineer", "Lawyer", "Manager",
            "Nurse", "Sales Representative", "Scientist", "Software Engineer", "Teacher"
        ])
    
    # Additional inputs
    bmi_category = st.selectbox("BMI Category", ["Normal Weight", "Overweight", "Obese", "Normal"])
    sleep_disorder = st.selectbox("Sleep Disorder", ["None", "Insomnia", "Sleep Apnea"])
    
    col1, col2 = st.columns(2)
    
    with col1:
        bp_systolic = st.slider("BP Systolic", 110, 140, 120)
    
    with col2:
        bp_diastolic = st.slider("BP Diastolic", 70, 95, 80)
    
    if st.button("💪 Predict Stress Level", key="stress_btn"):
        try:
            # Map categorical values
            gender_map = {"Male": 1, "Female": 0}
            occupation_map = {
                "Accountant": 0, "Doctor": 1, "Engineer": 2, "Lawyer": 3,
                "Manager": 4, "Nurse": 5, "Sales Representative": 6,
                "Scientist": 7, "Software Engineer": 8, "Teacher": 9
            }
            bmi_map = {"Normal Weight": 3, "Overweight": 2, "Obese": 1, "Normal": 0}
            disorder_map = {"None": 1, "Insomnia": 0, "Sleep Apnea": 2}
            
            response = requests.post(
                f"{API_URL}/predict/stress",
                json={
                    "gender": gender_map[gender],
                    "age": age,
                    "occupation": occupation_map[occupation],
                    "sleep_duration": sleep_duration,
                    "quality_of_sleep": quality_of_sleep,
                    "physical_activity_level": physical_activity,
                    "bmi_category": bmi_map[bmi_category],
                    "heart_rate": heart_rate,
                    "daily_steps": daily_steps,
                    "sleep_disorder": disorder_map[sleep_disorder],
                    "bp_systolic": bp_systolic,
                    "bp_diastolic": bp_diastolic
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                score = result.get("stress_level", 0)
                message = result.get("message", "")
                
                # Display results (normalize 3-8 range to 0-1)
                st.metric("Stress Level", f"{score:.2f}/8")
                progress_value = max(0, min((score - 3) / 5, 1.0))
                st.progress(progress_value)
                
                if score <= 4:
                    st.success(f"✅ {message}")
                elif score <= 6:
                    st.warning(f"⚠️ {message}")
                else:
                    st.error(f"❌ {message}")
            else:
                st.error(f"Error: {response.status_code}")
        
        except requests.exceptions.ConnectionError:
            st.error("🔴 API is currently unavailable. Please check if the API is deployed and the URL is correct.")
        except Exception as e:
            st.error(f"Error: {str(e)}")

# Footer
st.divider()
st.markdown("<p style='text-align: center; color: #6e7681;'>Built with ❤️ for better productivity | rectotime © 2026</p>", unsafe_allow_html=True)
