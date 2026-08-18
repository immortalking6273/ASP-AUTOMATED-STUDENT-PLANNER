import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { RetrievalService, SearchResultChunk } from "@/services/ai/retrieval-service";
import { ChatService, CitationItem } from "@/services/db/chat-service";
import { NvidiaNimProvider } from "@/services/ai/nvidia-nim-provider";
import { sanitizeHumanReadableText, isValidChunkText } from "@/lib/text-sanitizer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const requestStartTime = performance.now();
  let provider = "nvidia-nim";
  let model = NvidiaNimProvider.getModel();
  let currentStep = "Initialization";

  try {
    // 1. Step 1: Environment Variables & Provider Selection
    currentStep = "Loading environment variables";
    let apiKey = process.env.NVIDIA_API_KEY;
    const isNvidiaKeySet = Boolean(process.env.NVIDIA_API_KEY);

    if (process.env.AI_PROVIDER) {
      provider = process.env.AI_PROVIDER.toLowerCase();
    } else if (isNvidiaKeySet) {
      provider = "nvidia-nim";
      model = NvidiaNimProvider.getModel();
    } else if (process.env.GROQ_API_KEY) {
      provider = "groq";
      model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      apiKey = process.env.GROQ_API_KEY;
    }

    if (!isNvidiaKeySet && provider === "nvidia-nim") {
      console.error("[NVIDIA NIM Config Error] NVIDIA_API_KEY is not configured.");
    }

    // 2. Step 2: Supabase Auth Check
    currentStep = "Authenticating user";
    const authStart = performance.now();
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
    const authTimeMs = (performance.now() - authStart).toFixed(1);

    if (authErr || !user) {
      console.error("[Auth Error] Supabase authentication failed:", authErr?.message);
      return NextResponse.json({ error: "Unauthorized access. Authentication is required." }, { status: 401 });
    }

    // 3. Step 3: Parse Request & Validate Workspace Access
    currentStep = "Validating request parameters";
    const wsStart = performance.now();
    const body = await req.json();
    const { conversationId, workspaceId: rawWorkspaceId, question, sourceScope, history, mode } = body;
    const responseMode = mode || sourceScope?.responseMode || "hybrid";

    if (!rawWorkspaceId || !question) {
      return NextResponse.json(
        { error: "workspaceId and question parameters are required" },
        { status: 400 }
      );
    }

    // Multi-stage workspace resolution:
    // 1. Direct workspace ID match for authenticated user
    // 2. Notebook ID resolution (lookup notebook's parent workspace_id)
    // 3. Fallback to user's default/primary workspace
    let targetWorkspaceId: string | null = null;

    const { data: directWs } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", rawWorkspaceId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (directWs) {
      targetWorkspaceId = directWs.id;
    } else {
      // Check if rawWorkspaceId is actually a Notebook ID
      const { data: nb } = await supabase
        .from("notebooks")
        .select("workspace_id")
        .eq("id", rawWorkspaceId)
        .maybeSingle();

      if (nb && nb.workspace_id) {
        const { data: nbWs } = await supabase
          .from("workspaces")
          .select("id")
          .eq("id", nb.workspace_id)
          .eq("owner_id", user.id)
          .maybeSingle();

        if (nbWs) {
          targetWorkspaceId = nbWs.id;
        }
      }
    }

    // Fallback: If not resolved yet, retrieve user's primary workspace
    if (!targetWorkspaceId) {
      const { data: defaultWs } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (defaultWs) {
        targetWorkspaceId = defaultWs.id;
      }
    }

    const wsTimeMs = (performance.now() - wsStart).toFixed(1);

    if (!targetWorkspaceId) {
      console.error(`[Workspace Access Error] User "${user.id}" has no accessible workspace (Target ID: "${rawWorkspaceId}")`);
      return NextResponse.json(
        { error: "Workspace not found or access denied" },
        { status: 403 }
      );
    }

    // 4. Step 4: High-Confidence RAG Retrieval Engine
    currentStep = "RAG retrieval";
    const ragStart = performance.now();
    let documentIds: string[] | undefined = undefined;
    if (sourceScope?.type === "documents" && Array.isArray(sourceScope.documentIds) && sourceScope.documentIds.length > 0) {
      documentIds = sourceScope.documentIds;
    }

    let retrievalResult = {
      chunks: [] as SearchResultChunk[],
      confidenceLevel: "LOW" as "HIGH" | "MEDIUM" | "LOW",
      topScore: 0,
      averageTopScore: 0,
      candidateCount: 0,
      retrievalDurationMs: 0,
      docMap: new Map<string, string>(),
    };

    try {
      retrievalResult = await RetrievalService.retrieveContext(
        supabase,
        targetWorkspaceId,
        question,
        {
          candidateLimit: 20,
          rerankLimit: 6,
          documentIds,
        }
      );
    } catch (ragErr) {
      console.error("[RAG Retrieval Exception] Vector search failed, continuing gracefully in General AI mode:", ragErr);
    }
    const ragTimeMs = (performance.now() - ragStart).toFixed(1);

    const searchResults = retrievalResult.chunks;
    const confidenceLevel = retrievalResult.confidenceLevel;
    const docMap = retrievalResult.docMap;

    // Build Cleaned Citations & Structured Context Block (Garbage Removal & Context Budget Enforcement)
    const citations: CitationItem[] = [];
    let contextTextBlock = "";
    let totalContextChars = 0;
    const MAX_TOTAL_CONTEXT_CHARS = 6000;
    const MAX_CHUNK_CHARS = 1200;

    for (let idx = 0; idx < searchResults.length; idx++) {
      const res = searchResults[idx];
      const docTitle = res.documentTitle || docMap.get(res.chunk.document_id) || "Document";

      let cleanContent = sanitizeHumanReadableText(res.chunk.content);

      // Validate clean content with isValidChunkText
      if (!isValidChunkText(cleanContent)) {
        continue;
      }

      if (cleanContent.length > MAX_CHUNK_CHARS) {
        cleanContent = cleanContent.slice(0, MAX_CHUNK_CHARS) + "... [truncated]";
      }

      if (totalContextChars + cleanContent.length > MAX_TOTAL_CONTEXT_CHARS) {
        break;
      }

      totalContextChars += cleanContent.length;

      citations.push({
        documentId: res.chunk.document_id,
        documentTitle: docTitle,
        chunkId: res.chunk.id,
        heading: res.chunk.heading || null,
        snippet: cleanContent.slice(0, 300),
        similarityScore: res.similarityScore,
      });

      // Format Structured Context according to Section 16 & 19
      contextTextBlock += `\nSOURCE ${citations.length}\n`;
      contextTextBlock += `Document: ${docTitle}\n`;
      if (res.pageNumber) {
        contextTextBlock += `Page: ${res.pageNumber}\n`;
      }
      if (res.chunk.heading) {
        contextTextBlock += `Section: ${res.chunk.heading}\n`;
      }
      if (res.elementType) {
        contextTextBlock += `Element Type: ${res.elementType}\n`;
      }
      contextTextBlock += `Content:\n${cleanContent}\n`;
    }

    // Determine Answer Source Type
    let answerSource: "document" | "general" | "hybrid" = "general";
    if (responseMode === "general_ai" || citations.length === 0) {
      answerSource = "general";
    } else {
      const qLower = question.toLowerCase();
      const isComparisonOrMultiTopic = /compare|difference|versus|\bvs\b|python|javascript|c\+\+|rust|go\b|sql|other/i.test(qLower);
      answerSource = isComparisonOrMultiTopic || confidenceLevel === "MEDIUM" || confidenceLevel === "LOW" ? "hybrid" : "document";
    }

    // 5. Step 5: Construct System & User Prompt based on Grounding Confidence
    currentStep = "Constructing system prompt";
    let systemPrompt = "";

    if (responseMode !== "general_ai" && citations.length > 0) {
      systemPrompt = `You are ASP AI Assistant, an intelligent academic study assistant for ASP (Automated Student Planner).

Your task is to answer the user's question accurately using the supplied study materials context below.

RETRIEVED DOCUMENT CONTEXT:
${contextTextBlock}

GROUNDING & ANSWERING RULES:
1. Base your answer directly on the provided RETRIEVED DOCUMENT CONTEXT above whenever it is relevant.
2. If the user asks what is written in a file, what a document contains, or for a summary/explanation, state the extracted content accurately.
3. Do not invent or fabricate facts, page numbers, or section names that are not present in the context.
4. If the retrieved context is partial or does not fully answer the question, you may supplement with clear general academic knowledge, but clearly distinguish document-sourced facts from general knowledge.`;
    } else {
      systemPrompt = `You are ASP AI Assistant, an intelligent academic study assistant for ASP (Automated Student Planner).

NOTICE:
The user's uploaded study materials were searched, but did not contain relevant document chunks for this query.

ANSWERING RULES:
1. Clearly inform the user that their uploaded materials did not contain enough information to answer this question directly from the documents.
2. Provide a helpful, clear, and accurate answer using your general academic knowledge.
3. Clearly state that this answer is based on general knowledge.`;
    }

    // Development RAG Debug Logging
    if (process.env.NODE_ENV === "development" || process.env.RAG_DEBUG === "true") {
      console.log("\n==================== [RAG CHAT DEBUG LOG] ====================");
      console.log(`[USER QUERY]: "${question}"`);
      console.log(`[RETRIEVED CHUNKS COUNT]: ${searchResults.length}`);
      console.log(`[CONFIDENCE LEVEL]: ${confidenceLevel} (Top Score: ${(retrievalResult.topScore * 100).toFixed(1)}%)`);
      console.log(`[SIMILARITY SCORES]:`, citations.map(c => `${c.documentTitle}: ${(c.similarityScore * 100).toFixed(1)}%`));
      console.log(`[FINAL RAG CONTEXT]:\n${contextTextBlock || "[No Context]"}`);
      console.log(`[SYSTEM PROMPT PREVIEW]:\n${systemPrompt.slice(0, 350)}...\n`);
      console.log("=============================================================\n");
    }


    const validHistory = Array.isArray(history)
      ? history
          .filter((m: any) => ["user", "assistant", "system"].includes(m.role))
          .map((m: any) => ({ role: m.role, content: m.content }))
          .slice(-6)
      : [];

    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...validHistory,
      { role: "user", content: question },
    ];

    // Check API Key Presence
    if (!apiKey || apiKey === "YOUR_NVIDIA_API_KEY") {
      const fallbackText = searchResults.length > 0
        ? `Here is the information found in your documents:\n\n` +
          searchResults.map((r, i) => `**Source ${i + 1} (${docMap.get(r.chunk.document_id)}):**\n${r.chunk.content}`).join("\n\n")
        : `NVIDIA_API_KEY is not configured in .env.local. Please add your NVIDIA API key to enable live AI chat generation.`;

      if (conversationId) {
        await ChatService.addMessage(
          { conversationId, workspaceId: targetWorkspaceId, userId: user.id, role: "user", content: question },
          supabase
        );
        await ChatService.addMessage(
          { conversationId, workspaceId: targetWorkspaceId, userId: user.id, role: "assistant", content: fallbackText, citations },
          supabase
        );
      }

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "metadata", answerSource, mode: responseMode })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "citations", citations })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "delta", text: fallbackText })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // 6. Step 6: Calling LLM Endpoint with Failover
    currentStep = "Calling LLM API";
    const llmStart = performance.now();
    let apiUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    let targetApiKey = apiKey;
    let targetModel = model;

    if (provider === "groq") {
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    }

    let llmResponse: Response | null = null;
    let fetchErrorMsg: string | null = null;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      llmResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${targetApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: targetModel,
          messages: conversationMessages,
          temperature: 0.2,
          max_tokens: 1024,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
    } catch (err: any) {
      fetchErrorMsg = err?.message || String(err);
      console.error(`[LLM Connection Exception] Provider "${provider}" fetch failed:`, fetchErrorMsg);
    }

    // Secondary Failover to Groq if Primary NVIDIA connection times out or fails
    if ((!llmResponse || !llmResponse.ok) && process.env.GROQ_API_KEY && provider !== "groq") {
      console.log(`[Failover] Primary provider "${provider}" connection issue. Failing over to Groq API...`);
      try {
        apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        targetApiKey = process.env.GROQ_API_KEY;
        targetModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
        provider = "groq";

        llmResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${targetApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: targetModel,
            messages: conversationMessages,
            temperature: 0.2,
            max_tokens: 1024,
            stream: true,
          }),
        });
      } catch (failoverErr: any) {
        console.error(`[Failover Error] Secondary Groq provider fetch failed:`, failoverErr?.message);
      }
    }

    if (!llmResponse || !llmResponse.ok) {
      const errText = llmResponse ? await llmResponse.text() : fetchErrorMsg || "Network connection timeout";
      const status = llmResponse ? llmResponse.status : 504;
      console.error(`[LLM Failure] Final Provider "${provider}" (Model "${targetModel}") returned HTTP ${status}:`, errText);

      let userErrorMessage = "AI service is temporarily unavailable. Please try again.";
      if (status === 401 || status === 403) {
        userErrorMessage = "API authentication failed.";
      } else if (status === 404) {
        userErrorMessage = `Selected model or endpoint was not found (${targetModel}).`;
      } else if (status === 429) {
        userErrorMessage = "API rate limit reached. Please try again later.";
      } else if (status === 504) {
        userErrorMessage = "AI service connection timed out. Please try again.";
      }

      return NextResponse.json(
        {
          error: userErrorMessage,
          provider,
          model: targetModel,
          status,
          ...(process.env.NODE_ENV === "development" ? { details: errText } : {}),
        },
        { status: status >= 500 ? 502 : status }
      );
    }

    const llmConnectMs = (performance.now() - llmStart).toFixed(1);

    // Save user message to Supabase DB
    if (conversationId) {
      await ChatService.addMessage(
        { conversationId, workspaceId: targetWorkspaceId, userId: user.id, role: "user", content: question },
        supabase
      );
    }

    // 7. Step 7: Streaming SSE Response to Browser
    currentStep = "Streaming response";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let accumulatedAssistantText = "";
    let firstTokenTimeMs: string | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "metadata", answerSource, mode: responseMode, confidenceLevel, topScore: retrievalResult.topScore })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "citations", citations })}\n\n`));


        if (!llmResponse || !llmResponse.body) {
          controller.close();
          return;
        }

        const reader = llmResponse.body.getReader();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (!firstTokenTimeMs) {
              firstTokenTimeMs = (performance.now() - requestStartTime).toFixed(1);
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(":")) continue;
              if (trimmed === "data: [DONE]") continue;

              if (trimmed.startsWith("data: ")) {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const token = json.choices?.[0]?.delta?.content || "";
                  if (token) {
                    accumulatedAssistantText += token;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: "delta", text: token })}\n\n`)
                    );
                  }
                } catch {
                  // Ignore JSON parse errors for fragmented SSE chunks
                }
              }
            }
          }

          if (buffer.trim() && buffer.trim().startsWith("data: ")) {
            try {
              const json = JSON.parse(buffer.trim().slice(6));
              const token = json.choices?.[0]?.delta?.content || "";
              if (token) {
                accumulatedAssistantText += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "delta", text: token })}\n\n`)
                );
              }
            } catch {}
          }

          // Save final assistant message to DB
          if (conversationId && accumulatedAssistantText) {
            await ChatService.addMessage(
              {
                conversationId,
                workspaceId: targetWorkspaceId,
                userId: user.id,
                role: "assistant",
                content: accumulatedAssistantText,
                citations,
              },
              supabase
            );
          }

          const totalTimeMs = (performance.now() - requestStartTime).toFixed(1);
          console.log(`[AI PERF] Auth: ${authTimeMs}ms | Workspace: ${wsTimeMs}ms | RAG: ${ragTimeMs}ms | LLM Connect: ${llmConnectMs}ms | TTFT: ${firstTokenTimeMs || "N/A"}ms | Total: ${totalTimeMs}ms (${accumulatedAssistantText.length} chars)`);

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (streamErr: any) {
          console.error("[Streaming Error] Exception while reading stream:", streamErr);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Streaming interrupted.",
                provider,
                model: targetModel,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    console.error(`[AI Stream Route Error at Step "${currentStep}"]`, err);
    return NextResponse.json(
      {
        error: "AI generation service error",
        step: currentStep,
        ...(process.env.NODE_ENV === "development" ? { details: err?.message || String(err) } : {}),
      },
      { status: 500 }
    );
  }
}
