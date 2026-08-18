import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DEFAULT_SUGGESTIONS = [
  "Summarize the key concepts in these materials.",
  "What are the main topics and definitions?",
  "Create structured study notes from my documents.",
  "Explain the most complex topic in simple terms.",
  "List important formulas, steps, or procedures.",
];

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
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    const body = await req.json();
    const { workspaceId, documentIds } = body;

    if (!workspaceId) {
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    // Fetch up to 3 documents to inspect titles & metadata
    let query = supabase
      .from("uploaded_documents")
      .select("display_name, original_name, extracted_metadata")
      .eq("workspace_id", workspaceId)
      .eq("processing_status", "ready")
      .limit(3);

    if (Array.isArray(documentIds) && documentIds.length > 0) {
      query = query.in("id", documentIds);
    }

    const { data: docs } = await query;

    if (!docs || docs.length === 0) {
      return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
    }

    const docTitles = docs.map((d) => d.display_name || d.original_name).join(", ");
    const topics: string[] = [];

    docs.forEach((d) => {
      const meta = d.extracted_metadata as any;
      if (meta?.keyTopics && Array.isArray(meta.keyTopics)) {
        topics.push(...meta.keyTopics);
      }
    });

    const uniqueTopics = Array.from(new Set(topics)).slice(0, 4);

    const dynamicSuggestions = [
      `Summarize the main points of ${docTitles.slice(0, 45)}...`,
      uniqueTopics.length > 0
        ? `Explain "${uniqueTopics[0]}" in detail.`
        : "What are the core concepts covered?",
      uniqueTopics.length > 1
        ? `How does "${uniqueTopics[0]}" relate to "${uniqueTopics[1]}"?`
        : "Create an active recall study outline.",
      "List key formulas, definitions, and takeaways.",
    ];

    return NextResponse.json({ suggestions: dynamicSuggestions });
  } catch (err) {
    return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
  }
}
