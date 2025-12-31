-- ============================================
-- Supabase Migration: Diagnostics Tables
-- Diagnostic System Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.diagnostic_results CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;
DROP TABLE IF EXISTS public.diagnostics CASCADE;

-- ============================================
-- Create diagnostics table
-- Stores generated diagnostic tests
-- ============================================
CREATE TABLE public.diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chapter TEXT NOT NULL,
  test_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id and chapter
CREATE INDEX idx_diagnostics_user_id ON public.diagnostics(user_id);
CREATE INDEX idx_diagnostics_chapter ON public.diagnostics(chapter);

-- ============================================
-- Create diagnostic_results table
-- Stores test results and answers
-- ============================================
CREATE TABLE public.diagnostic_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnostic_id UUID REFERENCES public.diagnostics(id) ON DELETE CASCADE NOT NULL,
  chapter TEXT NOT NULL,
  answers JSONB NOT NULL,
  results JSONB NOT NULL,
  bucket_scores JSONB NOT NULL,
  bucket_totals JSONB NOT NULL,
  total_correct INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_diagnostic_results_user_id ON public.diagnostic_results(user_id);
CREATE INDEX idx_diagnostic_results_chapter ON public.diagnostic_results(chapter);
CREATE INDEX idx_diagnostic_results_diagnostic_id ON public.diagnostic_results(diagnostic_id);

-- ============================================
-- Create roadmaps table
-- Stores AI-generated learning roadmaps
-- ============================================
CREATE TABLE public.roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  roadmap_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id
CREATE INDEX idx_roadmaps_user_id ON public.roadmaps(user_id);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies for diagnostics
-- ============================================
CREATE POLICY "Users can view own diagnostics"
  ON public.diagnostics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostics"
  ON public.diagnostics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Create RLS Policies for diagnostic_results
-- ============================================
CREATE POLICY "Users can view own diagnostic results"
  ON public.diagnostic_results
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic results"
  ON public.diagnostic_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Create RLS Policies for roadmaps
-- ============================================
CREATE POLICY "Users can view own roadmaps"
  ON public.roadmaps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps"
  ON public.roadmaps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps"
  ON public.roadmaps
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Create function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_roadmap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for roadmaps
CREATE TRIGGER update_roadmaps_updated_at
  BEFORE UPDATE ON public.roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_roadmap_updated_at();

-- ============================================
-- Migration Complete
-- ============================================

