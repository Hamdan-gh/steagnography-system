-- Email verification codes for auth server (Render/Vercel production)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  email text PRIMARY KEY,
  code_hash text NOT NULL,
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at
  ON public.email_verification_codes (expires_at);

ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- No public policies: only the service role (auth server) can read/write.

NOTIFY pgrst, 'reload schema';
