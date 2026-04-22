# BuffaloMoneySend — Web (Vite + React)

International transfer UI and Stripe Elements checkout.

## Related repo

The **HTTP API (Express, Stripe, webhooks)** is maintained separately: **`buffalomoneysend-backend`** (adjacent directory if you use the same layout, or a second GitHub repository).

**Local full stack:** run the backend from that repo on port **4000**, then from this folder run `npm run dev` (Vite proxies `/api` to `localhost:4000`).

## Scripts

- `npm run dev` — Vite dev server  
- `npm run build` — production build to `dist/`  
- `npm run preview` — preview `dist` (set `VITE_API_BASE` or run API on 4000; see `vite.config.ts`)

## Deploy

See **`DEPLOY.md`** (Netlify + `VITE_API_BASE` to your live API URL).
