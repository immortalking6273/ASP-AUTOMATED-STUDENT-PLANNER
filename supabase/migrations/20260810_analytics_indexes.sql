-- ============================================================================
-- ASP Module 17 — Analytics & Performance Indexes
-- ============================================================================

-- Create indexes for fast date-range and workspace analytics queries
CREATE INDEX IF NOT EXISTS idx_study_sessions_ws_time 
  ON public.study_sessions(workspace_id, user_id, start_time);

CREATE INDEX IF NOT EXISTS idx_tasks_ws_status_due 
  ON public.tasks(workspace_id, user_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_completed_at 
  ON public.tasks(workspace_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_ws_time 
  ON public.flashcard_reviews(workspace_id, user_id, reviewed_at);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_ws_time 
  ON public.quiz_attempts(workspace_id, user_id, completed_at);
