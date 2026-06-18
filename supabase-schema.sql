-- StegaGen Secure Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Images table
CREATE TABLE public.images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    image_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audio files table
CREATE TABLE public.audio_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    audio_name TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    audio_size INTEGER NOT NULL,
    duration FLOAT,
    format TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Stego images table
CREATE TABLE public.stego_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
    audio_id UUID REFERENCES public.audio_files(id) ON DELETE SET NULL,
    stego_url TEXT NOT NULL,
    psnr FLOAT NOT NULL,
    mse FLOAT NOT NULL,
    ssim FLOAT NOT NULL,
    capacity_used INTEGER NOT NULL,
    encryption_key_hash TEXT NOT NULL,
    ga_generations INTEGER DEFAULT 100,
    ga_population_size INTEGER DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extraction logs table
CREATE TABLE public.extraction_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    stego_id UUID REFERENCES public.stego_images(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
    execution_time FLOAT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit logs table
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_audio_files_user_id ON public.audio_files(user_id);
CREATE INDEX idx_stego_images_user_id ON public.stego_images(user_id);
CREATE INDEX idx_stego_images_status ON public.stego_images(status);
CREATE INDEX idx_extraction_logs_user_id ON public.extraction_logs(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stego_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Images policies
CREATE POLICY "Users can view own images" ON public.images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON public.images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON public.images
    FOR DELETE USING (auth.uid() = user_id);

-- Audio files policies
CREATE POLICY "Users can view own audio files" ON public.audio_files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audio files" ON public.audio_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own audio files" ON public.audio_files
    FOR DELETE USING (auth.uid() = user_id);

-- Stego images policies
CREATE POLICY "Users can view own stego images" ON public.stego_images
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stego images" ON public.stego_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stego images" ON public.stego_images
    FOR UPDATE USING (auth.uid() = user_id);

-- Extraction logs policies
CREATE POLICY "Users can view own extraction logs" ON public.extraction_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extraction logs" ON public.extraction_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage buckets (run these in Supabase Dashboard -> Storage)
-- 1. images bucket (public)
-- 2. audio bucket (private)
-- 3. stego-images bucket (private)

-- Storage policies for images bucket
-- CREATE POLICY "Users can upload own images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for audio bucket
-- CREATE POLICY "Users can upload own audio" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own audio" ON storage.objects
--     FOR SELECT USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for stego-images bucket
-- CREATE POLICY "Users can upload own stego images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'stego-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own stego images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'stego-images' AND auth.uid()::text = (storage.foldername(name))[1]);
