-- ============================================================================
-- ASP Module 16 — AI Quiz Generator, Practice Tests & Assessment Schema
-- ============================================================================

-- 1. Quizzes Table Enhancements
CREATE TABLE IF NOT EXISTS public.quizzes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  total_questions INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quizzes' AND column_name='source_type') THEN
    ALTER TABLE public.quizzes ADD COLUMN source_type TEXT DEFAULT 'workspace';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quizzes' AND column_name='source_id') THEN
    ALTER TABLE public.quizzes ADD COLUMN source_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quizzes' AND column_name='difficulty') THEN
    ALTER TABLE public.quizzes ADD COLUMN difficulty TEXT DEFAULT 'mixed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quizzes' AND column_name='question_types') THEN
    ALTER TABLE public.quizzes ADD COLUMN question_types TEXT DEFAULT 'multiple_choice';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='quizzes' AND column_name='subject') THEN
    ALTER TABLE public.quizzes ADD COLUMN subject TEXT;
  END IF;
END $$;

-- Trigger: auto-update updated_at for quizzes
DROP TRIGGER IF EXISTS set_quizzes_updated_at ON public.quizzes;
CREATE TRIGGER set_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id        UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  workspace_id   UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  question_type  TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options        JSONB, -- Array of strings for options (e.g. ["A. Option 1", "B. Option 2"])
  correct_answer TEXT NOT NULL,
  explanation    TEXT,
  difficulty     TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_order INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id           UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score             INTEGER DEFAULT 0,
  total_questions   INTEGER NOT NULL DEFAULT 0,
  correct_answers   INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  unanswered        INTEGER DEFAULT 0,
  percentage        NUMERIC DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

-- 4. Quiz Attempt Answers Table
CREATE TABLE IF NOT EXISTS public.quiz_attempt_answers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id     UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id    UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct     BOOLEAN DEFAULT false,
  explanation    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_workspace       ON public.quizzes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user            ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz     ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz      ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_workspace ON public.quiz_attempts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user      ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt    ON public.quiz_attempt_answers(attempt_id);

-- Row Level Security (RLS) policies for Quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quizzes in their workspaces" ON public.quizzes
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quizzes.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quizzes in their workspaces" ON public.quizzes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quizzes.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their quizzes" ON public.quizzes
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quizzes.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their quizzes" ON public.quizzes
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quizzes.workspace_id AND w.owner_id = auth.uid()
    )
  );

-- RLS policies for Quiz Questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions in their workspaces" ON public.quiz_questions
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quiz_questions.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions in their workspaces" ON public.quiz_questions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quiz_questions.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions in their workspaces" ON public.quiz_questions
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quiz_questions.workspace_id AND w.owner_id = auth.uid()
    )
  );

-- RLS policies for Quiz Attempts
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attempts in their workspaces" ON public.quiz_attempts
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quiz_attempts.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attempts in their workspaces" ON public.quiz_attempts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quiz_attempts.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attempts in their workspaces" ON public.quiz_attempts
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = quiz_attempts.workspace_id AND w.owner_id = auth.uid()
    )
  );

-- RLS policies for Quiz Attempt Answers
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view answers in their attempts" ON public.quiz_attempt_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = quiz_attempt_answers.attempt_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers in their attempts" ON public.quiz_attempt_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts a
      WHERE a.id = quiz_attempt_answers.attempt_id AND a.user_id = auth.uid()
    )
  );
