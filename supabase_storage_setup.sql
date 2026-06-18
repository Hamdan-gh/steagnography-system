-- ============================================================================
-- Supabase Storage Setup - StegaGen Secure
-- ============================================================================
-- Run this in Supabase SQL Editor to create storage buckets and policies
-- ============================================================================

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Images bucket (for avatars and cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  104857600, -- 100MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[];

-- Audio bucket (for audio files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio',
  'audio',
  false,
  20971520, -- 20MB
  ARRAY['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/wave']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/wave']::text[];

-- Stego images bucket (for generated stego images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stego-images',
  'stego-images',
  true,
  104857600, -- 100MB
  ARRAY['image/png']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/png']::text[];

-- ============================================================================
-- STORAGE POLICIES - IMAGES BUCKET
-- ============================================================================

-- Public can view images
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Authenticated users can upload to own folder
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own images
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- STORAGE POLICIES - AUDIO BUCKET
-- ============================================================================

-- Authenticated users can view own audio
DROP POLICY IF EXISTS "Users can view own audio" ON storage.objects;
CREATE POLICY "Users can view own audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can upload audio to own folder
DROP POLICY IF EXISTS "Users can upload own audio" ON storage.objects;
CREATE POLICY "Users can upload own audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'audio' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own audio
DROP POLICY IF EXISTS "Users can delete own audio" ON storage.objects;
CREATE POLICY "Users can delete own audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'audio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- STORAGE POLICIES - STEGO-IMAGES BUCKET
-- ============================================================================

-- Public can view stego images
DROP POLICY IF EXISTS "Public can view stego images" ON storage.objects;
CREATE POLICY "Public can view stego images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stego-images');

-- Authenticated users can upload stego images
DROP POLICY IF EXISTS "Users can upload stego images" ON storage.objects;
CREATE POLICY "Users can upload stego images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stego-images' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete own stego images
DROP POLICY IF EXISTS "Users can delete own stego images" ON storage.objects;
CREATE POLICY "Users can delete own stego images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stego-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('images', 'audio', 'stego-images');

-- Check if policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY policyname;

-- ============================================================================
-- COMPLETED
-- ============================================================================
-- Your storage buckets are now ready!
-- You can now upload images, audio, and stego images.
-- ============================================================================
