# 🚀 Hytrade Deployment Guide

## 📋 **Current Setup**
- **Frontend (Landing Page)**: Vercel + GitHub
- **Dashboard**: Vercel + GitHub  
- **Backend**: Render + GitHub

## 🔧 **Deployment Steps**

### **1. Backend (Render)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Use the `render.yaml` configuration
5. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`

### **2. Frontend (Vercel)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Set Root Directory to `frontend2`
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://api.hytrade.in`
   - `NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.hytrade.in`
   - `NEXT_PUBLIC_APP_URL=https://www.hytrade.in`

### **3. Dashboard (Vercel)**
1. Create another Vercel project
2. Set Root Directory to `new-dashboard`
3. Set Environment Variables:
   - `VITE_API_URL=https://api.hytrade.in`
   - `VITE_FRONTEND_URL=https://www.hytrade.in`
   - `VITE_DASHBOARD_URL=https://dashboard.hytrade.in`

### **4. Backend CORS (Render)**
- Ensure allowed origins include:
  - `https://www.hytrade.in`
  - `https://dashboard.hytrade.in`
  - Preview domains if needed (optional)
  - Keep HTTPS enforced; cookies should use `Secure` and `SameSite=Lax`.

## 🔗 **URL Configuration**
After deployment, update the environment variables with actual URLs:

### **Backend URL (Render)**
- Prefer `https://api.hytrade.in` as canonical.
- Update in both frontend and dashboard environment variables.

### **Canonical Frontend Domain**
- Format: `https://www.hytrade.in`
- Use everywhere in production; avoid preview `vercel.app` URLs

### **Canonical Dashboard Domain**
- Format: `https://dashboard.hytrade.in`
- Update in frontend environment variables

## 🛠️ **Local Development**
1. Copy `.env.example` to `.env.local` in each project
2. Update URLs to use `localhost` for local development
3. Run `npm run dev` in each directory
   - Landing (`frontend2`): `http://localhost:3001`
   - Dashboard (`new-dashboard`): `http://localhost:5174`
   - Backend: `http://localhost:3002`

## ✅ **Production Rollout Checklist**
- [ ] Frontend env set: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_DASHBOARD_URL`, `NEXT_PUBLIC_APP_URL`
- [ ] Dashboard env set: `VITE_API_URL`, `VITE_FRONTEND_URL`, `VITE_DASHBOARD_URL`
- [ ] Backend CORS allowlist includes frontend + dashboard domains
- [ ] HTTPS enabled across all services
- [ ] Shared cookie persists across `*.hytrade.in` after login
- [ ] Logout clears shared cookie and both apps reflect logged-out state

## 🔍 **Troubleshooting**
- Check CORS configuration in backend
- Verify environment variables are set correctly
- Ensure all URLs are using HTTPS in production

---

## 🔄 **CI/CD: Auto-deploy on push to `main`**

To ensure every push to `main` deploys automatically across all services, the repo includes a GitHub Actions workflow and uses native platform auto-deploy settings.

### ✅ What’s configured
- Vercel projects (Landing and Dashboard) are linked to GitHub and deploy from `main` (`git-main` shows on active deployments).
- Render backend service is defined in `render.yaml` with `autoDeploy: true`.
- A multi-app GitHub Actions workflow is added at `.github/workflows/deploy.yml` to deploy both frontends (Vercel) and trigger backend deploy (Render) on each push to `main`.

### 🔐 Required GitHub Secrets
Add repository secrets in GitHub → Settings → Secrets and variables → Actions:
- `VERCEL_TOKEN` — Vercel token with deploy permission.
- `VERCEL_ORG_ID` — Vercel Org ID.
- `VERCEL_PROJECT_ID_FRONTEND2` — Project ID for `frontend2` (landing).
- `VERCEL_PROJECT_ID_DASHBOARD` — Project ID for `new-dashboard`.
- `RENDER_DEPLOY_HOOK_URL` — Deploy hook URL for the `hytrade-backend` Render service.

Notes:
- Project IDs are found in Vercel Dashboard → Project → Settings → General.
- Create the Render Deploy Hook in Service Settings and copy the URL.

### 🧭 Workflow behavior
On push to `main`:
- Frontend2 job runs `vercel pull` and `vercel deploy --prod` in `frontend2` (when secrets are present).
- Dashboard job runs the same in `new-dashboard`.
- Backend job POSTs the `RENDER_DEPLOY_HOOK_URL` to trigger a backend deploy.

### 🛠️ Platform settings to verify
- Vercel → Project Settings:
  - Production Branch: `main`
  - Git Auto Deploy: Enabled
  - Environment Variables: Production values set
- Render → Service Settings:
  - Branch: `main`
  - Auto-deploy: Enabled
  - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, etc.

### 🧪 Troubleshooting CI
- If a Vercel job fails, native Git integration should still deploy; check Vercel build logs.
- If the Render deploy does not trigger, verify the hook URL and service logs.
