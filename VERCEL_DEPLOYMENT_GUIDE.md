# Vercel Deployment Guide

This guide will help you deploy your AI-Powered O Level Chemistry Tutor application to Vercel.

## 📋 Overview

- **Frontend**: Deploy to Vercel (React + Vite)
- **Backend**: Deploy separately to Railway/Render/Heroku (Flask)

## 🚀 Step 1: Deploy Frontend to Vercel

### 1.1 Push Code to GitHub
Make sure your code is pushed to GitHub (already done ✅)

### 1.2 Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `Fareed2001/Ai-Tutor`
4. Vercel will auto-detect it's a Vite project

### 1.3 Configure Build Settings

Vercel should auto-detect these settings:
- **Framework Preset**: Vite
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 1.4 Add Environment Variables

In Vercel project settings, go to **Settings → Environment Variables** and add:

#### Frontend Environment Variables (for Vercel):

```
VITE_API_BASE_URL=https://your-backend-url.railway.app
VITE_SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_MBKzbx-k-oXO0z1zGyl6lQ_Akbp8D1K
```

**Important Notes:**
- Replace `https://your-backend-url.railway.app` with your actual backend URL (after deploying backend)
- Get `VITE_SUPABASE_ANON_KEY` from your Supabase dashboard (Settings → API → anon/public key)
- `VITE_API_BASE_URL` should point to your deployed backend (not localhost)

### 1.5 Deploy

Click **"Deploy"** and wait for the build to complete.

After deployment, you'll get a URL like: `https://your-project.vercel.app`

---

## 🔧 Step 2: Deploy Backend (Flask)

Flask apps don't work well on Vercel serverless functions. Deploy to one of these platforms:

### Option A: Railway (Recommended - Easy Setup)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect Python
5. Set **Root Directory** to: `backend`
6. Add environment variables:

```
GEMINI_API_KEY=AIzaSyAxscVthwiCA12gBCoacFh4AwiX8P2DCpI
SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cGhrcnN4bHRyY2RvdHZpZnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ3MjgxMSwiZXhwIjoyMDgyMDQ4ODExfQ.ham3K3bPu9IVaw0kRL--Fpv0OSuSAKS15VEQYGmfdKM
FLASK_ENV=production
FLASK_DEBUG=False
```

7. Railway will generate a URL like: `https://your-app.railway.app`
8. Update CORS in `backend/app.py` to include your Vercel frontend URL

### Option B: Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ai-tutor-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (install gunicorn first)
   - **Root Directory**: `backend`
5. Add environment variables (same as Railway)
6. Deploy

### Option C: Heroku

1. Install Heroku CLI
2. Create `Procfile` in `backend/` folder:
   ```
   web: gunicorn app:app
   ```
3. Deploy using Heroku CLI

---

## 🔄 Step 3: Update CORS and Environment Variables

### 3.1 Update Backend CORS

After deploying frontend, update `backend/app.py` to include your Vercel URL:

```python
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-project.vercel.app"  # Add your Vercel URL
]
```

Or set it via environment variable:
```python
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "")
]
```

Then add `FRONTEND_URL` to your backend environment variables.

### 3.2 Update Frontend API URL

After deploying backend, update `VITE_API_BASE_URL` in Vercel:
- Go to Vercel project → Settings → Environment Variables
- Update `VITE_API_BASE_URL` to your backend URL
- Redeploy the frontend

---

## 📝 Environment Variables Summary

### Frontend (Vercel):
```
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_MBKzbx-k-oXO0z1zGyl6lQ_Akbp8D1K
```

### Backend (Railway/Render):
```
GEMINI_API_KEY=AIzaSyAxscVthwiCA12gBCoacFh4AwiX8P2DCpI
SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cGhrcnN4bHRyY2RvdHZpZnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ3MjgxMSwiZXhwIjoyMDgyMDQ4ODExfQ.ham3K3bPu9IVaw0kRL--Fpv0OSuSAKS15VEQYGmfdKM
FLASK_ENV=production
FLASK_DEBUG=False
FRONTEND_URL=https://your-project.vercel.app
```

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables added to both platforms
- [ ] CORS updated in backend to allow Vercel domain
- [ ] Frontend API URL updated to point to deployed backend
- [ ] Test the deployed application

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure backend CORS includes your Vercel URL
- Check that `FRONTEND_URL` environment variable is set correctly

### API Connection Issues
- Verify `VITE_API_BASE_URL` in Vercel points to your backend
- Check backend logs for errors
- Ensure backend is running and accessible

### Build Failures
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

---

## 🔒 Security Notes

⚠️ **Important**: The API keys shown in this guide are exposed. In production:
- Never commit `.env` files to GitHub
- Use environment variables in deployment platforms
- Rotate API keys if they've been exposed
- Consider using Vercel's environment variable encryption

---

For more help, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)

