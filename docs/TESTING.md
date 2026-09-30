# Testing

## Backend (pytest)

The FastAPI service ships with a pytest suite covering the liveness
routes, the analysis pipeline, the tokenizer and the REST contracts.

```bash
cd backend

# one-time: use the project virtualenv
python -m venv venv
.\venv\Scripts\Activate.ps1        # Windows
source venv/bin/activate           # macOS/Linux
pip install -r requirements.txt

# run everything
python -m pytest

# subsets
python -m pytest tests/test_analyzer.py -q      # pipeline unit tests
python -m pytest tests/test_analyze_api.py -q   # REST contracts
python -m pytest -k health -q                   # liveness routes
```

`backend/pytest.ini` sets `testpaths = tests` and `pythonpath = .`, so
tests import `app.*` directly regardless of invocation directory.

### What the suite asserts

| File | Coverage |
|------|----------|
| `test_health.py` | `GET /`, `GET /api/health`, unknown-route 404 |
| `test_analyzer.py` | prefix/root/suffix splits, validity flags, confidence bounds, determinism, reported rules |
| `test_tokenizer.py` | whitespace collapsing, punctuation dropping, hyphen/apostrophe splitting |
| `test_analyze_api.py` | response shape, 400 on empty/whitespace input, whitespace trimming |
| `test_compare_api.py` | stemmer payloads, Porter/Snowball agreement, validation |

Tests exercise real imports (NLTK, spaCy optional), so run them with the
backend virtualenv interpreter — not a bare system Python.

## Frontend

```bash
cd frontend
npx tsc --noEmit   # type check
npm run build      # production build (also runs tsc)
```

The build gate is wired into CI (`.github/workflows/ci.yml`) alongside
the backend suite, so every push verifies both tiers.

## Manual smoke checklist

1. `python backend/run.py` → `curl http://127.0.0.1:8000/api/health` returns `status: ok`.
2. `npm run dev` → open the dev URL, sign in, analyze a word (e.g. `unhappiness`).
3. Compare tab renders Porter/Snowball/spaCy columns without console errors.
4. Auth pages render exactly one logo (top NavBar) and do not scroll.
