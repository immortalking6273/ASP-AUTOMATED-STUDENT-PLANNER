-- ============================================================================
-- ASP (Automated Student Planner) - Module 9: AI Knowledge Processing & RAG Migration
-- ============================================================================

-- 1. Extend uploaded_documents with metadata and pipeline tracking columns
ALTER TABLE public.uploaded_documents
  ADD COLUMN IF NOT EXISTS extracted_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS total_chunks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_tokens INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- 2. Create document_chunks table
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  heading TEXT,
  character_count INTEGER NOT NULL DEFAULT 0,
  token_estimate INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding JSONB DEFAULT '[]'::jsonb, -- Stores float vector array (or pgvector reference)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Automatic updated_at trigger check for document_chunks if needed
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id 
  ON public.document_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_workspace_id 
  ON public.document_chunks (workspace_id);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc_chunk_idx 
  ON public.document_chunks (document_id, chunk_index);

-- 4. Row Level Security (RLS) for document_chunks
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access document chunks in owned workspaces" ON public.document_chunks;
CREATE POLICY "Users can access document chunks in owned workspaces" ON public.document_chunks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = document_chunks.workspace_id AND w.owner_id = auth.uid()
  )
);
