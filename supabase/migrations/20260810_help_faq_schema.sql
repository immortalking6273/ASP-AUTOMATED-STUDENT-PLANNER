-- ============================================================================
-- ASP Module 21 — Help & FAQ Management Schema & Seed Data
-- ============================================================================

-- 1. FAQ Categories Table
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FAQ Items Table
CREATE TABLE IF NOT EXISTS public.faq_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID REFERENCES public.faq_categories(id) ON DELETE SET NULL,
  question     TEXT NOT NULL,
  answer       TEXT NOT NULL,
  status       TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order   INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Support & Feedback Table
CREATE TABLE IF NOT EXISTS public.support_feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  category   TEXT DEFAULT 'general',
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_faq_categories_updated_at ON public.faq_categories;
CREATE TRIGGER set_faq_categories_updated_at
  BEFORE UPDATE ON public.faq_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_faq_items_updated_at ON public.faq_items;
CREATE TRIGGER set_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faq_items_status      ON public.faq_items(status, is_published);
CREATE INDEX IF NOT EXISTS idx_faq_items_category    ON public.faq_items(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_items_sort        ON public.faq_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_support_feedback_user ON public.support_feedback(user_id);

-- RLS Policies
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read FAQ categories" ON public.faq_categories;
CREATE POLICY "Anyone can read FAQ categories" ON public.faq_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read published FAQ items" ON public.faq_items;
CREATE POLICY "Anyone can read published FAQ items" ON public.faq_items
  FOR SELECT USING (status = 'published' AND is_published = true);

DROP POLICY IF EXISTS "Users can read own support feedback" ON public.support_feedback;
CREATE POLICY "Users can read own support feedback" ON public.support_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create support feedback" ON public.support_feedback;
CREATE POLICY "Users can create support feedback" ON public.support_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Initial Categories Seed Data
INSERT INTO public.faq_categories (name, slug, description, sort_order) VALUES
  ('Getting Started', 'getting-started', 'Basic orientation and getting around ASP', 1),
  ('AI Assistant', 'ai-assistant', 'Understanding NVIDIA NIM, Hybrid RAG, and AI Chat', 2),
  ('Study Planner', 'study-planner', 'Managing tasks, smart schedules, and deadlines', 3),
  ('Calendar', 'calendar', 'Unified schedule, time blocks, and calendar synchronization', 4),
  ('Flashcards', 'flashcards', 'Spaced repetition study cards and smart decks', 5),
  ('Quiz Generator', 'quiz-generator', 'Practice tests, scorecards, and AI quiz creation', 6),
  ('Analytics', 'analytics', 'Productivity intelligence, heatmaps, and study metrics', 7),
  ('Settings & Account', 'settings-account', 'Preferences, profile settings, and data exports', 8)
ON CONFLICT (slug) DO NOTHING;

-- 5. Initial Published FAQ Items Seed Data
DO $$
DECLARE
  cat_getting_started UUID;
  cat_ai_assistant    UUID;
  cat_planner         UUID;
  cat_calendar        UUID;
  cat_flashcards      UUID;
  cat_quizzes         UUID;
  cat_analytics       UUID;
  cat_settings        UUID;
BEGIN
  SELECT id INTO cat_getting_started FROM public.faq_categories WHERE slug = 'getting-started';
  SELECT id INTO cat_ai_assistant FROM public.faq_categories WHERE slug = 'ai-assistant';
  SELECT id INTO cat_planner FROM public.faq_categories WHERE slug = 'study-planner';
  SELECT id INTO cat_calendar FROM public.faq_categories WHERE slug = 'calendar';
  SELECT id INTO cat_flashcards FROM public.faq_categories WHERE slug = 'flashcards';
  SELECT id INTO cat_quizzes FROM public.faq_categories WHERE slug = 'quiz-generator';
  SELECT id INTO cat_analytics FROM public.faq_categories WHERE slug = 'analytics';
  SELECT id INTO cat_settings FROM public.faq_categories WHERE slug = 'settings-account';

  -- Getting Started
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_getting_started, 'What is Automated Student Planner (ASP)?', 'ASP is an all-in-one AI academic workspace that combines document processing, Notion-style notebooks, automated study planning, flashcards, practice quizzes, and calendar scheduling into a unified student productivity suite.', 'published', true, 1),
    (cat_getting_started, 'How do I create my first workspace?', 'Navigate to the Workspace tab in the left sidebar, click "+ Create Workspace", give it a title (e.g. "Computer Science 2026"), and choose a subject color. You can then organize notebooks and documents inside it.', 'published', true, 2)
  ON CONFLICT DO NOTHING;

  -- AI Assistant
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_ai_assistant, 'How does the AI Assistant use my course documents?', 'ASP uses Hybrid Retrieval-Augmented Generation (RAG). When you upload PDF or text documents, ASP indexes their content. When you ask the AI Chat a question, it retrieves relevant text passages from your documents and uses NVIDIA NIM to cite sources and explain answers.', 'published', true, 1),
    (cat_ai_assistant, 'Is my private document data kept secure?', 'Yes. All indexed document chunks and embeddings are protected by PostgreSQL Row-Level Security (RLS). NVIDIA NIM API calls process your queries server-side without exposing API keys or sharing private data.', 'published', true, 2)
  ON CONFLICT DO NOTHING;

  -- Study Planner
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_planner, 'How does the AI Smart Schedule optimization work?', 'The AI Study Planner analyzes your pending tasks, priority levels, estimated durations, and upcoming deadlines. When you click "AI Optimize Schedule", it distributes your workload into balanced study sessions without overloading single days.', 'published', true, 1),
    (cat_planner, 'Can I set recurring study session targets?', 'Yes. In Settings > Study Preferences, you can configure your daily study goal (e.g. 120 minutes) and weekly target, which ASP uses to measure your daily completion rate.', 'published', true, 2)
  ON CONFLICT DO NOTHING;

  -- Calendar
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_calendar, 'How does the Calendar sync with my Study Planner?', 'The Calendar layer directly visualizes your scheduled tasks, study sessions, and exams in Month, Week, or Day views. Any changes made in the Calendar automatically sync back to your Planner.', 'published', true, 1)
  ON CONFLICT DO NOTHING;

  -- Flashcards
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_flashcards, 'How does Spaced Repetition work in Flashcards?', 'When studying flashcards, rating your recall (Easy, Good, Hard, Again) recalculates the card interval using an SM-2 spaced repetition algorithm. Cards you find hard will appear sooner, while easy cards are scheduled further out.', 'published', true, 1),
    (cat_flashcards, 'Can AI auto-generate flashcard decks from my notes?', 'Yes! Open any notebook page or document knowledge base, click "Generate Flashcards", choose the number of cards, and the AI will extract key terms and concepts automatically.', 'published', true, 2)
  ON CONFLICT DO NOTHING;

  -- Quizzes
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_quizzes, 'How do I generate practice quizzes from my documents?', 'Navigate to the Quizzes tab, click "Create AI Quiz", select your target document or notebook, choose the difficulty level (Easy, Medium, Hard) and question types (Multiple Choice, True/False, Short Answer), then click Generate.', 'published', true, 1)
  ON CONFLICT DO NOTHING;

  -- Analytics
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_analytics, 'What is the ASP Productivity Score?', 'The Productivity Score is a 0–100 composite index calculated from your study time consistency, task completion percentage, quiz scores, and active study streak.', 'published', true, 1)
  ON CONFLICT DO NOTHING;

  -- Settings
  INSERT INTO public.faq_items (category_id, question, answer, status, is_published, sort_order) VALUES
    (cat_settings, 'How do I export my study data or change preferences?', 'Go to Settings in the sidebar. You can switch between Light, Dark, and System themes, customize AI response detail, adjust study targets, and export a full JSON archive of your data.', 'published', true, 1)
  ON CONFLICT DO NOTHING;
END $$;
