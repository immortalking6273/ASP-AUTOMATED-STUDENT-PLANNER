import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";

export interface GeneratedQuizQuestionItem {
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GeneratedQuizPayload {
  title: string;
  description?: string;
  questions: GeneratedQuizQuestionItem[];
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
      title: customTitle,
      sourceType = "topic",
      sourceId,
      questionCount = 10,
      difficulty = "mixed",
      questionTypes = "mixed",
      subject,
    } = body;

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    // Verify workspace ownership
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
    let sourceTitle = customTitle || "Academic Quiz";

    // 1. Fetch Source Material
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

    if (!sourceContent.trim()) {
      sourceContent = `Subject: ${subject || "General Studies"}. Create a high-quality practice test evaluating key concepts.`;
    }

    const isShortSource = sourceContent.trim().length < 150 && sourceType !== "topic";
    const truncatedContent = sourceContent.substring(0, 10000);
    const targetCount = Math.min(30, Math.max(3, questionCount));
    const maxTokens = Math.max(3000, targetCount * 220);

    const systemPrompt = `You are an expert AI Quiz & Assessment Generator for ASP (Automated Student Planner).
Generate a practice quiz based on the provided study material.

Rules & Guidelines:
1. CRITICAL COUNT REQUIREMENT: Generate EXACTLY ${targetCount} high-quality, unique questions. Do not stop early. Do not return fewer items.
2. Question Types allowed: ${questionTypes === "mixed" ? "multiple_choice, true_false, short_answer" : questionTypes}.
3. Difficulty setting: ${difficulty}.
4. For "multiple_choice":
   - Provide 4 distinct options under "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"].
   - "correctAnswer" MUST exactly match one of the option strings or the option key ("A", "B", "C", or "D").
5. For "true_false":
   - "options": ["True", "False"].
   - "correctAnswer": "True" or "False".
6. For "short_answer":
   - "options": null.
   - "correctAnswer": concise expected answer string.
7. Provide a clear, educational "explanation" for every question.
8. Return ONLY valid JSON in this exact structure:
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text?",
      "type": "multiple_choice",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "B. Option 2",
      "explanation": "Concise explanation of why this answer is correct.",
      "difficulty": "medium"
    }
  ]
}`;

    const userPrompt = `Source: ${sourceTitle}
Subject: ${subject || "General"}

STUDY CONTENT:
"""
${truncatedContent}
"""

Generate EXACTLY ${targetCount} questions in JSON format.`;

    const aiResult = await NvidiaNimProvider.completeJson<GeneratedQuizPayload>(
      userPrompt,
      systemPrompt,
      { maxTokens }
    );

    const rawQuestions = aiResult?.questions || [];
    const quizTitle = customTitle || aiResult?.title || `Quiz: ${sourceTitle}`;

    // Validate & sanitize questions
    const sanitizedQuestions: GeneratedQuizQuestionItem[] = [];
    const seenQuestions = new Set<string>();

    for (const q of rawQuestions) {
      if (!q.question || !q.correctAnswer) continue;
      const qText = q.question.trim();
      const normText = qText.toLowerCase();
      if (seenQuestions.has(normText)) continue;
      seenQuestions.add(normText);

      const qType = q.type && ["multiple_choice", "true_false", "short_answer"].includes(q.type)
        ? q.type
        : "multiple_choice";

      let options = q.options;
      if (qType === "true_false" && (!options || options.length === 0)) {
        options = ["True", "False"];
      }

      sanitizedQuestions.push({
        question: qText,
        type: qType,
        options: options || undefined,
        correctAnswer: q.correctAnswer.trim(),
        explanation: q.explanation ? q.explanation.trim() : "Correct answer based on study material.",
        difficulty: q.difficulty && ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      });
    }

    // Controlled Completion Loop if AI returned fewer than targetCount
    let completionAttempts = 0;
    const MAX_COMPLETION_ATTEMPTS = 2;

    while (sanitizedQuestions.length < targetCount && completionAttempts < MAX_COMPLETION_ATTEMPTS && !isShortSource) {
      completionAttempts++;
      const missingCount = targetCount - sanitizedQuestions.length;
      console.log(`[Quiz Generation] Target: ${targetCount}, Got: ${sanitizedQuestions.length}. Retrying #${completionAttempts} for ${missingCount} missing questions...`);

      const existingQuestionsSummary = sanitizedQuestions.slice(-15).map((q) => `• ${q.question}`).join("\n");

      const retryUserPrompt = `You generated ${sanitizedQuestions.length} questions out of ${targetCount} requested.
Generate EXACTLY ${missingCount} ADDITIONAL unique, non-duplicate questions based on the material below.

DO NOT repeat any of these existing questions:
${existingQuestionsSummary}

STUDY CONTENT:
"""
${truncatedContent}
"""

Return EXACTLY ${missingCount} additional questions in JSON format.`;

      const retryResult = await NvidiaNimProvider.completeJson<GeneratedQuizPayload>(
        retryUserPrompt,
        systemPrompt,
        { maxTokens: Math.max(2000, missingCount * 220) }
      );

      const retryQuestions = retryResult?.questions || [];
      for (const q of retryQuestions) {
        if (!q.question || !q.correctAnswer) continue;
        const qText = q.question.trim();
        const normText = qText.toLowerCase();
        if (seenQuestions.has(normText)) continue;
        seenQuestions.add(normText);

        const qType = q.type && ["multiple_choice", "true_false", "short_answer"].includes(q.type)
          ? q.type
          : "multiple_choice";

        let options = q.options;
        if (qType === "true_false" && (!options || options.length === 0)) {
          options = ["True", "False"];
        }

        sanitizedQuestions.push({
          question: qText,
          type: qType,
          options: options || undefined,
          correctAnswer: q.correctAnswer.trim(),
          explanation: q.explanation ? q.explanation.trim() : "Correct answer based on study material.",
          difficulty: q.difficulty && ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
        });

        if (sanitizedQuestions.length === targetCount) break;
      }
    }

    // Strict Final Validation & Insufficient Content Error Handling
    if (sanitizedQuestions.length < targetCount) {
      if (sanitizedQuestions.length === 0) {
        return NextResponse.json(
          { error: "Unable to generate quiz questions from the selected study material. Please try another source or custom topic." },
          { status: 400 }
        );
      }

      if (isShortSource || sanitizedQuestions.length < targetCount * 0.7) {
        return NextResponse.json(
          {
            error: `You requested ${targetCount} questions, but the selected material only supports ${sanitizedQuestions.length} unique questions. Please choose a smaller question count or select broader source material.`,
            availableCount: sanitizedQuestions.length,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      title: quizTitle,
      sourceTitle,
      questions: sanitizedQuestions.slice(0, targetCount),
    });
  } catch (err: any) {
    console.error("[POST /api/quizzes/generate]", err);
    return NextResponse.json({ error: "Failed to generate AI quiz." }, { status: 500 });
  }
}
