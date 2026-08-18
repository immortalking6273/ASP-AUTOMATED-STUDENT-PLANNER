import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DocumentProcessingPipeline } from "@/services/ai/document-processing-pipeline";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
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

    // Fetch document and verify ownership via RLS
    const { data: doc, error: docErr } = await supabase
      .from("uploaded_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Re-run the pipeline with the authenticated Supabase client
    // Passing supabase ensures storage downloads use the user's session and pass RLS
    const result = await DocumentProcessingPipeline.processDocument(supabase, doc);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Reprocessing failed", status: "failed" },
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
