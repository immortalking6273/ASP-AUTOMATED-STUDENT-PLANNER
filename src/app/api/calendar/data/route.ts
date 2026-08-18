import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/calendar/data
 * Query params: workspaceId, type (tasks|sessions|events), start, end
 *
 * Server-side route — authenticates user, validates workspace access,
 * then returns the requested data type for the given date range.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const type = searchParams.get("type"); // tasks | sessions | events
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!workspaceId || !type || !start || !end) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Verify workspace access
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 403 });
    }

    // ── Tasks ────────────────────────────────────────────────────────────────
    if (type === "tasks") {
      // Fetch tasks with due_date in range (or no due_date — still show as undated)
      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id, workspace_id, user_id, title, description, subject, priority, status, due_date, estimated_minutes, completed, completed_at, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .or(`due_date.is.null,and(due_date.gte.${start},due_date.lte.${end})`);

      if (error) throw error;

      const tasks = (data || []).map((row: any) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        userId: row.user_id,
        title: row.title,
        description: row.description || null,
        subject: row.subject || null,
        priority: row.priority || "medium",
        status: row.status || (row.completed ? "completed" : "todo"),
        dueDate: row.due_date || null,
        estimatedMinutes: row.estimated_minutes || 30,
        completed: Boolean(row.completed),
        completedAt: row.completed_at || null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return NextResponse.json({ tasks });
    }

    // ── Study Sessions ───────────────────────────────────────────────────────
    if (type === "sessions") {
      // Query only columns confirmed in migration 20260809_study_planner_schema.sql
      // NOTE: study_sessions has NO updated_at — do not query it
      const { data, error } = await supabase
        .from("study_sessions")
        .select(
          "id, workspace_id, user_id, title, subject, start_time, end_time, duration, notes, created_at"
        )
        .eq("workspace_id", workspaceId)
        .gte("start_time", start)
        .lte("start_time", end);

      if (error) throw error;

      const sessions = (data || []).map((row: any) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        userId: row.user_id,
        title: row.title,
        subject: row.subject || null,
        startTime: row.start_time,
        endTime: row.end_time,
        durationMinutes: row.duration || null,
        notes: row.notes || null,
        createdAt: row.created_at,
      }));

      return NextResponse.json({ sessions });
    }

    // ── Calendar Events ──────────────────────────────────────────────────────
    if (type === "events") {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("workspace_id", workspaceId)
        .or(`all_day.eq.true,and(start_time.gte.${start},start_time.lte.${end})`);

      if (error) throw error;
      return NextResponse.json({ events: data || [] });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (err: any) {
    console.error("[/api/calendar/data]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
