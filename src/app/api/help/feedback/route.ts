import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HelpFaqService } from "@/services/db/help-faq-service";

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
    const { subject, message, category } = body;

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const result = await HelpFaqService.submitSupportFeedback(
      user.id,
      {
        subject: subject.trim(),
        message: message.trim(),
        category: category || "general",
      },
      supabase
    );

    return NextResponse.json({ success: true, feedback: result });
  } catch (err: any) {
    console.error("[POST /api/help/feedback] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit support request." },
      { status: 500 }
    );
  }
}
