-- ============================================================================
-- ASP (Automated Student Planner) - Module 6: Notebooks & Pages Migration
-- ============================================================================

-- 1. Add description, is_archived, is_favorite, is_pinned columns to public.notebooks
ALTER TABLE public.notebooks 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- 2. Add order_index column to public.pages for drag-and-drop sibling ordering
ALTER TABLE public.pages 
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- 3. Indexes for optimized query performance
CREATE INDEX IF NOT EXISTS idx_notebooks_is_archived ON public.notebooks(is_archived);
CREATE INDEX IF NOT EXISTS idx_notebooks_is_favorite ON public.notebooks(is_favorite);
CREATE INDEX IF NOT EXISTS idx_notebooks_is_pinned ON public.notebooks(is_pinned);
CREATE INDEX IF NOT EXISTS idx_pages_order_index ON public.pages(order_index);
