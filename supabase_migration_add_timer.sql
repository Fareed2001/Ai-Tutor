-- ============================================
-- Add remaining_time_seconds column to diagnostics table
-- This allows the timer to persist across logouts
-- ============================================

-- Add remaining_time_seconds column if it doesn't exist
ALTER TABLE public.diagnostics 
ADD COLUMN IF NOT EXISTS remaining_time_seconds INTEGER DEFAULT (30 * 60);

-- Update existing records to have full time if NULL
UPDATE public.diagnostics 
SET remaining_time_seconds = 30 * 60 
WHERE remaining_time_seconds IS NULL;

-- Add comment to column
COMMENT ON COLUMN public.diagnostics.remaining_time_seconds IS 'Remaining time in seconds for the diagnostic test. Updated periodically to persist timer state across logouts.';

-- ============================================
-- Add RLS Policy for updating diagnostics (needed for timer updates)
-- ============================================

-- Policy: Users can update their own diagnostics (for timer updates)
CREATE POLICY "Users can update own diagnostics"
  ON public.diagnostics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update diagnostics (for backend timer updates)
CREATE POLICY "Service role can update diagnostics"
  ON public.diagnostics
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

