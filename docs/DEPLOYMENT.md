# Deployment

## Build artefacts

```bash
# Frontend — static bundle in frontend/dist
cd frontend
npm ci
npm run build

# Backend — run with the project virtualenv
cd backend
pip install -r requirements.txt
```

## Environment

| File | Variables |
|------|-----------|
| `backend/.env` | `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| `frontend/.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` |

Copy the corresponding `*.env.example` files as a starting point. The
service-role key must never reach the frontend.

## Running the API

Local development (binds `127.0.0.1:8000`, hot reload):

```bash
cd backend
python run.py
```

Production-style:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

Verify: `curl http://127.0.0.1:8000/api/health` → `{"status":"ok",...}`.

> Bind and reference the API by IP (or a single DNS name). `localhost`
> resolving to IPv6 `::1` while another service holds port 8000 is the
> classic cause of spurious 404s in local setups.

## Serving the SPA

`frontend/dist` is static — host it on any static provider (nginx,
Netlify, Vercel, GitHub Pages) and point `VITE_API_URL` at the deployed
API origin **at build time** (Vite inlines `import.meta.env` values).

CORS: `backend/app/main.py` currently allows `*` origins for
convenience. Before a real production launch, restrict
`allow_origins` to your frontend origin and keep
`allow_credentials` scoped accordingly.

## Supabase

- Enable Email/Password auth; optionally enable TOTP for the 2FA flow.
- Apply `backend/app/database/schema.sql` (tables + RLS policies) to the
  project before first use.
- The `/api/history` and `/api/analytics` routers are stubs today; the
  dashboard queries Supabase directly. When they are implemented they
  should authenticate the caller and query with the user's role so RLS
  policies isolate users.

## CI

`.github/workflows/ci.yml` runs on every push/PR:

1. Backend: `pytest` with the pinned Python version.
2. Frontend: `npm ci`, `tsc --noEmit`, `npm run build`.
