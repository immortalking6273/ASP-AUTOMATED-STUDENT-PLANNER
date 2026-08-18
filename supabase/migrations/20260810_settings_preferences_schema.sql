-- ============================================================================
-- ASP Module 19 — Settings & User Preferences Schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  response_style              TEXT DEFAULT 'balanced' CHECK (response_style IN ('concise', 'balanced', 'detailed')),
  ai_language                 TEXT DEFAULT 'auto' CHECK (ai_language IN ('auto', 'en', 'ta')),
  show_citations              BOOLEAN DEFAULT TRUE,
  reduce_motion               BOOLEAN DEFAULT FALSE,
  save_chat_history           BOOLEAN DEFAULT TRUE,
  daily_study_goal_minutes    INTEGER DEFAULT 120,
  weekly_study_goal_minutes   INTEGER DEFAULT 600,
  preferred_start_time        TEXT DEFAULT '09:00',
  preferred_end_time          TEXT DEFAULT '18:00',
  default_session_minutes     INTEGER DEFAULT 60,
  default_break_minutes       INTEGER DEFAULT 10,
  default_workspace_id        UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update trigger for updated_at
DROP TRIGGER IF EXISTS set_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- RLS Security Policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own user preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own user preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);
