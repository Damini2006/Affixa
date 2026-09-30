# API Reference

Base URL (local development): `http://127.0.0.1:8000`

Interactive Swagger docs: `http://127.0.0.1:8000/docs`

All request and response bodies are JSON.

## Health

### `GET /api/health`

Liveness probe for CI, containers and monitoring.

```json
{ "status": "ok", "service": "affixa-api", "version": "1.0.0" }
```

`GET /` returns a similar greeting payload.

## Analysis

### `POST /api/analyze/word`

Decompose a single word.

**Request**

```json
{ "word": "unhappiness" }
```

**Response — `200 OK`**

```json
{
  "word": "unhappiness",
  "prefix": "un",
  "root": "happy",
  "suffix": "ness",
  "rule": "y → i restoration",
  "confidence": 0.99,
  "method": "rule-based",
  "is_valid": true
}
```

| Field | Meaning |
|-------|---------|
| `prefix` / `suffix` | Matched affixes; empty strings when none applied |
| `root` | Restored base lemma (validated against WordNet when `is_valid`) |
| `rule` | Morphophonological rule applied at the suffix boundary, or `"none"` |
| `confidence` | Deterministic score in `[0, 1]` |
| `is_valid` | Whether the root is a WordNet-verified lemma |

**Errors**

- `400` — empty or whitespace-only `word`.

### `POST /api/analyze/text`

Decompose every word token of a text corpus.

**Request**

```json
{ "text": "The unhappy rethinking" }
```

**Response — `200 OK`**

An array of `AnalysisResponse` objects, one per token, in input order.
Tokenizer behaviour: punctuation is dropped and separators split forms
(`un-happy!` → `un`, `happy`).

**Errors**

- `400` — empty or whitespace-only `text`.

## Comparison

### `POST /api/compare`

Side-by-side benchmark of the rule-based analyzer against three
stemmers/lemmatizers.

**Request**

```json
{ "word": "unhappiness" }
```

**Response — `200 OK`**

```json
{
  "word": "unhappiness",
  "rule_based": { "prefix": "un", "root": "happy", "suffix": "ness" },
  "porter": "unhappi",
  "snowball": "unhappi",
  "spacy": "unhappiness"
}
```

If the spaCy `en_core_web_sm` model is not installed, `spacy` contains
`"spaCy model not loaded"`.

**Errors**

- `400` — empty or whitespace-only `word`.

## History & analytics

These routers back the dashboard and depend on Supabase credentials in
`backend/.env` (see `backend/.env.example`):

- `GET /api/history/` — current user's analysis history (RLS-scoped)
- `GET /api/analytics/summary` — aggregate metrics for the Analytics page
