-- ============================================================================
-- ASP Module 14 — Calendar Events Schema
-- Creates calendar_events table with RLS policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  start_time   TIMESTAMPTZ,
  end_time     TIMESTAMPTZ,
  all_day      BOOLEAN NOT NULL DEFAULT FALSE,
  location     TEXT,
  event_type   TEXT NOT NULL DEFAULT 'other'
                 CHECK (event_type IN ('study','academic','exam','assignment','meeting','personal','other')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS set_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER set_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace ON public.calendar_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user     ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start    ON public.calendar_events(start_time);

-- Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their calendar events" ON public.calendar_events
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = calendar_events.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create calendar events in their workspaces" ON public.calendar_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = calendar_events.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their calendar events" ON public.calendar_events
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = calendar_events.workspace_id AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their calendar events" ON public.calendar_events
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = calendar_events.workspace_id AND w.owner_id = auth.uid()
    )
  );
