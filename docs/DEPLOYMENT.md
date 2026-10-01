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

## Docker

```bash
# Build + run both containers (frontend :3001, API :8001)
docker compose up --build
```

- `backend/Dockerfile` serves the API with uvicorn on `0.0.0.0:8000`;
  runtime config comes from `backend/.env`.
- `frontend/Dockerfile` bakes the Vite bundle (nginx + SPA fallback).
  `VITE_*` values are inlined at **build** time from the root `.env`,
  so keep `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` in sync with
  `frontend/.env` and rebuild after changing them.
- Host ports avoid neighbours on this machine: :3000 is MarketMind AI,
  :5173 is LINEAGE, host :8000 is held by WSL relay — so the app uses
  :3001 (frontend) and :8001 (API).

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

### Auth redirects (password reset lands on the wrong app?)

The reset email destination is decided by Supabase, not by frontend code.
`ForgotPassword` requests `redirectTo: <this-origin>/reset-password`, but
Supabase silently falls back to **Site URL** for any URL not allowlisted —
so a Site URL pointing at another project/domain sends your users to that
other app. The app now forwards stray recovery params (`?code=`,
`#…type=recovery`) from any route to `/reset-password`, but cross-origin
fallbacks can only be fixed in the dashboard:

1. Supabase Dashboard → select this project's ref (must match
   `VITE_SUPABASE_URL` / `SUPABASE_URL` in your `.env` files) →
   Authentication → URL Configuration.
2. Site URL = this app's origin:
   `http://localhost:5173` for local dev, production URL in prod.
3. Redirect URLs (allowlist) must contain every origin that sends resets:
   `http://localhost:5173/reset-password`,
   `http://127.0.0.1:5173/reset-password`, plus
   `https://<your-prod-domain>/reset-password`.
4. Authentication → Emails → "Reset password" template must use
   `{{ .ConfirmationURL }}` so the per-request `redirectTo` is honoured.
5. Request a fresh link after saving; reset links expire (~1h) and only
   the newest one works. Ignore reset emails from other projects.

## CI

`.github/workflows/ci.yml` runs on every push/PR:

1. Backend: `pytest` with the pinned Python version.
2. Frontend: `npm ci`, `tsc --noEmit`, `npm run build`.
