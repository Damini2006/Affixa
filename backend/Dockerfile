FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NLTK_DATA=/app/nltk_data

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download WordNet to a shared location accessible by appuser
RUN mkdir -p /app/nltk_data && \
    python -c "import nltk; nltk.download('wordnet', download_dir='/app/nltk_data', quiet=False)" && \
    ls -la /app/nltk_data/corpora/

COPY app ./app

# Create non-root user for security
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Bind 0.0.0.0 (not 127.0.0.1 like run.py) so the port is reachable outside the container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"
