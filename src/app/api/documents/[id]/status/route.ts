import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
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

    const { data: doc, error: docErr } = await supabase
      .from("uploaded_documents")
      .select(
        "id, processing_status, total_chunks, estimated_tokens, reading_time_minutes, extracted_metadata, error_message, processed_at, updated_at"
      )
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: doc.id,
      status: doc.processing_status || "uploaded",
      totalChunks: doc.total_chunks || 0,
      estimatedTokens: doc.estimated_tokens || 0,
      readingTimeMinutes: doc.reading_time_minutes || 0,
      metadata: doc.extracted_metadata || {},
      errorMessage: doc.error_message || null,
      processedAt: doc.processed_at || null,
      updatedAt: doc.updated_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
