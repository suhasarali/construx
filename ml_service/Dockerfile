FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download models to speed up boot
RUN python -c "from deepface import DeepFace; DeepFace.build_model('Facenet')"

COPY . .

# Expose port (Render uses $PORT env var)
CMD gunicorn --bind 0.0.0.0:$PORT app:app
