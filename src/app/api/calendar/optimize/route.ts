import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";

export interface AIScheduleSuggestion {
  id: string;
  title: string;
  type: "create_session" | "reschedule_session";
  sessionId?: string;
  subject?: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    // Verify workspace access
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id, title")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 403 });
    }

    const nowISO = new Date().toISOString();
    const next14DaysISO = new Date(Date.now() + 14 * 86400000).toISOString();

    // 1. Fetch incomplete / upcoming tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, subject, priority, status, due_date, estimated_minutes, completed")
      .eq("workspace_id", workspaceId)
      .eq("completed", false)
      .order("due_date", { ascending: true, nullsFirst: false });

    // 2. Fetch upcoming study sessions
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("id, title, subject, start_time, end_time, duration, notes")
      .eq("workspace_id", workspaceId)
      .gte("start_time", nowISO)
      .lte("start_time", next14DaysISO)
      .order("start_time", { ascending: true });

    const activeTasks = tasks || [];
    const activeSessions = sessions || [];

    if (activeTasks.length === 0 && activeSessions.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: "No active tasks or study sessions found for optimization. Add some tasks first!",
      });
    }

    // Prepare context for NVIDIA NIM
    const tasksContext = activeTasks
      .map(
        (t) =>
          `- [ID: ${t.id}] Title: "${t.title}", Subject: "${t.subject || "General"}", Priority: ${t.priority}, Due: ${t.due_date || "No due date"}, Est: ${t.estimated_minutes || 30} mins`
      )
      .join("\n");

    const sessionsContext = activeSessions
      .map(
        (s) =>
          `- [ID: ${s.id}] Title: "${s.title}", Subject: "${s.subject || "General"}", Scheduled: ${s.start_time} to ${s.end_time}`
      )
      .join("\n");

    const systemPrompt = `You are an AI Academic Schedule Optimizer for ASP (Automated Student Planner).
Your task is to review the student's pending tasks, deadlines, and existing study sessions, then propose 2 to 4 high-value schedule optimization suggestions to help them succeed.

Rules:
1. Priority rules: 1) Urgent/Overdue/High-priority tasks 2) Approaching deadlines 3) Unscheduled tasks 4) Rescheduling sessions that overlap or are too late.
2. Every proposed start_time MUST be in the future (after ${nowISO}).
3. Duration should match task difficulty (30 to 90 minutes).
4. Response MUST be valid JSON with this exact structure:
{
  "suggestions": [
    {
      "id": "sug-1",
      "title": "Study Session: Title Here",
      "type": "create_session",
      "subject": "Subject Name",
      "startTime": "2026-08-11T18:00:00.000Z",
      "endTime": "2026-08-11T19:00:00.000Z",
      "reason": "Clear explanation of why this session is recommended before the deadline."
    }
  ]
}`;

    const userPrompt = `Current Timestamp: ${nowISO}
Workspace: ${ws.title}

PENDING TASKS:
${tasksContext || "None"}

CURRENT SCHEDULED STUDY SESSIONS:
${sessionsContext || "None"}

Please analyze these tasks and sessions, and generate optimal study session suggestions in structured JSON format.`;

    const aiResult = await NvidiaNimProvider.completeJson<{ suggestions: AIScheduleSuggestion[] }>(
      userPrompt,
      systemPrompt
    );

    const suggestions = aiResult?.suggestions || [];

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("[POST /api/calendar/optimize]", err);
    return NextResponse.json({ error: "Failed to optimize schedule. Please try again." }, { status: 500 });
  }
}
