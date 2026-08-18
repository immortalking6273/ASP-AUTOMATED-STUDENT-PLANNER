import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { RetrievalService } from "@/services/ai/retrieval-service";
import { sanitizeHumanReadableText } from "@/lib/text-sanitizer";

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

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId, query } = body;

    if (!workspaceId || !query) {
      return NextResponse.json({ error: "workspaceId and query parameters are required" }, { status: 400 });
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

    const retrievalResult = await RetrievalService.retrieveContext(supabase, workspaceId, query, {
      rerankLimit: 12,
      candidateLimit: 20,
    });

    const searchResults = retrievalResult.chunks;
    if (searchResults.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = searchResults.map((r) => {
      const sanitizedContent = sanitizeHumanReadableText(r.chunk.content);
      const relPct = Math.round(Math.min(1, Math.max(0, r.similarityScore)) * 100);

      let relevanceLabel: "High Relevance" | "Medium Relevance" | "Low Relevance" = "Low Relevance";
      if (relPct >= 50) relevanceLabel = "High Relevance";
      else if (relPct >= 25) relevanceLabel = "Medium Relevance";

      return {
        chunkId: r.chunk.id,
        documentId: r.chunk.document_id,
        documentTitle: r.documentTitle || "Document",
        heading: r.chunk.heading || null,
        excerpt: sanitizedContent,
        similarityScore: r.similarityScore,
        relevancePercentage: relPct,
        relevanceLabel,
      };
    });

    return NextResponse.json({ results, confidenceLevel: retrievalResult.confidenceLevel });
  } catch (err: any) {
    console.error("[Knowledge Search Error]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

