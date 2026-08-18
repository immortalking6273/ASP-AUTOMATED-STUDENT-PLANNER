import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HelpFaqService } from "@/services/db/help-faq-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category") || undefined;

    const [categories, faqs] = await Promise.all([
      HelpFaqService.getCategories(supabase),
      HelpFaqService.getPublishedFaqs(categorySlug, supabase),
    ]);

    return NextResponse.json({
      categories,
      faqs,
    });
  } catch (err: any) {
    console.error("[GET /api/help/faqs] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load Help FAQs." },
      { status: 500 }
    );
  }
}
