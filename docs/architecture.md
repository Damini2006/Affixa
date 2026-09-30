# Architecture

Affixa is a three-tier application: a React SPA, a FastAPI service that owns
the linguistic engine, and Supabase for auth plus per-user history.

```
┌──────────────────────────────┐
│  React 18 + TypeScript (Vite)│  routes, dashboard, 3D auth panels
│  axios · framer-motion · R3F │
└──────────────┬───────────────┘
               │ JSON over HTTP  (http://127.0.0.1:8000/api)
┌──────────────▼───────────────┐
│  FastAPI (backend/app)       │
│  routers: analyze, compare,  │
│  history, analytics          │
├──────────────────────────────┤
│  NLP engine (app/nlp)        │  matcher → rules → validator → scorer
└──────────────┬───────────────┘
               │ supabase-py (service role)
┌──────────────▼───────────────┐
│  Supabase                    │  Postgres + RLS, Auth (email/password + TOTP)
└──────────────────────────────┘
```

## Frontend (`frontend/src`)

| Layer | Responsibility |
|-------|----------------|
| `App.tsx` | Route table, `ErrorBoundary`, `Suspense` code splitting, route-aware `document.title` |
| `context/AuthContext.tsx` | Supabase session, sign-in/up/out, MFA challenge state |
| `components/AppLayout.tsx` | Authenticated shell: collapsible sidebar, top bar, skip link |
| `components/CommandPalette.tsx` | `Ctrl/Cmd+K` navigation and quick analysis |
| `pages/*` | Analyzer, Batch, Comparison, Analytics, Dictionary, Settings, auth |
| `services/api.ts` | Axios instance; base URL from `VITE_API_URL`, defaulting to `127.0.0.1:8000` |

Heavy routes are `React.lazy` chunks: three.js only loads on the auth pages
and recharts only on Analytics/Batch.

## Backend (`backend/app`)

| Module | Responsibility |
|--------|----------------|
| `main.py` | App factory, CORS, route registration, `/api/health` |
| `api/analyze.py` | `POST /analyze/word`, `POST /analyze/text` |
| `api/compare.py` | `POST /compare` — rule-based vs Porter/Snowball/spaCy |
| `api/history.py`, `api/analytics.py` | Per-user history and summary metrics |
| `nlp/affix_matcher.py` | Longest-match prefix/suffix candidate generation |
| `nlp/spelling_rules.py` | Morphophonological restoration (y→i, silent e, degemination, t-restoration) |
| `nlp/validator.py` | Princeton WordNet lemma validation |
| `nlp/confidence.py` | Deterministic 0..1 confidence calibration |
| `nlp/dictionaries/*.json` | Curated prefix/suffix lexicon (also imported directly by the Dictionary page) |

### Analysis pipeline

1. `normalize_word` lowercases and strips non-alpha characters.
2. `AffixMatcher` proposes prefix/suffix candidates longest-first (empty
   candidates included so affix-less words stay eligible).
3. For each combination that leaves a root of at least 3 characters,
   `apply_rules` produces restored-root variants.
4. `Validator.is_valid_word` checks each root against WordNet.
5. `calculate_confidence` scores the split; the best valid candidate wins.
   If nothing validates, the analyzer falls back to a no-affix result.

The whole pipeline is deterministic — identical inputs always return the
identical `AnalysisResult`, which the test suite asserts.

## Data & auth flow

- The SPA authenticates against Supabase directly (email/password, optional
  TOTP second factor) via `AuthContext`.
- `ProtectedRoute` gates dashboard routes and preserves the intended
  destination for post-login redirect.
- Analysis history rows are written/read through the FastAPI `history`
  router using the user's JWT, so Supabase RLS isolates users.

## Local networking caveat

The frontend deliberately targets `http://127.0.0.1:8000/api` instead of
`localhost`: on machines where WSL (`wslrelay`) or Docker bound port 8000
on `::1`, `localhost` resolves to IPv6 first and every API call 404s. See
`frontend/.env.example` to override with `VITE_API_URL`.
