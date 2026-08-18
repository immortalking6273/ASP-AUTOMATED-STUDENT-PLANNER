-- Migration: Module 8 Uploaded Documents Metadata Columns & Indexes
-- Description: Adds display_name, file_type, tags, description, thumbnail_url, is_archived, is_favorite, last_opened_at

ALTER TABLE public.uploaded_documents
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'pdf',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;

-- Backfill display_name from original_name or file_name if null
UPDATE public.uploaded_documents
SET display_name = COALESCE(original_name, file_name)
WHERE display_name IS NULL;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_uploaded_documents_workspace_archived 
  ON public.uploaded_documents (workspace_id, is_archived);

CREATE INDEX IF NOT EXISTS idx_uploaded_documents_favorite 
  ON public.uploaded_documents (uploader_id, is_favorite) 
  WHERE is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_uploaded_documents_file_type 
  ON public.uploaded_documents (file_type);

CREATE INDEX IF NOT EXISTS idx_uploaded_documents_tags 
  ON public.uploaded_documents USING GIN (tags);
