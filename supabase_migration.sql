-- ============================================
-- Supabase Migration: user_profile Table
-- Username-based Authentication
-- Fresh Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================

-- Drop existing objects if they exist (for clean reinstall)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.user_profile CASCADE;

-- ============================================
-- Create user_profile table
-- Stores username only (password handled by Supabase Auth)
-- ============================================
CREATE TABLE public.user_profile (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on username for faster lookups
CREATE INDEX idx_user_profile_username ON public.user_profile(username);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profile
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can view any profile (for username lookup during login)
CREATE POLICY "Anyone can view profiles for login"
  ON public.user_profile
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profile
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profile
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Create function to automatically create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profile (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================
-- Create trigger to automatically create profile when user signs up
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Migration Complete
-- ============================================







