# Complete Setup Guide - AI Diagnostic System

## 🚀 Quick Start

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file in `backend/` directory:**
   ```env
   GEMINI_API_KEY=
   SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

6. **Run backend:**
   ```bash
   python app.py
   ```
   Backend runs on `http://localhost:5000`

### Step 2: Database Setup

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `supabase_migration_diagnostics.sql`
3. This creates all required tables with RLS policies

### Step 3: Frontend Setup

1. **Create `.env` file in root directory:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

2. **Install dependencies (if not done):**
   ```bash
   npm install
   ```

3. **Run frontend:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📋 System Flow

1. **User completes onboarding** → Chapters marked as "good" or "weak" are available
2. **User clicks "Start Diagnostic"** → Backend generates test via Gemini API
3. **User takes test** → 30-minute timer, auto-submit
4. **Results evaluated** → Pass/fail based on bucket performance
5. **Dashboard shows results** → Progress rings, detailed breakdown
6. **Generate roadmap** → AI creates personalized learning plan

## 🔑 Key Features

✅ **AI-Generated Tests** - No hardcoded questions  
✅ **Automatic Evaluation** - No AI grading, uses stored answers  
✅ **Bucket-Based Scoring** - Basic, Conceptual, Application  
✅ **Progress Tracking** - Visual progress rings  
✅ **AI Roadmap** - Personalized weekly learning plan  
✅ **No Retry** - One attempt per chapter  

## 📁 Project Structure

```
Phase 1/
├── backend/
│   ├── app.py                    # Flask main application
│   ├── services/
│   │   ├── gemini_service.py    # Gemini AI integration
│   │   └── supabase_service.py  # Supabase database operations
│   ├── utils/
│   │   └── validators.py        # Request validation
│   └── requirements.txt
├── src/
│   ├── pages/
│   │   ├── DiagnosticTest.jsx   # Test taking page
│   │   └── Dashboard.jsx        # Enhanced dashboard with tabs
│   ├── services/
│   │   └── api.js               # API service layer
│   └── ...
└── supabase_migration_diagnostics.sql
```

## 🧪 Testing

1. Complete onboarding with chapters marked "good" or "weak"
2. Go to Dashboard → Overview tab
3. Click "Start Diagnostic" for available chapter
4. Answer questions (30 min limit)
5. View results in Test Details tab
6. Generate roadmap in Roadmap tab

## ⚠️ Important Notes

- **Environment Variables**: Never commit `.env` files
- **API Keys**: Use environment variables only
- **Service Role Key**: Required for backend database operations
- **CORS**: Backend configured for localhost:5173 and localhost:3000

## 🐛 Troubleshooting

**Backend won't start:**
- Check all environment variables are set
- Verify Python version (3.8+)
- Check port 5000 is available

**Frontend can't connect:**
- Verify backend is running
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors

**Diagnostic generation fails:**
- Verify Gemini API key is valid
- Check API quota/limits
- Review backend logs

**Database errors:**
- Run SQL migration
- Check RLS policies
- Verify service role key

