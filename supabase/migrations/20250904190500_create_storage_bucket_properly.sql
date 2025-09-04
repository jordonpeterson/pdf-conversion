-- Create storage bucket for PDFs (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can upload PDFs to storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own PDFs in storage" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own PDFs" ON storage.objects;

-- Create comprehensive storage policies with proper path handling
CREATE POLICY "Enable insert for authenticated users only" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pdfs' AND
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Enable select for users based on user_id" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'pdfs' AND
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Enable update for users based on user_id" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'pdfs' AND
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Enable delete for users based on user_id" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'pdfs' AND
  (auth.uid())::text = (string_to_array(name, '/'))[1]
);