FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application code
COPY backend /app/backend

# Create directory for persistent vector store and sqlite database
RUN mkdir -p /app/vector_store /app/data

ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL="sqlite:////app/data/research_assistant.db"
ENV VECTOR_DB_PATH="/app/vector_store"
ENV PORT=8000

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
