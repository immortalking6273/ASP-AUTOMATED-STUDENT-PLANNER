-- ============================================================================
-- ASP Module 18 — Notifications, Reminders & Smart Alerts Schema
-- ============================================================================

-- 1. Notifications Table Enhancements
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'info',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='workspace_id') THEN
    ALTER TABLE public.notifications ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='entity_type') THEN
    ALTER TABLE public.notifications ADD COLUMN entity_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='entity_id') THEN
    ALTER TABLE public.notifications ADD COLUMN entity_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='event_key') THEN
    ALTER TABLE public.notifications ADD COLUMN event_key TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='read_at') THEN
    ALTER TABLE public.notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='metadata') THEN
    ALTER TABLE public.notifications ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Deduplication constraint on (user_id, event_key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'uq_notifications_user_event_key' AND table_name = 'notifications'
  ) THEN
    ALTER TABLE public.notifications ADD CONSTRAINT uq_notifications_user_event_key UNIQUE (user_id, event_key);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  task_reminders           BOOLEAN DEFAULT TRUE,
  deadline_reminders       BOOLEAN DEFAULT TRUE,
  overdue_alerts           BOOLEAN DEFAULT TRUE,
  study_session_reminders BOOLEAN DEFAULT TRUE,
  quiz_reminders           BOOLEAN DEFAULT TRUE,
  flashcard_reminders      BOOLEAN DEFAULT TRUE,
  planner_notifications    BOOLEAN DEFAULT TRUE,
  ai_reminders             BOOLEAN DEFAULT TRUE,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-update updated_at for preferences
DROP TRIGGER IF EXISTS set_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user        ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace   ON public.notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read     ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_event_key   ON public.notifications(event_key);

-- RLS Security Policies for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access own notifications" ON public.notifications;
CREATE POLICY "Users can access own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS Security Policies for Notification Preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);
