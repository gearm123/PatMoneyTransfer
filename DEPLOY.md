# Deploy (front end only)

This repository is the **Vite + React** app. The **Express API** is in a **separate** repo: `buffalomoneysend-backend` (sibling folder / its own GitHub project).

## Netlify (this repo)

1. Connect this GitHub repository.
2. Build: **`npm run build`**, publish directory: **`dist`** (from `netlify.toml`).
3. **Environment variables** (Site → Environment → Build):
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your `pk_...` key (baked in at build time)
   - `VITE_API_BASE` = your **deployed API** origin — **no** trailing slash (e.g. `https://buffalo-money-send-backend.onrender.com` — same as `netlify.toml` if you use the default)
4. **Redeploy** after changing any `VITE_*` (clear cache + deploy if the site still shows old behavior).

### If Netlify “doesn’t look like” your machine

Vite’s **dev** server (`npm run dev`) proxies `/api` to localhost and uses your local `.env`. A **Netlify** build is static files only: the API URL and Stripe key must be present at **`npm run build`**. Compare apples to apples:

1. **Production build locally** — after `npm run build`, run `npx vite preview` (or `npm run preview`) and open the URL shown. This should match Netlify for layout, CSS, and (if you set the same `VITE_API_BASE` in the shell) API behavior.
2. **Stuck on “Loading…” or “Checkout not connected”** — open DevTools → **Console** for `[BuffaloMoneySend] VITE_API_BASE`. If the API is wrong or blocked by CORS, `getTransferConfig` fails and the app shows the offline state instead of the main form. Fix `VITE_API_BASE`, ensure the Render API allows your Netlify origin, then **redeploy**.
3. **Completely unstyled** — in **Network**, check that `/assets/index-….css` returns **200**. If you deploy under a subpath, you need a matching Vite `base` (rare for root sites like `*.netlify.app`).
4. **Stripe** — the publishable key must be set in Netlify **build** env, not only locally.

## Backend (other repo)

Open **`buffalomoneysend-backend`** and follow its `README.md` (Render Blueprint `render.yaml` or manual Web Service, Stripe env vars, health check `/api/health`).

## Local full stack

1. Terminal A — API: in `buffalomoneysend-backend`, `npm run dev` (port 4000).
2. Terminal B — front end: in this folder, `npm run dev` (Vite proxies `/api` to `localhost:4000`).

`VITE_API_BASE` can stay empty for local dev if you use the Vite dev server and proxy.
