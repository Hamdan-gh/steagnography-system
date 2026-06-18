-- Fix extraction_logs table to match the frontend app
-- Run this in Supabase SQL Editor (safe to run multiple times)

-- 1) Make stego_id optional (user can extract any uploaded stego PNG)
ALTER TABLE public.extraction_logs
  ALTER COLUMN stego_id DROP NOT NULL;

-- 2) Add columns used by the app (if missing)
ALTER TABLE public.extraction_logs
  ADD COLUMN IF NOT EXISTS stego_image_name TEXT,
  ADD COLUMN IF NOT EXISTS audio_name TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS extracted_audio_size INTEGER,
  ADD COLUMN IF NOT EXISTS original_audio_size INTEGER,
  ADD COLUMN IF NOT EXISTS extraction_time FLOAT;

-- 3) Backfill extraction_time from legacy execution_time column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'extraction_logs'
      AND column_name = 'execution_time'
  ) THEN
    UPDATE public.extraction_logs
    SET extraction_time = execution_time
    WHERE extraction_time IS NULL AND execution_time IS NOT NULL;
  END IF;
END $$;

-- 4) Policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create extraction logs" ON public.extraction_logs;
CREATE POLICY "Users can create extraction logs"
  ON public.extraction_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own extraction logs" ON public.extraction_logs;
CREATE POLICY "Users can insert own extraction logs"
  ON public.extraction_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own extraction logs" ON public.extraction_logs;
CREATE POLICY "Users can update own extraction logs"
  ON public.extraction_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- 5) Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
