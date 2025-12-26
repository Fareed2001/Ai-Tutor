-- ============================================
-- Supabase Migration: student_profile Table
-- Onboarding Data Storage
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- Drop existing objects if they exist (for clean reinstall)
DROP TABLE IF EXISTS public.student_profile CASCADE;

-- ============================================
-- Create student_profile table
-- ============================================
CREATE TABLE public.student_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  student_type TEXT,
  studied_chemistry_before BOOLEAN,
  confidence_level TEXT,
  difficult_areas TEXT[],
  chapters JSONB,
  target_grade TEXT,
  study_hours TEXT,
  exam_session TEXT,
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_student_profile_user_id ON public.student_profile(user_id);

-- Create index on onboarding_completed for filtering
CREATE INDEX idx_student_profile_onboarding_completed ON public.student_profile(onboarding_completed);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.student_profile ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own student profile"
  ON public.student_profile
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own student profile"
  ON public.student_profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own student profile"
  ON public.student_profile
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_student_profile_updated_at
  BEFORE UPDATE ON public.student_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration Complete
-- ============================================



