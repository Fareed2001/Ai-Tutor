# Detailed Setup Guide - Step by Step

## 📋 Prerequisites

Before starting, ensure you have:
- Python 3.8+ installed
- Node.js 16+ and npm installed
- Supabase account and project
- Gemini API key (provided: `AIzaSyAMAjBPgDI0QdBGx1XTlNX4QDG142r4gNI`)
- Supabase URL: `https://ixphkrsxltrcdotviftp.supabase.co`
- Supabase Service Role Key (get from Supabase Dashboard)

---

## 🔧 STEP 1: Backend Setup (Flask)

### 1.1 Navigate to Backend Directory

Open your terminal/command prompt and navigate to the backend folder:

```bash
cd "C:\Users\Techmile-Solutions\Desktop\Phase 1\backend"
```

Or if you're already in the Phase 1 directory:
```bash
cd backend
```

### 1.2 Create Virtual Environment

**Windows:**
```bash
python -m venv venv
```

**Mac/Linux:**
```bash
python3 -m venv venv
```

This creates a virtual environment folder called `venv` in your backend directory.

### 1.3 Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` at the beginning of your command prompt, indicating the virtual environment is active.

### 1.4 Install Python Dependencies

With the virtual environment activated, install all required packages:

```bash
pip install -r requirements.txt
```

This will install:
- Flask (web framework)
- flask-cors (CORS handling)
- python-dotenv (environment variables)
- google-generativeai (Gemini API)
- supabase (Supabase client)
- requests (HTTP library)

**Expected output:** All packages should install successfully without errors.

### 1.5 Get Supabase Service Role Key

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API** (left sidebar)
4. Find **Service Role Key** (NOT the anon key)
5. Copy this key (it starts with `eyJ...`)

⚠️ **Important:** Service Role Key bypasses RLS. Keep it secret and never commit it to git.

### 1.6 Create Backend .env File

In the `backend` folder, create a new file named `.env` (no extension):

**Windows (Command Prompt):**
```cmd
cd backend
type nul > .env
```

**Windows (PowerShell):**
```powershell
cd backend
New-Item -Path .env -ItemType File
```

**Mac/Linux:**
```bash
cd backend
touch .env
```

### 1.7 Add Environment Variables to .env

Open the `.env` file in a text editor and add:

```env
GEMINI_API_KEY=AIzaSyAMAjBPgDI0QdBGx1XTlNX4QDG142r4gNI
SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

**Replace `your_service_role_key_here`** with the actual Service Role Key from step 1.5.

**Example:**
```env
GEMINI_API_KEY=AIzaSyAMAjBPgDI0QdBGx1XTlNX4QDG142r4gNI
SUPABASE_URL=https://ixphkrsxltrcdotviftp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cGhrcnN4bHRyY2RvdHZpZnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5ODk2NzIwMCwiZXhwIjoyMDE0NTQzMjAwfQ.example
FLASK_ENV=development
FLASK_DEBUG=True
```

### 1.8 Verify Backend Structure

Your `backend` folder should look like this:
```
backend/
├── .env                    ← Your environment variables (NEW)
├── app.py
├── requirements.txt
├── venv/                   ← Virtual environment folder
├── services/
│   ├── gemini_service.py
│   └── supabase_service.py
└── utils/
    └── validators.py
```

### 1.9 Test Backend Installation

With virtual environment activated, test if Flask can start:

```bash
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

If you see this, the backend is running! Press `Ctrl+C` to stop it.

**Common Issues:**
- **"Module not found"**: Run `pip install -r requirements.txt` again
- **"GEMINI_API_KEY not found"**: Check your `.env` file exists and has correct variable names
- **Port 5000 in use**: Change port in `app.py` last line to `app.run(debug=True, port=5001)`

---

## 🗄️ STEP 2: Database Setup (Supabase)

### 2.1 Access Supabase SQL Editor

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

### 2.2 Run First Migration: user_profile Table

1. Open the file `supabase_migration.sql` from your project
2. Copy **ALL** the SQL code (from line 1 to the end)
3. Paste it into the Supabase SQL Editor
4. Click **Run** button (or press `Ctrl+Enter`)

**Expected result:** 
- Success message: "Success. No rows returned"
- This creates the `user_profile` table for username-based authentication

### 2.3 Run Second Migration: student_profile Table

1. Open the file `supabase_migration_student_profile.sql`
2. Copy **ALL** the SQL code
3. In SQL Editor, click **New Query** (or clear previous query)
4. Paste the SQL code
5. Click **Run**

**Expected result:**
- Success message
- Creates `student_profile` table for onboarding data

### 2.4 Run Third Migration: Diagnostics Tables

1. Open the file `supabase_migration_diagnostics.sql`
2. Copy **ALL** the SQL code
3. In SQL Editor, click **New Query**
4. Paste the SQL code
5. Click **Run**

**Expected result:**
- Success message
- Creates 3 tables: `diagnostics`, `diagnostic_results`, `roadmaps`

### 2.5 Verify Tables Created

1. In Supabase Dashboard, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ `user_profile`
   - ✅ `student_profile`
   - ✅ `diagnostics`
   - ✅ `diagnostic_results`
   - ✅ `roadmaps`

### 2.6 Verify RLS Policies

1. In Supabase Dashboard, go to **Authentication** → **Policies**
2. Or go to **Table Editor** → Select any table → Click **Policies** tab
3. You should see RLS policies for each table

**Common Issues:**
- **"Table already exists"**: This is fine if you're re-running. The migration has `DROP TABLE IF EXISTS`
- **"Permission denied"**: Make sure you're using the SQL Editor (not Table Editor) and have proper permissions
- **"Syntax error"**: Check you copied the entire SQL file, including all lines

---

## 🎨 STEP 3: Frontend Setup (React)

### 3.1 Navigate to Project Root

Open terminal in the project root directory:

```bash
cd "C:\Users\Techmile-Solutions\Desktop\Phase 1"
```

### 3.2 Install Node Dependencies

```bash
npm install
```

This installs:
- React and React DOM
- React Router DOM
- Supabase client
- Vite and plugins
- Tailwind CSS
- PostCSS and Autoprefixer

**Expected output:** 
- Packages downloading and installing
- No errors
- Takes 1-2 minutes

**Common Issues:**
- **"npm not found"**: Install Node.js from nodejs.org
- **"Permission denied"**: On Mac/Linux, try `sudo npm install` (not recommended) or fix npm permissions
- **Network errors**: Check internet connection, try `npm install` again

### 3.3 Create Frontend .env File

In the **root directory** (Phase 1 folder), create `.env` file:

**Windows (Command Prompt):**
```cmd
type nul > .env
```

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**Mac/Linux:**
```bash
touch .env
```

### 3.4 Add Frontend Environment Variables

Open the `.env` file and add:

```env
VITE_API_BASE_URL=http://localhost:5000
```

**Important Notes:**
- Variable name **MUST** start with `VITE_` for Vite to read it
- This tells the frontend where to find the backend API
- If backend runs on different port, update accordingly

### 3.5 Verify Frontend Structure

Your root directory should have:
```
Phase 1/
├── .env                    ← Frontend environment variables (NEW)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── pages/
│   ├── components/
│   └── services/
└── backend/
    └── .env                ← Backend environment variables
```

### 3.6 Test Frontend Installation

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

If you see this, frontend is running! Open `http://localhost:5173` in your browser.

**Common Issues:**
- **"Port 5173 in use"**: Vite will automatically use next available port (5174, 5175, etc.)
- **"Cannot find module"**: Run `npm install` again
- **"VITE_API_BASE_URL not defined"**: Check `.env` file exists and variable name starts with `VITE_`

---

## 🚀 STEP 4: Running the Complete System

### 4.1 Start Backend Server

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
# OR
source venv/bin/activate       # Mac/Linux

python app.py
```

**Keep this terminal open!** You should see:
```
 * Running on http://127.0.0.1:5000
```

### 4.2 Start Frontend Server

**Terminal 2 - Frontend:**
```bash
# In project root directory
npm run dev
```

**Keep this terminal open!** You should see:
```
  ➜  Local:   http://localhost:5173/
```

### 4.3 Test the System

1. **Open browser**: Go to `http://localhost:5173`
2. **Sign up**: Create a new account
3. **Complete onboarding**: Fill all 5 steps
4. **Go to dashboard**: Should see overview tab
5. **Start diagnostic**: Click "Start Diagnostic" for available chapter
6. **Take test**: Answer questions (30 min timer)
7. **View results**: Check Test Details tab
8. **Generate roadmap**: Go to Roadmap tab and click "Generate Roadmap"

---

## ✅ Verification Checklist

### Backend Verification

- [ ] Virtual environment created and activated
- [ ] All packages installed (`pip list` shows Flask, google-generativeai, etc.)
- [ ] `.env` file exists in `backend/` folder
- [ ] All environment variables set correctly
- [ ] Backend starts without errors (`python app.py`)
- [ ] Backend accessible at `http://localhost:5000`
- [ ] Health endpoint works: `http://localhost:5000/health`

### Database Verification

- [ ] All 3 SQL migrations run successfully
- [ ] 5 tables visible in Supabase Table Editor:
  - `user_profile`
  - `student_profile`
  - `diagnostics`
  - `diagnostic_results`
  - `roadmaps`
- [ ] RLS policies enabled on all tables
- [ ] Service Role Key copied from Supabase Dashboard

### Frontend Verification

- [ ] Node modules installed (`node_modules` folder exists)
- [ ] `.env` file exists in root directory
- [ ] `VITE_API_BASE_URL` set correctly
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] No console errors in browser

### Integration Verification

- [ ] Backend and Frontend running simultaneously
- [ ] Can sign up new user
- [ ] Can complete onboarding
- [ ] Can access dashboard
- [ ] Can start diagnostic test
- [ ] Can submit test and see results
- [ ] Can generate roadmap

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: "GEMINI_API_KEY environment variable is required"**
- **Solution**: Check `.env` file exists in `backend/` folder
- Verify variable name is exactly `GEMINI_API_KEY` (case-sensitive)
- Make sure no extra spaces around `=`

**Problem: "SUPABASE_SERVICE_ROLE_KEY environment variable is required"**
- **Solution**: Get Service Role Key from Supabase Dashboard → Settings → API
- Paste it in `.env` file
- Make sure it's the Service Role Key, not the anon key

**Problem: "Port 5000 already in use"**
- **Solution**: 
  - Option 1: Close other application using port 5000
  - Option 2: Change port in `app.py` last line: `app.run(debug=True, port=5001)`
  - Update frontend `.env`: `VITE_API_BASE_URL=http://localhost:5001`

**Problem: "ModuleNotFoundError: No module named 'flask'"**
- **Solution**: 
  - Make sure virtual environment is activated (see `(venv)` in prompt)
  - Run `pip install -r requirements.txt`

### Database Issues

**Problem: "Table already exists"**
- **Solution**: This is normal if re-running migrations. The SQL has `DROP TABLE IF EXISTS` so it's safe.

**Problem: "Permission denied"**
- **Solution**: Make sure you're running SQL in Supabase SQL Editor, not Table Editor
- Check you have proper project permissions

**Problem: "RLS policy error"**
- **Solution**: Make sure all migration SQL was run completely
- Check RLS is enabled: Go to Table Editor → Select table → Check "RLS enabled" toggle

### Frontend Issues

**Problem: "Cannot connect to backend" or CORS errors**
- **Solution**: 
  - Verify backend is running (`http://localhost:5000/health`)
  - Check `VITE_API_BASE_URL` in `.env` matches backend URL
  - Check backend CORS settings in `app.py` include your frontend URL

**Problem: "VITE_API_BASE_URL is undefined"**
- **Solution**: 
  - Variable name MUST start with `VITE_`
  - Restart dev server after changing `.env`
  - Check `.env` file is in root directory, not in `src/`

**Problem: "Failed to load diagnostic"**
- **Solution**: 
  - Check backend is running
  - Check backend logs for errors
  - Verify Gemini API key is correct
  - Check Supabase connection in backend

---

## 📝 Quick Reference Commands

### Backend
```bash
# Navigate to backend
cd backend

# Activate virtual environment
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
```

### Frontend
```bash
# Navigate to root
cd "C:\Users\Techmile-Solutions\Desktop\Phase 1"

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Database
- Go to: https://supabase.com/dashboard
- SQL Editor → Run migrations in order:
  1. `supabase_migration.sql`
  2. `supabase_migration_student_profile.sql`
  3. `supabase_migration_diagnostics.sql`

---

## 🎯 Success Indicators

You'll know everything is working when:

1. ✅ Backend shows: `Running on http://127.0.0.1:5000`
2. ✅ Frontend shows: `Local: http://localhost:5173/`
3. ✅ Browser opens landing page without errors
4. ✅ Can sign up and create account
5. ✅ Can complete onboarding
6. ✅ Dashboard loads with tabs
7. ✅ Can start diagnostic test
8. ✅ Test generates and displays questions
9. ✅ Can submit test and see results
10. ✅ Can generate and view roadmap

---

## 📞 Need Help?

If you encounter issues:
1. Check error messages in terminal/console
2. Verify all environment variables are set
3. Ensure all migrations ran successfully
4. Check both backend and frontend are running
5. Review the troubleshooting section above

The system is production-ready once all steps are completed! 🚀

