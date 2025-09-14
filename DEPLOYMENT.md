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
3. Set Root Directory to `frontend`
4. Set Environment Variables:
   - `REACT_APP_API_URL=https://your-backend-url.onrender.com`
   - `REACT_APP_DASHBOARD_URL=https://your-dashboard-url.vercel.app`

### **3. Dashboard (Vercel)**
1. Create another Vercel project
2. Set Root Directory to `new-dashboard`
3. Set Environment Variables:
   - `VITE_API_URL=https://your-backend-url.onrender.com`

## 🔗 **URL Configuration**
After deployment, update the environment variables with actual URLs:

### **Backend URL (Render)**
- Format: `https://hytrade-backend.onrender.com`
- Update in both frontend and dashboard environment variables

### **Frontend URL (Vercel)**
- Format: `https://hytrade-frontend.vercel.app`
- Update in dashboard environment variables

### **Dashboard URL (Vercel)**
- Format: `https://hytrade-dashboard.vercel.app`
- Update in frontend environment variables

## 🛠️ **Local Development**
1. Copy `.env.example` to `.env.local` in each project
2. Update URLs to use `localhost` for local development
3. Run `npm start` in each directory

## 🔍 **Troubleshooting**
- Check CORS configuration in backend
- Verify environment variables are set correctly
- Ensure all URLs are using HTTPS in production
