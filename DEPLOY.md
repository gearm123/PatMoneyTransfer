# Deploy (front end only)

This repository is the **Vite + React** app. The **Express API** is in a **separate** repo: `buffalomoneysend-backend` (sibling folder / its own GitHub project).

## Netlify (this repo)

1. Connect this GitHub repository.
2. Build: **`npm run build`**, publish directory: **`dist`** (from `netlify.toml`).
3. **Environment variables** (Site → Environment):
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your `pk_...` key
   - `VITE_API_BASE` = your **deployed API** origin, e.g. `https://buffalomoneysend-api.onrender.com` — **no** trailing slash
4. **Redeploy** after changing env (Vite bakes `VITE_*` at build time).

## Backend (other repo)

Open **`buffalomoneysend-backend`** and follow its `README.md` (Render Blueprint `render.yaml` or manual Web Service, Stripe env vars, health check `/api/health`).

## Local full stack

1. Terminal A — API: in `buffalomoneysend-backend`, `npm run dev` (port 4000).
2. Terminal B — front end: in this folder, `npm run dev` (Vite proxies `/api` to `localhost:4000`).

`VITE_API_BASE` can stay empty for local dev if you use the Vite dev server and proxy.
