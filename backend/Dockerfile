FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies (from backend directory context)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application files into /app/backend so backend.app imports resolve cleanly
COPY . /app/backend

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV DATABASE_URL="sqlite:////app/data/research_assistant.db"
ENV VECTOR_DB_PATH="/app/vector_store"

# Create directory for persistent vector store and sqlite database
RUN mkdir -p /app/vector_store /app/data

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
