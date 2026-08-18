import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";

export interface GeneratedFlashcardItem {
  front: string;
  back: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
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
    const {
      workspaceId,
      sourceType = "topic",
      sourceId,
      cardCount = 10,
      difficulty = "mixed",
      focus = "mixed",
      subject,
    } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    // Verify workspace access
    const { data: ws } = await supabase
      .from("workspaces")
      .select("id, title")
      .eq("id", workspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!ws) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 403 });
    }

    let sourceContent = "";
    let sourceTitle = "Selected Source";

    // Fetch actual source content based on sourceType
    if (sourceType === "document" && sourceId) {
      const { data: doc } = await supabase
        .from("uploaded_documents")
        .select("id, file_name, extracted_text")
        .eq("id", sourceId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (doc) {
        sourceTitle = doc.file_name;
        sourceContent = doc.extracted_text || "";
      }

      // If extracted_text was blank, check document_chunks
      if (!sourceContent) {
        const { data: chunks } = await supabase
          .from("document_chunks")
          .select("content")
          .eq("document_id", sourceId)
          .limit(20);

        if (chunks && chunks.length > 0) {
          sourceContent = chunks.map((c: any) => c.content).join("\n\n");
        }
      }
    } else if (sourceType === "notebook" && sourceId) {
      const { data: nb } = await supabase
        .from("notebooks")
        .select("id, title")
        .eq("id", sourceId)
        .maybeSingle();

      if (nb) sourceTitle = nb.title;

      const { data: pages } = await supabase
        .from("pages")
        .select("title, content")
        .eq("notebook_id", sourceId)
        .limit(10);

      if (pages) {
        sourceContent = pages
          .map((p: any) => `## Page: ${p.title || "Untitled"}\n${p.content || ""}`)
          .join("\n\n");
      }
    } else if (sourceType === "knowledge") {
      // Aggregate recent document chunks & pages in workspace
      const { data: chunks } = await supabase
        .from("document_chunks")
        .select("content")
        .eq("workspace_id", workspaceId)
        .limit(15);

      if (chunks && chunks.length > 0) {
        sourceContent = chunks.map((c: any) => c.content).join("\n\n");
      }
    } else if (sourceType === "topic" && sourceId) {
      sourceTitle = sourceId;
      sourceContent = `Topic focus: ${sourceId}`;
    }

    // Fallback if source text is sparse
    if (!sourceContent.trim()) {
      sourceContent = `Subject: ${subject || "General Academic Studies"}. Generate active recall flashcards covering key principles and definitions.`;
    }

    const isShortSource = sourceContent.trim().length < 150 && sourceType !== "topic";
    const truncatedContent = sourceContent.substring(0, 10000);
    const targetCount = Math.min(30, Math.max(3, cardCount));
    const maxTokens = Math.max(2500, targetCount * 180);

    const systemPrompt = `You are an expert Educational AI Flashcard Generator for ASP (Automated Student Planner).
Your goal is to transform study materials into high-quality active recall flashcards.

Guidelines:
1. Each card MUST test one clear concept or question.
2. Front: Direct question or prompt. Back: Concise, complete explanation.
3. Hint: Optional helpful memory trigger.
4. Difficulty: "easy", "medium", or "hard".
5. Focus mode: ${focus}. Difficulty mode: ${difficulty}.
6. CRITICAL COUNT REQUIREMENT: You MUST generate EXACTLY ${targetCount} unique, non-duplicate cards. Do not stop early. Do not return fewer items.
7. Return ONLY valid JSON with this exact structure:
{
  "cards": [
    {
      "front": "Question prompt?",
      "back": "Clear concise answer.",
      "hint": "Optional memory trigger hint",
      "difficulty": "medium"
    }
  ]
}`;

    const userPrompt = `Source Title: ${sourceTitle}
Subject: ${subject || "General"}

STUDY MATERIAL TEXT:
"""
${truncatedContent}
"""

Generate EXACTLY ${targetCount} structured flashcards in JSON format based on this material.`;

    const aiResult = await NvidiaNimProvider.completeJson<{ cards: GeneratedFlashcardItem[] }>(
      userPrompt,
      systemPrompt,
      { maxTokens }
    );

    const rawCards = aiResult?.cards || [];

    // Deduplicate & sanitize generated cards
    const seenFronts = new Set<string>();
    const sanitizedCards: GeneratedFlashcardItem[] = [];

    for (const c of rawCards) {
      if (!c.front || !c.back) continue;
      const normFront = c.front.trim().toLowerCase();
      if (seenFronts.has(normFront)) continue;
      seenFronts.add(normFront);

      sanitizedCards.push({
        front: c.front.trim(),
        back: c.back.trim(),
        hint: c.hint ? c.hint.trim() : undefined,
        difficulty: c.difficulty && ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
      });
    }

    // Controlled Completion Loop if AI returned fewer than targetCount
    let completionAttempts = 0;
    const MAX_COMPLETION_ATTEMPTS = 2;

    while (sanitizedCards.length < targetCount && completionAttempts < MAX_COMPLETION_ATTEMPTS && !isShortSource) {
      completionAttempts++;
      const missingCount = targetCount - sanitizedCards.length;
      console.log(`[Flashcard Generation] Target: ${targetCount}, Got: ${sanitizedCards.length}. Retrying #${completionAttempts} for ${missingCount} missing items...`);

      const existingFrontsSummary = sanitizedCards.slice(-15).map((c) => `• ${c.front}`).join("\n");

      const retryUserPrompt = `You generated ${sanitizedCards.length} flashcards out of ${targetCount} requested.
Generate EXACTLY ${missingCount} ADDITIONAL unique, non-duplicate flashcards based on the material below.

DO NOT repeat any of these existing questions:
${existingFrontsSummary}

STUDY MATERIAL TEXT:
"""
${truncatedContent}
"""

Return EXACTLY ${missingCount} additional flashcards in JSON format.`;

      const retryResult = await NvidiaNimProvider.completeJson<{ cards: GeneratedFlashcardItem[] }>(
        retryUserPrompt,
        systemPrompt,
        { maxTokens: Math.max(1500, missingCount * 180) }
      );

      const retryCards = retryResult?.cards || [];
      for (const c of retryCards) {
        if (!c.front || !c.back) continue;
        const normFront = c.front.trim().toLowerCase();
        if (seenFronts.has(normFront)) continue;
        seenFronts.add(normFront);

        sanitizedCards.push({
          front: c.front.trim(),
          back: c.back.trim(),
          hint: c.hint ? c.hint.trim() : undefined,
          difficulty: c.difficulty && ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
        });

        if (sanitizedCards.length === targetCount) break;
      }
    }

    // Strict Final Validation & Insufficient Content Error Handling
    if (sanitizedCards.length < targetCount) {
      if (sanitizedCards.length === 0) {
        return NextResponse.json(
          { error: "Unable to generate flashcards from the selected material. Please try another source or custom topic." },
          { status: 400 }
        );
      }

      if (isShortSource || sanitizedCards.length < targetCount * 0.7) {
        return NextResponse.json(
          {
            error: `You requested ${targetCount} flashcards, but the selected material only supports ${sanitizedCards.length} unique flashcards. Please choose a smaller card count or select broader source material.`,
            availableCount: sanitizedCards.length,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      cards: sanitizedCards.slice(0, targetCount),
      sourceTitle,
    });
  } catch (err: any) {
    console.error("[POST /api/flashcards/generate]", err);
    return NextResponse.json({ error: "Failed to generate AI flashcards." }, { status: 500 });
  }
}
