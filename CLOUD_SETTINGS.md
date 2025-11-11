Cloud Settings for Hytrade (Vercel + Render)

Overview
- GitHub repo: https://github.com/Satendra-Soraiya/hytrade-4.git
- Frontend (Vercel): project `hytrade-4`, domain `www.hytrade.in`
- Dashboard (Vercel): project `hytrade-dashboard`, domains `dashboard.hytrade.in`, `hytrade-dashboard.vercel.app`
- Backend (Render): service `hytrade-backend`, domain `api.hytrade.in`

Required Environment Variables

Frontend (Next.js, project: `hytrade-4`)
- `NEXT_PUBLIC_API_URL` → `https://api.hytrade.in`
- `NEXT_PUBLIC_DASHBOARD_URL` → `https://dashboard.hytrade.in`
- `NEXT_PUBLIC_APP_URL` → `https://www.hytrade.in`

Dashboard (Vite, project: `hytrade-dashboard`)
- `VITE_API_URL` → `https://api.hytrade.in`
- `VITE_FRONTEND_URL` → `https://www.hytrade.in`
- `VITE_DASHBOARD_URL` → `https://dashboard.hytrade.in`

Backend (Render, service: `hytrade-backend`)
- `NODE_ENV` → `production`
- `PORT` → `3000` (Render will set internal port; use default if unsure)
- `MONGODB_URI` → your production MongoDB connection string
- `JWT_SECRET` → strong secret for signing tokens

Notes
- Frontend proxies API calls via `next.config.mjs` rewrites to `NEXT_PUBLIC_API_URL`; set this exactly to `https://api.hytrade.in`.
- Dashboard validates tokens via `GET /api/auth/verify` and no longer sends `Content-Type` on GET to avoid preflight.
- Logout on dashboard redirects to `VITE_FRONTEND_URL` (fallback now points to `https://www.hytrade.in`).

Step-by-Step (Browser-Only)
1) Vercel → `hytrade-4` (Frontend)
   - Settings → Environment Variables: add values listed above, scope to Production and Preview.
   - Deploy a new Preview by opening a PR (or Trigger Deployment) and test.

2) Vercel → `hytrade-dashboard`
   - Settings → Environment Variables: add values listed above.
   - Ensure domains are configured: `dashboard.hytrade.in` and `hytrade-dashboard.vercel.app`.

3) Render → `hytrade-backend`
   - Settings → Environment → add `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`.
   - Confirm service domain: `api.hytrade.in` and CORS allows `https://www.hytrade.in` and `https://dashboard.hytrade.in`.

4) Test Preview Deployments end-to-end
   - Frontend signup → auto-redirect to dashboard with `?token=...`.
   - Dashboard should show portfolio, markets, trade, algorithms, profile.
   - Logout should redirect back to `www.hytrade.in` with message.

5) Merge to Production
   - After successful preview verification, merge PRs to `main` to promote.

Reference
- Development examples are in `.env.example` files:
  - `frontend2/.env.example`
  - `new-dashboard/.env.example`