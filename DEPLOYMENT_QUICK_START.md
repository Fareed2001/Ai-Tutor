# 🚀 Quick Start: Deploy to Vercel

## Step 1: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import repository: `Fareed2001/Ai-Tutor`
3. **Add Environment Variables** (Settings → Environment Variables):

   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   VITE_SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_MBKzbx-k-oXO0z1zGyl6lQ_Akbp8D1K
   ```

4. Click **Deploy** ✅

**Note:** Update `VITE_API_BASE_URL` after deploying backend (Step 2)

---

## Step 2: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select your repository
3. Set **Root Directory**: `backend`
4. **Add Environment Variables**:

   ```
   GEMINI_API_KEY=AIzaSyAxscVthwiCA12gBCoacFh4AwiX8P2DCpI
   SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cGhrcnN4bHRyY2RvdHZpZnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ3MjgxMSwiZXhwIjoyMDgyMDQ4ODExfQ.ham3K3bPu9IVaw0kRL--Fpv0OSuSAKS15VEQYGmfdKM
   FLASK_ENV=production
   FLASK_DEBUG=False
   FRONTEND_URL=https://your-project.vercel.app
   ```

5. Railway will generate a URL → Copy it
6. Go back to Vercel → Update `VITE_API_BASE_URL` with Railway URL
7. Redeploy frontend ✅

---

## ✅ Done!

Your app should now be live:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-app.railway.app`

---

📖 **For detailed instructions, see `VERCEL_DEPLOYMENT_GUIDE.md`**

