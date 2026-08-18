-- ============================================================================
-- ASP Module 15 — Flashcards, Decks & Spaced Repetition Schema
-- ============================================================================

-- 1. Flashcard Decks Table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  subject      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: auto-update updated_at for flashcard_decks
DROP TRIGGER IF EXISTS set_flashcard_decks_updated_at ON public.flashcard_decks;
CREATE TRIGGER set_flashcard_decks_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Flashcards Table Enhancement
CREATE TABLE IF NOT EXISTS public.flashcards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  deck_name         TEXT NOT NULL DEFAULT 'General',
  front             TEXT NOT NULL,
  back              TEXT NOT NULL,
  mastery_level     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns safely if table already existed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='deck_id') THEN
    ALTER TABLE public.flashcards ADD COLUMN deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='hint') THEN
    ALTER TABLE public.flashcards ADD COLUMN hint TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='difficulty') THEN
    ALTER TABLE public.flashcards ADD COLUMN difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='review_count') THEN
    ALTER TABLE public.flashcards ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='correct_count') THEN
    ALTER TABLE public.flashcards ADD COLUMN correct_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='incorrect_count') THEN
    ALTER TABLE public.flashcards ADD COLUMN incorrect_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='last_reviewed_at') THEN
    ALTER TABLE public.flashcards ADD COLUMN last_reviewed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='next_review_at') THEN
    ALTER TABLE public.flashcards ADD COLUMN next_review_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='source_type') THEN
    ALTER TABLE public.flashcards ADD COLUMN source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual','document','notebook','ai'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='flashcards' AND column_name='source_id') THEN
    ALTER TABLE public.flashcards ADD COLUMN source_id TEXT;
  END IF;
END $$;

-- 3. Flashcard Reviews History Table
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating       TEXT NOT NULL CHECK (rating IN ('again','hard','good','easy')),
  reviewed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_workspace ON public.flashcard_decks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user      ON public.flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck          ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_workspace     ON public.flashcards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user          ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review   ON public.flashcards(next_review_at);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card    ON public.flashcard_reviews(flashcard_id);

-- Row Level Security for Decks
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view decks in their workspaces" ON public.flashcard_decks
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcard_decks.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create decks in their workspaces" ON public.flashcard_decks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcard_decks.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their decks" ON public.flashcard_decks
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcard_decks.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their decks" ON public.flashcard_decks
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcard_decks.workspace_id AND w.owner_id = auth.uid()
    )
  );

-- Row Level Security for Flashcards
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flashcards in their workspaces" ON public.flashcards
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcards.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create flashcards in their workspaces" ON public.flashcards
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcards.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their flashcards" ON public.flashcards
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcards.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their flashcards" ON public.flashcards
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcards.workspace_id AND w.owner_id = auth.uid()
    )
  );

-- Row Level Security for Reviews
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews in their workspaces" ON public.flashcard_reviews
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcard_reviews.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reviews in their workspaces" ON public.flashcard_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = flashcard_reviews.workspace_id AND w.owner_id = auth.uid()
    )
  );
