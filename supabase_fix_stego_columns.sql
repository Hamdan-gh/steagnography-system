-- Migrate stego_images from legacy schema to current app schema
-- Safe to run multiple times in Supabase SQL Editor
--
-- Legacy schema (supabase-schema.sql): image_id, audio_id, stego_url, encryption_key_hash
-- Current app expects: cover_image_name, audio_file_name, stego_image_url, metrics, etc.

BEGIN;

-- 1) Add columns used by the current frontend
ALTER TABLE public.stego_images
  ADD COLUMN IF NOT EXISTS cover_image_name TEXT,
  ADD COLUMN IF NOT EXISTS audio_file_name TEXT,
  ADD COLUMN IF NOT EXISTS stego_image_url TEXT,
  ADD COLUMN IF NOT EXISTS psnr FLOAT,
  ADD COLUMN IF NOT EXISTS ssim FLOAT,
  ADD COLUMN IF NOT EXISTS mse FLOAT,
  ADD COLUMN IF NOT EXISTS capacity_used INTEGER,
  ADD COLUMN IF NOT EXISTS capacity_total INTEGER,
  ADD COLUMN IF NOT EXISTS ga_generations INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS ga_population_size INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS best_fitness FLOAT,
  ADD COLUMN IF NOT EXISTS execution_time FLOAT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2) Backfill new columns from legacy columns when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'stego_images' AND column_name = 'stego_url'
  ) THEN
    UPDATE public.stego_images
    SET stego_image_url = COALESCE(stego_image_url, stego_url)
    WHERE stego_image_url IS NULL AND stego_url IS NOT NULL;
  END IF;
END $$;

-- 3) Relax legacy NOT NULL constraints so new inserts only need app columns
DO $$
DECLARE
  col TEXT;
BEGIN
  FOREACH col IN ARRAY ARRAY[
    'image_id', 'audio_id', 'stego_url', 'encryption_key_hash',
    'psnr', 'mse', 'ssim', 'capacity_used'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'stego_images'
        AND column_name = col
        AND is_nullable = 'NO'
    ) THEN
      EXECUTE format('ALTER TABLE public.stego_images ALTER COLUMN %I DROP NOT NULL', col);
    END IF;
  END LOOP;
END $$;

-- 4) Ensure status CHECK constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'stego_images' AND c.contype = 'c' AND c.conname = 'stego_images_status_check'
  ) THEN
    ALTER TABLE public.stego_images
      ADD CONSTRAINT stego_images_status_check CHECK (status IN ('processing','completed','failed'));
  END IF;
END $$;

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_stego_images_user_id ON public.stego_images(user_id);
CREATE INDEX IF NOT EXISTS idx_stego_images_created_at ON public.stego_images(created_at DESC);

-- 6) RLS policies required by the app
ALTER TABLE public.stego_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stego images" ON public.stego_images;
CREATE POLICY "Users can view own stego images"
  ON public.stego_images FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own stego images" ON public.stego_images;
DROP POLICY IF EXISTS "Users can create stego images" ON public.stego_images;
DROP POLICY IF EXISTS "Users can insert own stego images" ON public.stego_images;
CREATE POLICY "Users can create own stego images"
  ON public.stego_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stego images" ON public.stego_images;
CREATE POLICY "Users can update own stego images"
  ON public.stego_images FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stego images" ON public.stego_images;
CREATE POLICY "Users can delete own stego images"
  ON public.stego_images FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- 7) Refresh PostgREST schema cache (fixes PGRST204 without a full project restart)
NOTIFY pgrst, 'reload schema';

-- After running: retry embedding. If history save still fails, restart the Supabase
-- project once from Project Settings -> General -> Restart project.
