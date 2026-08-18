import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DocumentProcessingPipeline } from "@/services/ai/document-processing-pipeline";

export const runtime = "nodejs";

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

    // 1. Authenticate user
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { workspaceId, documentId } = body;

    // 2. Fetch target uploaded documents
    let query = supabase.from("uploaded_documents").select("*");
    if (documentId) {
      query = query.eq("id", documentId);
    } else if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    } else {
      // Re-index documents owned by user
      query = query.eq("uploader_id", user.id);
    }

    const { data: docs, error: docsErr } = await query;
    if (docsErr || !docs || docs.length === 0) {
      return NextResponse.json({ message: "No documents found to re-index", processed: 0 });
    }

    console.log(`[Reindex API] Purging old chunks and re-indexing ${docs.length} documents...`);

    // 3. Purge existing chunks for target documents
    const docIds = docs.map((d) => d.id);
    await supabase.from("document_chunks").delete().in("document_id", docIds);

    // 4. Re-run document processing pipeline for each document with updated pdf-parse engine
    const results = [];
    for (const doc of docs) {
      console.log(`[Reindex API] Processing document ID=${doc.id} (${doc.file_name})...`);
      const result = await DocumentProcessingPipeline.processDocument(supabase, doc);
      results.push({
        id: doc.id,
        fileName: doc.file_name,
        success: result.success,
        chunksGenerated: result.chunks?.length || 0,
        error: result.error || null,
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      results,
    });
  } catch (err: any) {
    console.error("[Reindex API] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error re-indexing documents" },
      { status: 500 }
    );
  }
}
