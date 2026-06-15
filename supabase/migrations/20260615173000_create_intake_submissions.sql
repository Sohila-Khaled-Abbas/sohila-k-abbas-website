-- Create intake_submissions table with RLS (insert-only for public, no read access)
CREATE TABLE IF NOT EXISTS public.intake_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  data_location TEXT[],
  problem TEXT NOT NULL,
  budget TEXT,
  language_preference TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT full_name_length CHECK (char_length(full_name) BETWEEN 1 AND 100),
  CONSTRAINT email_length CHECK (char_length(email) BETWEEN 3 AND 255),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to submit, but no read/update/delete
CREATE POLICY "Anyone can submit intake form"
  ON public.intake_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
  );
