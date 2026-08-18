import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DocumentProcessingPipeline } from "@/services/ai/document-processing-pipeline";

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { documentId } = body;
    if (!documentId) {
      return NextResponse.json({ error: "documentId parameter is required" }, { status: 400 });
    }

    // Fetch document record and verify owner access
    const { data: doc, error: docErr } = await supabase
      .from("uploaded_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found or access denied" }, { status: 404 });
    }

    // Execute the processing pipeline with the authenticated Supabase client
    // This ensures storage downloads pass RLS policies using the user's active session
    const result = await DocumentProcessingPipeline.processDocument(supabase, doc);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Document processing failed", status: "failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "ready",
      metadata: result.metadata,
      totalChunks: result.chunks?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
