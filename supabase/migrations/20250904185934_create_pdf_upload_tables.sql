-- Create uploaded_pdfs table
CREATE TABLE IF NOT EXISTS uploaded_pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE uploaded_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own PDFs
CREATE POLICY "Users can view own PDFs" ON uploaded_pdfs
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own PDFs
CREATE POLICY "Users can upload PDFs" ON uploaded_pdfs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own PDFs
CREATE POLICY "Users can update own PDFs" ON uploaded_pdfs
  FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false);

-- Create storage policies
CREATE POLICY "Users can upload PDFs to storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own PDFs in storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pdfs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create index for better query performance
CREATE INDEX idx_uploaded_pdfs_user_id ON uploaded_pdfs(user_id);
CREATE INDEX idx_uploaded_pdfs_status ON uploaded_pdfs(status);
CREATE INDEX idx_uploaded_pdfs_created_at ON uploaded_pdfs(created_at DESC);