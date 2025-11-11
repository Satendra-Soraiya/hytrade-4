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
