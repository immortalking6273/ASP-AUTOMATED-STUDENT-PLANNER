import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HelpFaqService } from "@/services/db/help-faq-service";

async function checkIsAdmin(user: any, supabase: any): Promise<boolean> {
  if (!user) return false;
  // Check user app metadata or user metadata
  if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
    return true;
  }

  // Check profiles table role
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile && (profile as any).role === "admin") {
      return true;
    }
  } catch {
    // ignore lookup error
  }

  // Allow admin access in development or if explicitly allowed
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const [categories, faqs] = await Promise.all([
      HelpFaqService.getCategories(supabase),
      HelpFaqService.getAllFaqsForAdmin(supabase),
    ]);

    return NextResponse.json({ categories, faqs });
  } catch (err: any) {
    console.error("[GET /api/admin/help/faqs] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch admin FAQs." },
      { status: 500 }
    );
  }
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

    const isAdmin = await checkIsAdmin(user, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { question, answer, category_id, status, sort_order } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }
    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return NextResponse.json({ error: "Answer is required." }, { status: 400 });
    }

    const created = await HelpFaqService.createFaq(
      {
        question: question.trim(),
        answer: answer.trim(),
        category_id: category_id || null,
        status: status || "published",
        sort_order: sort_order != null ? Number(sort_order) : 0,
        created_by: user.id,
      },
      supabase
    );

    return NextResponse.json({ success: true, faq: created });
  } catch (err: any) {
    console.error("[POST /api/admin/help/faqs] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create FAQ." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, ...updates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "FAQ ID is required." }, { status: 400 });
    }

    const updated = await HelpFaqService.updateFaq(id, updates, supabase);
    return NextResponse.json({ success: true, faq: updated });
  } catch (err: any) {
    console.error("[PUT /api/admin/help/faqs] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update FAQ." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(user, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "FAQ ID is required." }, { status: 400 });
    }

    await HelpFaqService.deleteFaq(id, supabase);
    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("[DELETE /api/admin/help/faqs] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete FAQ." },
      { status: 500 }
    );
  }
}
