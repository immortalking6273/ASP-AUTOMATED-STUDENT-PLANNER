"use client";

import * as React from "react";

export interface KBChatCitation {
  documentId: string;
  documentTitle: string;
  snippet: string;
}

export interface KBChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: KBChatCitation[];
}

export function useKBChat(workspaceId: string | null) {
  const [messages, setMessages] = React.useState<KBChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [streamingCitations, setStreamingCitations] = React.useState<KBChatCitation[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);

  const sendMessage = React.useCallback(
    async (query: string) => {
      if (!query.trim() || !workspaceId || isStreaming) return;

      const userMsg: KBChatMessage = { role: "user", content: query.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setSearchQuery("");
      setIsStreaming(true);
      setStreamingText("");
      setStreamingCitations([]);

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/knowledge-base/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId, query: query.trim() }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || "Knowledge Base query failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accText = "";
        let citations: KBChatCitation[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") continue;

              try {
                const parsed = JSON.parse(payload);
                if (parsed.type === "text" && parsed.content) {
                  accText += parsed.content;
                  setStreamingText(accText);
                } else if (parsed.type === "citations") {
                  citations = parsed.citations || [];
                  setStreamingCitations(citations);
                }
              } catch {
                // non-JSON chunk — treat as raw text delta
                if (payload && payload !== "[DONE]") {
                  accText += payload;
                  setStreamingText(accText);
                }
              }
            }
          }
        }

        const assistantMsg: KBChatMessage = {
          role: "assistant",
          content: accText || "(No response generated)",
          citations: citations.length > 0 ? citations : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        const errMsg: KBChatMessage = {
          role: "assistant",
          content: `Error: ${err.message || "Could not reach the Knowledge Base."}`,
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        setStreamingCitations([]);
      }
    },
    [workspaceId, isStreaming]
  );

  const stopGeneration = React.useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingText("");
  }, []);

  const clearChat = React.useCallback(() => {
    if (isStreaming) abortRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    setStreamingCitations([]);
    setIsStreaming(false);
  }, [isStreaming]);

  return {
    messages,
    isStreaming,
    streamingText,
    streamingCitations,
    sendMessage,
    stopGeneration,
    clearChat,
    searchQuery,
    setSearchQuery,
  };
}
