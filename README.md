# AI-Powered O Level Chemistry Tutor

A full-stack web application for personalized chemistry learning with AI-powered diagnostics, tutoring, and roadmap generation.

## 🚀 Features

- **Student Onboarding**: Multi-step form to capture student background and goals
- **AI Diagnostic Tests**: Chapter-based MCQ tests with automatic evaluation
- **AI Tutoring**: Interactive Q&A and teaching mode using Gemini AI
- **Learning Roadmap**: Personalized study plans based on diagnostic results
- **Progress Tracking**: Visual dashboard with chapter progress and scores

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Supabase Client

### Backend
- Python Flask
- Google Gemini AI (2.5 Flash Lite)
- Supabase (PostgreSQL + Storage)

### Database
- Supabase PostgreSQL
- Row Level Security (RLS)
- PDF Storage for chapter materials

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Supabase account
- Google Gemini API key

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Phase-1
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FLASK_ENV=development
FLASK_DEBUG=True
```

Run backend:
```bash
python app.py
```

### 3. Frontend Setup

```bash
npm install
```

Create `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

### 4. Database Setup

Run SQL migrations in Supabase SQL Editor (in order):
1. `supabase_migration.sql` - User profiles
2. `supabase_migration_student_profile.sql` - Student onboarding data
3. `supabase_migration_diagnostics.sql` - Diagnostic tests and results
4. `supabase_migration_chemistry_chapters.sql` - Chapter content

## 📁 Project Structure

```
Phase-1/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── services/
│   │   ├── gemini_service.py  # AI diagnostic generation
│   │   ├── tutor_service.py   # AI tutoring functions
│   │   ├── chapter_loader.py  # Chapter data loading
│   │   └── supabase_service.py # Database operations
│   └── requirements.txt
├── src/
│   ├── pages/                 # React pages
│   ├── components/            # Reusable components
│   ├── services/              # Frontend API service
│   └── hooks/                # React hooks
├── supabase_migration*.sql   # Database migrations
└── package.json
```

## 🔐 Environment Variables

**Backend (.env):**
- `GEMINI_API_KEY` - Google Gemini API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Frontend (.env):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_BASE_URL` - Backend API URL

## 📝 API Endpoints

- `POST /generate-diagnostic` - Generate diagnostic test
- `POST /submit-diagnostic` - Submit test answers
- `GET /dashboard` - Get dashboard data
- `POST /generate-roadmap` - Generate learning roadmap

## 🎯 Usage

1. **Sign Up/Login**: Create account with username
2. **Complete Onboarding**: Fill 5-step onboarding form
3. **Take Diagnostic**: Start diagnostic test for available chapters
4. **View Results**: See scores and correct answers
5. **Get Roadmap**: Generate personalized study plan
6. **AI Tutor**: Ask questions or get chapter explanations

## 📄 License

This project is private and proprietary.

## 👥 Contributors

Techmile Solutions

---

For detailed setup instructions, see `DETAILED_SETUP_GUIDE.md`


