# Onboarding System Setup Guide

## Overview

A production-ready multi-step onboarding system for the AI-powered O Level Chemistry learning platform. Students must complete onboarding before accessing the dashboard.

## Files Created

### 1. Database Migration
- `supabase_migration_student_profile.sql` - Creates the `student_profile` table

### 2. Components
- `src/components/ProtectedRoute.jsx` - Route protection with onboarding check
- `src/pages/Onboarding.jsx` - Multi-step onboarding form
- `src/pages/Dashboard.jsx` - Student dashboard (placeholder for AI tutor integration)

### 3. Updated Files
- `src/App.jsx` - Added onboarding and dashboard routes
- `src/pages/Login.jsx` - Redirects based on onboarding status
- `src/pages/Signup.jsx` - Redirects to onboarding after signup

## Setup Instructions

### Step 1: Run Database Migrations

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run `supabase_migration.sql` first (creates user_profile table)
3. Then run `supabase_migration_student_profile.sql` (creates student_profile table)

This creates:
- `user_profile` table for username-based authentication
- `student_profile` table with all required fields
- Row Level Security (RLS) policies
- Indexes for performance
- Auto-update trigger for `updated_at` timestamp

### Step 2: Verify Routes

The app now has these routes:
- `/` - Landing page (public)
- `/login` - Login page (public)
- `/signup` - Signup page (public)
- `/onboarding` - Onboarding form (protected, requires login)
- `/dashboard` - Student dashboard (protected, requires onboarding completion)

## Onboarding Flow

### Step 1: Student Background
- Student type (School student / Private candidate)
- Has studied Chemistry before (Yes / No)

### Step 2: Confidence & Difficulty
- Confidence level (Very weak / Average / Good / Very confident)
- Difficult areas (multi-select: Definitions, Numericals, Theory, MCQs, Past paper questions)

### Step 3: Syllabus Coverage
- 12 O Level Chemistry chapters
- For each chapter: "Understood well" / "Need revision" / "Not studied"

### Step 4: Goals
- Target grade (A*, A, B, Pass)
- Weekly study time (1–2 hours / 3–5 hours / 6–10 hours)

### Step 5: Exam Session
- Exam session (May / June 2026 / Oct / Nov 2026 / 2027)

## How It Works

1. **After Signup**: User is redirected to `/onboarding`
2. **After Login**: 
   - If `onboarding_completed = false` → `/onboarding`
   - If `onboarding_completed = true` → `/dashboard`
3. **Onboarding Completion**: 
   - Data saved to `student_profile` table
   - `onboarding_completed` set to `true`
   - Redirect to `/dashboard`

## Data Structure

The `student_profile` table stores:
```json
{
  "user_id": "uuid",
  "student_type": "School student" | "Private candidate",
  "studied_chemistry_before": true | false,
  "confidence_level": "Very weak" | "Average" | "Good" | "Very confident",
  "difficult_areas": ["Definitions", "Numericals", ...],
  "chapters": {
    "Stoichiometry": "good" | "weak" | "not_studied",
    "Atomic Structure": "good" | "weak" | "not_studied",
    ...
  },
  "target_grade": "A*" | "A" | "B" | "Pass",
  "study_hours": "1–2 hours" | "3–5 hours" | "6–10 hours",
  "exam_session": "May / June 2026" | "Oct / Nov 2026" | "2027",
  "onboarding_completed": true | false
}
```

## Features

✅ Multi-step form with progress indicator  
✅ Form validation (Next button disabled until required fields filled)  
✅ Mobile responsive design  
✅ Professional EdTech UI  
✅ Protected routes with automatic redirects  
✅ Data persistence in Supabase  
✅ Ready for AI tutor integration  

## Testing

1. Sign up a new user → Should redirect to `/onboarding`
2. Complete onboarding → Should redirect to `/dashboard`
3. Log out and log back in → Should go directly to `/dashboard`
4. Try accessing `/dashboard` without onboarding → Should redirect to `/onboarding`

## Next Steps

The dashboard is a placeholder. You can now:
- Integrate AI tutor functionality
- Use the `student_profile` data to personalize learning
- Build chapter-based learning modules
- Create progress tracking features



