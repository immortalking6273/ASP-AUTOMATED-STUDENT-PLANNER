import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";

export interface AIAnalyticsInsightResponse {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
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
    const { workspaceId, timeRange, metrics } = body;

    if (!workspaceId || !metrics) {
      return NextResponse.json({ error: "workspaceId and metrics are required" }, { status: 400 });
    }

    // Verify workspace membership
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id, title")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 403 });
    }

    const systemPrompt = `You are an expert academic study analytics & performance advisor for ASP (Automated Student Planner).
Analyze the student's actual productivity metrics for workspace "${ws.title}" (${timeRange || "recent period"}).

Guidelines:
1. Be encouraging, highly practical, direct, and constructive.
2. Rely strictly on the provided quantitative metrics. DO NOT invent data, grades, deadlines, or external facts.
3. Identify 2-3 specific strengths demonstrated by the metrics.
4. Identify 1-2 areas needing focus/improvement based on completion rates, overdue tasks, or study consistency.
5. Provide 2-3 practical, actionable study recommendations.
6. Return ONLY valid JSON in this exact structure:
{
  "summary": "Concise 2-sentence summary of overall academic progress and momentum.",
  "strengths": [
    "Strength point 1",
    "Strength point 2"
  ],
  "areasToImprove": [
    "Area needing focus 1"
  ],
  "recommendations": [
    "Practical recommendation 1",
    "Practical recommendation 2"
  ]
}`;

    const userPrompt = `Student Productivity Metrics Summary:
- Workspace: ${ws.title}
- Selected Period: ${timeRange}
- Total Study Hours: ${metrics.studyTimeFormatted || "0h"}
- Tasks Completed: ${metrics.tasksCompleted} / ${metrics.totalTasks} (${metrics.completionRate}% completion rate)
- Overdue Tasks: ${metrics.overdueTasks || 0}
- Current Study Streak: ${metrics.currentStreakDays || 0} days
- Quiz Average Score: ${metrics.avgQuizScore ? `${metrics.avgQuizScore}%` : "No quiz data yet"}
- Flashcards Mastered: ${metrics.cardsMastered || 0} / ${metrics.totalCards || 0}
- Productivity Score: ${metrics.productivityScore || 0} / 100
- Top Subject Focus: ${metrics.topSubject || "General Studies"}

Generate structured study insights in JSON format.`;

    const aiResult = await NvidiaNimProvider.completeJson<AIAnalyticsInsightResponse>(
      userPrompt,
      systemPrompt
    );

    return NextResponse.json({
      summary: aiResult?.summary || "You are making steady progress with your study routine.",
      strengths: aiResult?.strengths || ["Consistent study session logging", "Active workspace task management"],
      areasToImprove: aiResult?.areasToImprove || ["Maintain daily consistency to boost your productivity score"],
      recommendations: aiResult?.recommendations || ["Schedule dedicated study blocks for upcoming deadlines"],
    });
  } catch (err: any) {
    console.error("[POST /api/analytics/ai-insights]", err);
    return NextResponse.json({ error: "Failed to generate AI analytics insights." }, { status: 500 });
  }
}
