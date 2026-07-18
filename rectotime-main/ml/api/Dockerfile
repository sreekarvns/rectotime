FROM python:3.10-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy models
COPY models/ models/

# Copy application
COPY main.py .

# Expose port
EXPOSE 7860

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]