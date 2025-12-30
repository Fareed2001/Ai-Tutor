# Environment Variables Quick Reference

## 🎯 For Vercel (Frontend)

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

*(Update this after deploying backend - replace with your actual Railway/Render URL)*

```
VITE_SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=sb_publishable_MBKzbx-k-oXO0z1zGyl6lQ_Akbp8D1K
```

---

## 🔧 For Railway/Render (Backend)

Add these in your backend deployment platform:

```
GEMINI_API_KEY=AIzaSyAxscVthwiCA12gBCoacFh4AwiX8P2DCpI
```

```
SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cGhrcnN4bHRyY2RvdHZpZnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ3MjgxMSwiZXhwIjoyMDgyMDQ4ODExfQ.ham3K3bPu9IVaw0kRL--Fpv0OSuSAKS15VEQYGmfdKM
```

```
FLASK_ENV=production
```

```
FLASK_DEBUG=False
```

```
FRONTEND_URL=https://your-project.vercel.app
```

*(Update this after deploying frontend - replace with your actual Vercel URL)*

---

## 📝 Deployment Order

1. **Deploy Backend First** (Railway/Render)
   - Get backend URL (e.g., `https://your-app.railway.app`)
   
2. **Deploy Frontend** (Vercel)
   - Use backend URL in `VITE_API_BASE_URL`
   - Get frontend URL (e.g., `https://your-project.vercel.app`)
   
3. **Update Backend CORS**
   - Add frontend URL to `FRONTEND_URL` environment variable
   - Redeploy backend

---

## ⚠️ Important Notes

- Never commit `.env` files to GitHub
- All these values should be set as environment variables in your deployment platforms
- After deployment, test your API endpoints to ensure everything works

