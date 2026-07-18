# rectotime Streamlit App

An interactive web interface for the rectotime ML API, providing productivity and stress prediction capabilities.

## Features

- **Productivity Score Prediction**: Predict productivity based on study habits, sleep, and activities
- **Stress Level Prediction**: Assess stress levels based on health metrics and lifestyle factors
- Clean, dark-themed UI with real-time predictions
- Interactive sliders and inputs for all parameters

## Prerequisites

- Python 3.8 or higher
- Running ML API (FastAPI backend)

## Installation

1. Navigate to the streamlit app directory:
```bash
cd ml/streamlit_app
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Edit `app.py` and update the `API_URL` variable to point to your running API:

```python
API_URL = "http://localhost:8000"  # For local development
# or
API_URL = "https://your-api-url.com"  # For deployed API
```

## Running the App

### Local Development

1. Make sure the FastAPI backend is running (see `ml/api/README.md`)

2. Run the Streamlit app:
```bash
streamlit run app.py
```

3. Open your browser to `http://localhost:8501`

### Production Deployment

#### Deploy to Streamlit Cloud

1. Push your code to GitHub
2. Go to [share.streamlit.io](https://share.streamlit.io)
3. Connect your GitHub repository
4. Select `ml/streamlit_app/app.py` as the main file
5. Deploy!

#### Deploy to Hugging Face Spaces

1. Create a new Space on [Hugging Face](https://huggingface.co/spaces)
2. Select "Streamlit" as the SDK
3. Upload files:
   - `app.py`
   - `requirements.txt`
4. Update `API_URL` to point to your deployed API
5. Your app will be live at `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`

## Usage

### Productivity Predictor

1. Adjust the following parameters:
   - **Hours Studied**: Daily study/work hours (0-9)
   - **Previous Scores**: Historical performance (40-100)
   - **Extracurricular Activities**: Yes/No
   - **Sleep Hours**: Daily sleep duration (4-9)
   - **Sample Papers Practiced**: Practice tests completed (0-9)

2. Click "🎯 Predict Productivity"

3. View your productivity score and personalized message

### Stress Predictor

1. Input health and lifestyle metrics:
   - Sleep duration and quality
   - Physical activity level
   - Heart rate and daily steps
   - Demographics (gender, age, occupation)
   - BMI category
   - Blood pressure (systolic/diastolic)
   - Sleep disorders

2. Click "💪 Predict Stress Level"

3. View your stress level (3-8 scale) and recommendations

## Troubleshooting

### API Connection Error

If you see "🔴 API is currently unavailable":
- Verify the API is running
- Check the `API_URL` is correct
- Ensure there are no CORS issues
- Check network connectivity

### Model Not Loaded

If predictions fail:
- Verify models are trained and saved in `ml/models/`
- Check API logs for model loading errors
- Ensure model files are named correctly:
  - `productivity_model.pkl`
  - `stress_model.pkl`

## Development

### Customizing the UI

Edit `app.py` to modify:
- Themes and colors (Streamlit markdown/CSS)
- Input ranges and defaults
- Layout and columns
- Messages and feedback

### Adding New Features

1. Add new tabs to the main interface
2. Create API endpoints in the FastAPI backend first
3. Add corresponding Streamlit UI components
4. Update requirements.txt if needed

## Tech Stack

- **Streamlit**: Web framework
- **Requests**: API communication
- **Python 3.8+**: Runtime

## License

Part of the rectotime project © 2026
