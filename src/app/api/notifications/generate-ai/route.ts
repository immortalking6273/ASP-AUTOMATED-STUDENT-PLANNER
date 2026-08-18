import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";
import { NotificationsService } from "@/services/db/notifications-service";

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

    // Fetch upcoming tasks for user
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, priority, status")
      .eq("user_id", user.id)
      .eq("completed", false)
      .limit(10);

    const activeTasks = tasks || [];
    if (activeTasks.length === 0) {
      return NextResponse.json({ message: "No active tasks found." });
    }

    const systemPrompt = `You are an AI Smart Workload & Study Reminder assistant for ASP.
Analyze the student's active tasks and generate ONE high-priority, actionable workload alert.

Rules:
1. Do NOT invent tasks or deadlines.
2. Focus on upcoming clusters of deadlines or high-priority items.
3. Return ONLY valid JSON in this exact format:
{
  "title": "Short Alert Title (e.g. 🤖 Workload Warning)",
  "message": "Direct 1-2 sentence recommendation on how to organize study time today."
}`;

    const userPrompt = `Student Active Tasks:
${activeTasks.map((t: any) => `- Task: "${t.title}", Priority: ${t.priority}, Due: ${t.due_date || "No due date"}`).join("\n")}

Generate one intelligent workload reminder in JSON.`;

    const aiResult = await NvidiaNimProvider.completeJson<{ title: string; message: string }>(
      userPrompt,
      systemPrompt
    );

    if (!aiResult || !aiResult.title || !aiResult.message) {
      return NextResponse.json({ error: "Failed to generate AI alert." }, { status: 500 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const eventKey = `ai_reminder:${user.id}:${todayStr}`;

    const created = await NotificationsService.createNotification(
      {
        userId: user.id,
        workspaceId,
        title: aiResult.title,
        message: aiResult.message,
        type: "ai_reminder",
        entityType: "system",
        eventKey,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      notification: created,
    });
  } catch (err: any) {
    console.error("[POST /api/notifications/generate-ai]", err);
    return NextResponse.json({ error: "Failed to generate AI workload alert." }, { status: 500 });
  }
}
