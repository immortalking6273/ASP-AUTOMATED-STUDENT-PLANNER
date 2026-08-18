"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { WorkspaceRow, TaskRow, UploadedDocumentRow } from "@/types/database";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalWorkspaces: number;
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlinesCount: number;
  documentsUploaded: number;
  notesCreated: number;
  /** Actual study hours this week from study_sessions.duration */
  studyHoursThisWeek: number;
  /** Weekly task progress 0–100 */
  weeklyProgressPct: number;
  weeklyCompletedTasks: number;
  weeklyTotalTasks: number;
  /** Consecutive active study days */
  studyStreakDays: number;
  /** Today's study minutes from study_sessions */
  todayStudyMinutes: number;
  /** daily_study_goal_minutes from user_preferences */
  dailyGoalMinutes: number;
  /** Per-day study hours for last 7 days (bar chart) */
  weeklyDayData: { day: string; hours: number }[];
}

// Helper: extract minutes from a study_session row
function sessionMinutes(s: any): number {
  let mins = Number(s.duration) || 0;
  if (!mins) {
    const startStr = s.start_time || s.started_at;
    const endStr = s.end_time || s.ended_at;
    if (startStr && endStr) {
      const diff = new Date(endStr).getTime() - new Date(startStr).getTime();
      if (diff > 0) mins = Math.round(diff / (1000 * 60));
    }
  }
  return mins > 0 ? mins : 0;
}

export function useDashboardData() {
  const { user, profile } = useAuth();

  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [recentTasks, setRecentTasks] = React.useState<TaskRow[]>([]);
  const [recentDocuments, setRecentDocuments] = React.useState<UploadedDocumentRow[]>([]);
  const [stats, setStats] = React.useState<DashboardStats>({
    totalWorkspaces: 0,
    totalTasks: 0,
    completedTasks: 0,
    upcomingDeadlinesCount: 0,
    documentsUploaded: 0,
    notesCreated: 0,
    studyHoursThisWeek: 0,
    weeklyProgressPct: 0,
    weeklyCompletedTasks: 0,
    weeklyTotalTasks: 0,
    studyStreakDays: 0,
    todayStudyMinutes: 0,
    dailyGoalMinutes: 120,
    weeklyDayData: [],
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(
    async (isSilent = false) => {
      if (!user) {
        setWorkspaces([]);
        setRecentTasks([]);
        setRecentDocuments([]);
        setStats({
          totalWorkspaces: 0,
          totalTasks: 0,
          completedTasks: 0,
          upcomingDeadlinesCount: 0,
          documentsUploaded: 0,
          notesCreated: 0,
          studyHoursThisWeek: 0,
          weeklyProgressPct: 0,
          weeklyCompletedTasks: 0,
          weeklyTotalTasks: 0,
          studyStreakDays: 0,
          todayStudyMinutes: 0,
          dailyGoalMinutes: 120,
          weeklyDayData: [],
        });
        setIsLoading(false);
        return;
      }

      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const supabase = createClient();
        const now = new Date();

        // Week window: rolling 7-day window starting 6 days ago at midnight
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);
        const weekStartIso = weekStart.toISOString();

        const todayStr = now.toISOString().split("T")[0];

        // ── 1. Workspaces ──────────────────────────────────────────────────
        const { data: wsData } = await supabase
          .from("workspaces")
          .select("*")
          .eq("owner_id", user.id)
          .eq("is_archived", false)
          .order("created_at", { ascending: false });

        const activeWorkspaces: WorkspaceRow[] = (wsData || []) as WorkspaceRow[];
        setWorkspaces(activeWorkspaces);
        const workspaceIds = activeWorkspaces.map((w) => w.id);

        // ── 2. Tasks + Documents ───────────────────────────────────────────
        let allTasks: TaskRow[] = [];
        let recentDocs: UploadedDocumentRow[] = [];

        if (workspaceIds.length > 0) {
          const [tasksRes, docsRes] = await Promise.all([
            supabase
              .from("tasks")
              .select("*")
              .in("workspace_id", workspaceIds)
              .order("created_at", { ascending: false }),
            supabase
              .from("uploaded_documents")
              .select("*")
              .in("workspace_id", workspaceIds)
              .eq("is_archived", false)
              .order("created_at", { ascending: false })
              .limit(6),
          ]);
          allTasks = (tasksRes.data || []) as TaskRow[];
          recentDocs = (docsRes.data || []) as UploadedDocumentRow[];
        }

        setRecentTasks(allTasks);
        setRecentDocuments(recentDocs);

        // ── 3. Document total count (efficient COUNT query) ────────────────
        let documentsUploaded = 0;
        if (workspaceIds.length > 0) {
          const { count } = await supabase
            .from("uploaded_documents")
            .select("id", { count: "exact", head: true })
            .in("workspace_id", workspaceIds)
            .eq("is_archived", false);
          documentsUploaded = count || 0;
        }

        // ── 4. Notes count (pages across all notebooks) ────────────────────
        let notesCreated = 0;
        if (workspaceIds.length > 0) {
          const { data: notebooks } = await supabase
            .from("notebooks")
            .select("id")
            .in("workspace_id", workspaceIds)
            .eq("is_archived", false);

          const notebookIds = (notebooks || []).map((n: any) => n.id);
          if (notebookIds.length > 0) {
            const { count } = await supabase
              .from("pages")
              .select("id", { count: "exact", head: true })
              .in("notebook_id", notebookIds)
              .eq("is_archived", false);
            notesCreated = count || 0;
          }
        }

        // ── 5. Study Sessions (current week) ──────────────────────────────
        const { data: weekSessionsData } = await supabase
          .from("study_sessions")
          .select("duration, start_time, started_at, end_time, ended_at, created_at")
          .eq("user_id", user.id)
          .gte("created_at", weekStartIso);

        const weekSessions = weekSessionsData || [];

        // Build per-day map (last 7 days)
        const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          dayMap.set(d.toISOString().split("T")[0], 0);
        }

        let totalWeekMinutes = 0;
        let todayStudyMinutes = 0;

        weekSessions.forEach((s: any) => {
          const mins = sessionMinutes(s);
          if (mins <= 0) return;
          const sessionDateStr = new Date(
            s.start_time || s.started_at || s.created_at || now
          )
            .toISOString()
            .split("T")[0];

          if (dayMap.has(sessionDateStr)) {
            dayMap.set(sessionDateStr, (dayMap.get(sessionDateStr) || 0) + mins);
            totalWeekMinutes += mins;
            if (sessionDateStr === todayStr) todayStudyMinutes += mins;
          }
        });

        const studyHoursThisWeek = Math.round((totalWeekMinutes / 60) * 10) / 10;
        const weeklyDayData = Array.from(dayMap.entries()).map(([dateStr, mins]) => ({
          day: DAY_NAMES[new Date(dateStr).getDay()],
          hours: Math.round((mins / 60) * 10) / 10,
        }));

        // ── 6. User Preferences (daily goal) ──────────────────────────────
        let dailyGoalMinutes = 120;
        const { data: prefData } = await supabase
          .from("user_preferences")
          .select("daily_study_goal_minutes")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prefData?.daily_study_goal_minutes) {
          dailyGoalMinutes = Number(prefData.daily_study_goal_minutes);
        }

        // ── 7. Weekly Task Progress ────────────────────────────────────────
        // Tasks created or with due_date within this week's window
        const weeklyTasks = allTasks.filter((t) => {
          const createdInWeek = t.created_at
            ? new Date(t.created_at) >= weekStart
            : false;
          const dueInWeek = t.due_date
            ? new Date(t.due_date) >= weekStart
            : false;
          return createdInWeek || dueInWeek;
        });
        const weeklyTotalTasks = weeklyTasks.length;
        const weeklyCompletedTasks = weeklyTasks.filter(
          (t) => t.completed || (t as any).status === "completed"
        ).length;
        const weeklyProgressPct =
          weeklyTotalTasks > 0
            ? Math.round((weeklyCompletedTasks / weeklyTotalTasks) * 100)
            : 0;

        // ── 8. Upcoming Deadlines ──────────────────────────────────────────
        const upcomingDeadlinesCount = allTasks.filter(
          (t) =>
            !t.completed &&
            (t as any).status !== "completed" &&
            t.due_date &&
            new Date(t.due_date) > now
        ).length;

        // ── 9. Streak (study sessions + completed tasks) ───────────────────
        // Fetch all-time sessions for streak (only dates needed)
        const { data: allSessionsData } = await supabase
          .from("study_sessions")
          .select("start_time, started_at, created_at")
          .eq("user_id", user.id);

        const activeDateSet = new Set<string>();
        (allSessionsData || []).forEach((s: any) => {
          const d = s.start_time || s.started_at || s.created_at;
          if (d) activeDateSet.add(new Date(d).toISOString().split("T")[0]);
        });
        allTasks.forEach((t) => {
          if (t.completed || (t as any).status === "completed") {
            const d = (t as any).completed_at || t.updated_at;
            if (d) activeDateSet.add(new Date(d).toISOString().split("T")[0]);
          }
        });

        // Walk backwards from today counting consecutive active days
        let studyStreakDays = 0;
        const streakCheck = new Date(now);
        // If today has no activity yet, allow it and start from yesterday
        if (!activeDateSet.has(todayStr)) {
          streakCheck.setDate(streakCheck.getDate() - 1);
        }
        while (true) {
          const ds = streakCheck.toISOString().split("T")[0];
          if (activeDateSet.has(ds)) {
            studyStreakDays++;
            streakCheck.setDate(streakCheck.getDate() - 1);
          } else {
            break;
          }
        }

        // ── Compose final stats ────────────────────────────────────────────
        setStats({
          totalWorkspaces: activeWorkspaces.length,
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter(
            (t) => t.completed || (t as any).status === "completed"
          ).length,
          upcomingDeadlinesCount,
          documentsUploaded,
          notesCreated,
          studyHoursThisWeek,
          weeklyProgressPct,
          weeklyCompletedTasks,
          weeklyTotalTasks,
          studyStreakDays,
          todayStudyMinutes,
          dailyGoalMinutes,
          weeklyDayData,
        });
      } catch (err: any) {
        console.error("[DashboardData] Failed to load:", err);
        setError(err?.message || "Unable to load dashboard statistics.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user]
  );

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived: upcoming deadlines list for the deadline card
  const upcomingDeadlines = recentTasks.filter(
    (t) =>
      !t.completed &&
      (t as any).status !== "completed" &&
      t.due_date &&
      new Date(t.due_date) > new Date()
  );

  return {
    user,
    profile,
    workspaces,
    recentTasks,
    recentDocuments,
    upcomingDeadlines,
    stats,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchData(true),
    isEmpty: !isLoading && workspaces.length === 0,
  };
}

