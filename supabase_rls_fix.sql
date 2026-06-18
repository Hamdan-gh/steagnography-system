-- Fix for Supabase RLS recursion error: 42P17
-- Run this in Supabase SQL Editor on your existing project.

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles"
  ON public.users FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all stego images" ON public.stego_images;
CREATE POLICY "Admins can view all stego images"
  ON public.stego_images FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all extraction logs" ON public.extraction_logs;
CREATE POLICY "Admins can view all extraction logs"
  ON public.extraction_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Extraction history: audio download columns + legacy schema compatibility
ALTER TABLE public.extraction_logs
  ALTER COLUMN stego_id DROP NOT NULL;

ALTER TABLE public.extraction_logs
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_name TEXT,
  ADD COLUMN IF NOT EXISTS stego_image_name TEXT,
  ADD COLUMN IF NOT EXISTS extracted_audio_size INTEGER,
  ADD COLUMN IF NOT EXISTS original_audio_size INTEGER,
  ADD COLUMN IF NOT EXISTS extraction_time FLOAT;

-- Allow users to create their own profile row
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own extraction logs" ON public.extraction_logs;
CREATE POLICY "Users can update own extraction logs"
  ON public.extraction_logs FOR UPDATE
  USING (auth.uid() = user_id);
