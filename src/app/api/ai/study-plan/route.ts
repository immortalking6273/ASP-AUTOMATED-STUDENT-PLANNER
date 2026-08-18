import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate User
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // 2. Parse & Validate Payload
    const body = await req.json();
    const { workspaceId, tasks, startDate } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId parameter is required" }, { status: 400 });
    }

    // Verify workspace access
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: "Workspace access denied" }, { status: 403 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const model = NvidiaNimProvider.getModel();
    const baseDate = startDate || new Date().toISOString().split("T")[0];

    // Filter incomplete tasks
    const activeTasks = Array.isArray(tasks)
      ? tasks.filter((t: any) => !t.completed && t.status !== "completed")
      : [];

    if (activeTasks.length === 0) {
      return NextResponse.json({
        summary: "No active or incomplete tasks found. Add tasks to generate a study plan!",
        totalStudyMinutes: 0,
        sessions: [],
      });
    }

    // Construct AI Prompt
    const tasksSummary = activeTasks.map((t: any, i: number) => {
      return `${i + 1}. [${t.priority.toUpperCase()}] "${t.title}" (Subject: ${t.subject || "General"}, Due: ${t.dueDate || "No deadline"}, Est: ${t.estimatedMinutes || 45} mins)`;
    }).join("\n");

    const systemPrompt = `You are ASP AI Study Planner, an intelligent academic scheduler powered by NVIDIA NIM.
Analyze the student's task list, deadlines, and priorities, then generate an optimal 7-day study plan starting from date "${baseDate}".

PRIORITIZATION RULES:
1. Overdue tasks (due dates before "${baseDate}") MUST be scheduled first.
2. Urgent and High priority tasks MUST be scheduled before Low/Medium priority tasks.
3. Tasks with approaching deadlines MUST be scheduled before tasks without deadlines.
4. Keep daily study sessions reasonable (e.g. 45 to 90 minutes per session).
5. Use 24-hour time format for startTime and endTime (e.g. "18:00" to "19:00").

CRITICAL FORMAT REQUIREMENT:
You MUST return ONLY a valid JSON object matching this exact JSON schema:
{
  "summary": "Short paragraph explaining the strategy used for this study plan",
  "totalStudyMinutes": 180,
  "sessions": [
    {
      "title": "Study session title",
      "subject": "Subject name",
      "date": "YYYY-MM-DD",
      "startTime": "HH:mm",
      "endTime": "HH:mm",
      "durationMinutes": 60,
      "reasoning": "Reason why scheduled at this time"
    }
  ]
}

DO NOT include any markdown code blocks, backticks, or natural language text outside the raw JSON object.`;

    const userPrompt = `Student Task List:\n${tasksSummary}\n\nPlease generate the optimal study plan JSON.`;

    // Call NVIDIA NIM API
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[NVIDIA NIM Study Plan Error] HTTP ${response.status}:`, errText);
      return NextResponse.json({ error: "Failed to generate AI study plan." }, { status: response.status });
    }

    const resJson = await response.json();
    const rawContent = resJson.choices?.[0]?.message?.content || "";

    // Clean potential markdown backticks from raw content
    const cleanedContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const planData = JSON.parse(cleanedContent);
      return NextResponse.json(planData);
    } catch (parseErr) {
      console.error("[JSON Parse Error] Raw AI output was not valid JSON:", rawContent);
      return NextResponse.json({
        error: "AI response formatting error. Please try regenerating.",
        rawContent,
      }, { status: 502 });
    }
  } catch (err: any) {
    console.error("[AI Study Plan Exception]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
