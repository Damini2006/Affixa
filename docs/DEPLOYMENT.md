# Affixa Deployment Guide

## Architecture

| Component | Platform | URL |
|---|---|---|
| Frontend (React) | Vercel | `https://<project>.vercel.app` |
| Backend (FastAPI) | Railway | `https://<service>.up.railway.app` |
| Database + Auth | Supabase | `https://gkfwxixscktwhcnuujkt.supabase.co` |

---

## Prerequisites

- [ ] GitHub account with the repo pushed
- [ ] Vercel account (vercel.com)
- [ ] Railway account (railway.app)
- [ ] Supabase project (already configured)

---

## Step 1: Deploy Backend on Railway

### 1.1 Create New Project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select `Damini2006/Affixa`
3. Railway auto-detects `railway.json` → uses `backend/Dockerfile`

### 1.2 Set Environment Variables

In your Railway service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://gkfwxixscktwhcnuujkt.supabase.co` |
| `SUPABASE_KEY` | *(from backend/.env)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from backend/.env)* |
| `ALLOWED_ORIGINS` | `https://<your-vercel-app>.vercel.app` |
| `NLTK_DATA` | `/app/nltk_data` |
| `ENV` | `production` |

> **Note:** Replace `<your-vercel-app>` with your actual Vercel URL after Step 2.

### 1.3 Deploy

Railway auto-deploys on every push to `main`. Wait for the build to complete (~10 min first time due to pip install).

### 1.4 Get Backend URL

Railway provides a public URL: `https://<service-name>.up.railway.app`

Verify it works:
```bash
curl https://<service-name>.up.railway.app/api/health
# Should return: {"status":"ok","service":"affixa-api","version":"1.0.0"}
```

---

## Step 2: Deploy Frontend on Vercel

### 2.1 Import Project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import `Damini2006/Affixa`
3. Vercel auto-detects `vercel.json` → uses Vite framework

### 2.2 Set Environment Variables

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://gkfwxixscktwhcnuujkt.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_ZdaDlGKU04lJZ0fHwT0bTw_YsNEnRFX` |
| `VITE_API_URL` | `https://<railway-service>.up.railway.app/api` |

> **Note:** Replace `<railway-service>` with your actual Railway URL from Step 1.4.

### 2.3 Deploy

Click **Deploy**. Vercel builds and deploys in ~2 minutes.

Your app is live at: `https://<project-name>.vercel.app`

---

## Step 3: Update CORS on Railway

After both are deployed, update `ALLOWED_ORIGINS` on Railway to include your Vercel URL:

```
ALLOWED_ORIGINS=https://<project-name>.vercel.app
```

Redeploy the Railway service (push an empty commit or use the Railway dashboard).

---

## Step 4: Configure Supabase

### 4.1 Add Redirect URLs

In your [Supabase Dashboard](https://supabase.com/dashboard):

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `https://<project-name>.vercel.app`
   - `https://<project-name>.vercel.app/reset-password`
   - `http://localhost:3001` (for local dev)

### 4.2 Update Site URL

Set **Site URL** to: `https://<project-name>.vercel.app`

---

## Step 5: Verify Deployment

| Check | How |
|---|---|
| Frontend loads | Open `https://<project-name>.vercel.app` |
| Backend health | `curl https://<railway-service>.up.railway.app/api/health` |
| Backend ready | `curl https://<railway-service>.up.railway.app/api/ready` |
| Word analysis | Enter a word in the Analyzer |
| Auth flow | Sign up → login → analyze |
| Password reset | Request reset → check email → reset |

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon/service key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed CORS origins |
| `NLTK_DATA` | No | Path to NLTK data (default: `/app/nltk_data`) |
| `ENV` | No | `production` or `development` |
| `RATE_LIMIT_REQUESTS` | No | Max requests per window (default: 100) |
| `RATE_LIMIT_WINDOW` | No | Rate limit window in seconds (default: 60) |

### Frontend (Vercel)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase publishable key |
| `VITE_API_URL` | Yes | Backend API URL (Railway) |

---

## Troubleshooting

### CORS errors in browser console
- Check `ALLOWED_ORIGINS` on Railway includes your Vercel URL
- Redeploy Railway after changing env vars

### Backend not responding
- Check Railway logs: `railway logs` or dashboard
- Verify `/api/health` returns 200
- Check that WordNet downloaded successfully in build logs

### Frontend can't reach backend
- Verify `VITE_API_URL` on Vercel points to Railway URL
- Check Railway service is running (not sleeping)

### Auth redirect loops
- Verify Supabase Site URL and Redirect URLs include Vercel domain
- Check that `VITE_SUPABASE_URL` matches the Supabase project URL

---

## Production Checklist

- [ ] Backend deployed and healthy on Railway
- [ ] Frontend deployed on Vercel
- [ ] CORS configured correctly
- [ ] Supabase redirect URLs updated
- [ ] Auth flow works (sign up, login, reset password)
- [ ] Word analysis works end-to-end
- [ ] Batch processing works
- [ ] No console errors in production
