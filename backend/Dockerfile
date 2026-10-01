FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -c "import nltk; nltk.download('wordnet', quiet=True)"
# NOTE: the small spaCy model is intentionally NOT baked in (API degrades to
# "spaCy model not loaded" without it). To include it, add:
#   RUN python -m spacy download en_core_web_sm

COPY app ./app

EXPOSE 8000

# Bind 0.0.0.0 (not 127.0.0.1 like run.py) so the port is reachable outside the container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
