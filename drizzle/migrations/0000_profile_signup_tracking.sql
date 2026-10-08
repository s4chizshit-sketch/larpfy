ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_ip text,
  ADD COLUMN IF NOT EXISTS signup_country text,
  ADD COLUMN IF NOT EXISTS last_ip text,
  ADD COLUMN IF NOT EXISTS last_country text,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;