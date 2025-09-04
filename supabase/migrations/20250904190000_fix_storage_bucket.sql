-- Fix storage bucket creation
-- First check if bucket exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'pdfs') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('pdfs', 'pdfs', false);
  END IF;
END $$;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can upload PDFs to storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own PDFs in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own PDFs" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Users can upload PDFs to storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdfs' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can view own PDFs in storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pdfs' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can update own PDFs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pdfs' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users can delete own PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pdfs' AND 
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );