-- Migration: AI Study Planner, Tasks, Deadlines & Smart Schedule Schema
-- Description: Enhances tasks table and creates study_sessions table with RLS security policies.

-- 1. Tasks Table Enhancement
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    due_date TIMESTAMPTZ,
    estimated_minutes INTEGER DEFAULT 30 CHECK (estimated_minutes >= 0),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was previously partially defined
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='user_id') THEN
        ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='subject') THEN
        ALTER TABLE public.tasks ADD COLUMN subject TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='status') THEN
        ALTER TABLE public.tasks ADD COLUMN status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='estimated_minutes') THEN
        ALTER TABLE public.tasks ADD COLUMN estimated_minutes INTEGER DEFAULT 30 CHECK (estimated_minutes >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='completed_at') THEN
        ALTER TABLE public.tasks ADD COLUMN completed_at TIMESTAMPTZ;
    END IF;
END $$;

-- Indexes for fast task queries
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON public.tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their workspaces" ON public.tasks
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their workspaces" ON public.tasks
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their tasks" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their tasks" ON public.tasks
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = tasks.workspace_id AND w.owner_id = auth.uid()
        )
    );


-- 2. Study Sessions Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for study sessions
CREATE INDEX IF NOT EXISTS idx_study_sessions_workspace ON public.study_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start ON public.study_sessions(start_time);

-- Enable RLS on study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_sessions
CREATE POLICY "Users can view study sessions in their workspaces" ON public.study_sessions
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = study_sessions.workspace_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create study sessions in their workspaces" ON public.study_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = study_sessions.workspace_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their study sessions" ON public.study_sessions
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = study_sessions.workspace_id AND w.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their study sessions" ON public.study_sessions
    FOR DELETE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.workspaces w
            WHERE w.id = study_sessions.workspace_id AND w.owner_id = auth.uid()
        )
    );
