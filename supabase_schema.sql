-- ============================================================================
-- StegaGen Secure - Supabase Database Schema
-- ============================================================================
-- Run this script in Supabase SQL Editor to set up all required tables,
-- indexes, RLS policies, and storage buckets
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Extended user profiles';

-- Stego Images table
CREATE TABLE IF NOT EXISTS stego_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_image_name TEXT NOT NULL,
  audio_file_name TEXT NOT NULL,
  stego_image_url TEXT NOT NULL,
  psnr FLOAT,
  ssim FLOAT,
  mse FLOAT,
  capacity_used INTEGER,
  capacity_total INTEGER,
  ga_generations INTEGER DEFAULT 20,
  ga_population_size INTEGER DEFAULT 15,
  best_fitness FLOAT,
  execution_time FLOAT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE stego_images IS 'Embedded audio steganography records';

-- Extraction Logs table
CREATE TABLE IF NOT EXISTS extraction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stego_image_name TEXT NOT NULL,
  audio_name TEXT,
  audio_url TEXT,
  extracted_audio_size INTEGER,
  original_audio_size INTEGER,
  extraction_time FLOAT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE extraction_logs IS 'Audio extraction activity logs';

-- Audit Logs table (optional, for admin tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'System-wide audit trail';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Stego images indexes
CREATE INDEX IF NOT EXISTS idx_stego_images_user_id ON stego_images(user_id);
CREATE INDEX IF NOT EXISTS idx_stego_images_status ON stego_images(status);
CREATE INDEX IF NOT EXISTS idx_stego_images_created_at ON stego_images(created_at DESC);

-- Extraction logs indexes
CREATE INDEX IF NOT EXISTS idx_extraction_logs_user_id ON extraction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_status ON extraction_logs(status);
CREATE INDEX IF NOT EXISTS idx_extraction_logs_created_at ON extraction_logs(created_at DESC);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for stego_images table
DROP TRIGGER IF EXISTS update_stego_images_updated_at ON stego_images;
CREATE TRIGGER update_stego_images_updated_at
  BEFORE UPDATE ON stego_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stego_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to safely check admin role without recursive RLS evaluation
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

-- ============================================================================
-- RLS POLICIES - USERS TABLE
-- ============================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (fallback when trigger did not run)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES - STEGO_IMAGES TABLE
-- ============================================================================

-- Users can view their own stego images
DROP POLICY IF EXISTS "Users can view own stego images" ON stego_images;
CREATE POLICY "Users can view own stego images"
  ON stego_images FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own stego images
DROP POLICY IF EXISTS "Users can create stego images" ON stego_images;
CREATE POLICY "Users can create stego images"
  ON stego_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stego images
DROP POLICY IF EXISTS "Users can update own stego images" ON stego_images;
CREATE POLICY "Users can update own stego images"
  ON stego_images FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own stego images
DROP POLICY IF EXISTS "Users can delete own stego images" ON stego_images;
CREATE POLICY "Users can delete own stego images"
  ON stego_images FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all stego images
DROP POLICY IF EXISTS "Admins can view all stego images" ON stego_images;
CREATE POLICY "Admins can view all stego images"
  ON stego_images FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES - EXTRACTION_LOGS TABLE
-- ============================================================================

-- Users can view their own extraction logs
DROP POLICY IF EXISTS "Users can view own extraction logs" ON extraction_logs;
CREATE POLICY "Users can view own extraction logs"
  ON extraction_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create extraction logs
DROP POLICY IF EXISTS "Users can create extraction logs" ON extraction_logs;
CREATE POLICY "Users can create extraction logs"
  ON extraction_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own extraction logs (e.g. sync audio_url after storage upload)
DROP POLICY IF EXISTS "Users can update own extraction logs" ON extraction_logs;
CREATE POLICY "Users can update own extraction logs"
  ON extraction_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all extraction logs
DROP POLICY IF EXISTS "Admins can view all extraction logs" ON extraction_logs;
CREATE POLICY "Admins can view all extraction logs"
  ON extraction_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================================================
-- RLS POLICIES - AUDIT_LOGS TABLE
-- ============================================================================

-- Only admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

-- System can insert audit logs
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: Storage buckets must be created via Supabase Dashboard or via:
-- INSERT INTO storage.buckets (id, name, public) VALUES (...);

-- Required buckets:
-- 1. 'images' - public: true - For cover images
-- 2. 'audio' - public: false - For audio files (optional)
-- 3. 'stego-images' - public: true - For generated stego images

-- ============================================================================
-- STORAGE POLICIES (Run after creating buckets)
-- ============================================================================

-- Images bucket policies
-- CREATE POLICY "Public can view images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'images');

-- CREATE POLICY "Authenticated users can upload to own folder"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'images' AND
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Stego images bucket policies
-- CREATE POLICY "Public can view stego images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'stego-images');

-- CREATE POLICY "Authenticated users can upload stego images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'stego-images' AND
--     auth.role() = 'authenticated' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- CREATE POLICY "Users can delete own stego images"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'stego-images' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- You can add initial data here if needed
-- For example, creating an admin user after they sign up:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify everything was created correctly:

-- Check tables
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public';

-- Check policies
-- SELECT schemaname, tablename, policyname FROM pg_policies
-- WHERE schemaname = 'public';

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE schemaname = 'public';

-- ============================================================================
-- COMPLETED
-- ============================================================================

-- Your StegaGen Secure database is now ready!
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard
-- 2. Update .env file with your Supabase credentials
-- 3. Test user signup and data persistence
-- ============================================================================
