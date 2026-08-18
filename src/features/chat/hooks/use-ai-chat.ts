"use client";

import * as React from "react";
import { ChatMessage, ConversationItem, SourceScope, CitationItem, ExportFormat, AIResponseMode, AnswerSource } from "../types";
import { toast } from "@/components/ui/toast";

export function useAIChat(workspaceId: string | null) {
  const [conversations, setConversations] = React.useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [streamingCitations, setStreamingCitations] = React.useState<CitationItem[]>([]);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Active Source Scope & Response Mode State (Hybrid Mode Default)
  const [responseMode, setResponseMode] = React.useState<AIResponseMode>("hybrid");
  const [sourceScope, setSourceScope] = React.useState<SourceScope>({ type: "workspace", responseMode: "hybrid" });
  const [searchQuery, setSearchQuery] = React.useState("");

  // 1. Fetch Conversations when workspaceId changes
  const fetchConversations = React.useCallback(async () => {
    if (!workspaceId) return;
    setIsLoadingConversations(true);
    try {
      const res = await fetch(`/api/chat/conversations?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      const list: ConversationItem[] = (data.conversations || []).map((c: any) => ({
        id: c.id,
        workspaceId: c.workspace_id,
        userId: c.user_id,
        title: c.title,
        sourceScope: c.source_scope || { type: "workspace", responseMode: "hybrid" },
        isPinned: c.is_pinned || false,
        isArchived: c.is_archived || false,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      setConversations(list);

      // Auto-select top conversation if none active
      if (list.length > 0 && !activeConversationId) {
        setActiveConversationId(list[0].id);
        setSourceScope(list[0].sourceScope);
        if (list[0].sourceScope?.responseMode) {
          setResponseMode(list[0].sourceScope.responseMode);
        }
      }
    } catch (err: any) {
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [workspaceId, activeConversationId]);

  React.useEffect(() => {
    fetchConversations();
  }, [workspaceId]);

  // 2. Fetch Messages when activeConversationId changes
  const fetchMessages = React.useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();

      const rawMsgs = data.messages || [];
      const formattedMsgs: ChatMessage[] = rawMsgs.map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        citations: m.citations || [],
        metadata: m.metadata || {},
        createdAt: m.created_at,
      }));

      setMessages(formattedMsgs);
      if (data.conversation?.source_scope) {
        setSourceScope(data.conversation.source_scope);
        if (data.conversation.source_scope.responseMode) {
          setResponseMode(data.conversation.source_scope.responseMode);
        }
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
      toast.error("Could not load message history");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, fetchMessages]);

  // 3. Create New Conversation
  const startNewConversation = async (scopeOverride?: SourceScope): Promise<string | null> => {
    if (!workspaceId) return null;

    const effectiveScope = scopeOverride || sourceScope;
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: "New Study Chat",
          sourceScope: { ...effectiveScope, responseMode },
        }),
      });

      if (!res.ok) throw new Error("Failed to create conversation");
      const data = await res.json();

      const newConv: ConversationItem = {
        id: data.conversation.id,
        workspaceId: data.conversation.workspace_id,
        userId: data.conversation.user_id,
        title: data.conversation.title,
        sourceScope: data.conversation.source_scope,
        isPinned: data.conversation.is_pinned || false,
        isArchived: data.conversation.is_archived || false,
        createdAt: data.conversation.created_at,
        updatedAt: data.conversation.updated_at,
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      setSourceScope(effectiveScope);
      return newConv.id;
    } catch (err: any) {
      toast.error("Could not create conversation", err.message);
      return null;
    }
  };

  // 4. Send Message via SSE Stream (Hybrid Mode Default)
  const sendMessage = async (questionText: string) => {
    if (!questionText.trim() || !workspaceId) return;

    let targetConvId = activeConversationId;
    if (!targetConvId) {
      targetConvId = await startNewConversation();
      if (!targetConvId) return;
    }

    // Add user message optimistically to local UI
    const tempUserId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempUserId,
      conversationId: targetConvId,
      role: "user",
      content: questionText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Prepare streaming state
    setIsStreaming(true);
    setStreamingText("");
    setStreamingCitations([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // History for context
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: targetConvId,
          workspaceId,
          question: questionText.trim(),
          sourceScope: { ...sourceScope, responseMode },
          mode: responseMode,
          history: historyPayload,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("API streaming error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let capturedCitations: CitationItem[] = [];
      let capturedAnswerSource: AnswerSource = "hybrid";

      let rafId: number | null = null;
      let isFirstToken = true;

      const scheduleTextUpdate = () => {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          setStreamingText(accumulated);
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (!line.trim().startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.trim().slice(6));

            if (parsed.type === "metadata") {
              if (parsed.answerSource) capturedAnswerSource = parsed.answerSource;
            } else if (parsed.type === "citations") {
              capturedCitations = parsed.citations || [];
              setStreamingCitations(capturedCitations);
            } else if (parsed.type === "delta") {
              accumulated += parsed.text || "";
              if (isFirstToken) {
                isFirstToken = false;
                setStreamingText(accumulated); // Instant first token render
              } else {
                scheduleTextUpdate(); // RAF smooth batching
              }
            } else if (parsed.type === "done") {
              break;
            }
          } catch {}
        }
      }

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      setStreamingText(accumulated);

      // Append finalized assistant message
      if (accumulated) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          conversationId: targetConvId,
          role: "assistant",
          content: accumulated,
          citations: capturedCitations,
          metadata: {
            answerSource: capturedAnswerSource,
            responseMode,
          },
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }

      // Auto-title conversation if it was default
      const currentConv = conversations.find((c) => c.id === targetConvId);
      if (currentConv && currentConv.title === "New Study Chat" && messages.length <= 1) {
        const autoTitle = questionText.slice(0, 30) + (questionText.length > 30 ? "..." : "");
        renameConversation(targetConvId, autoTitle);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Chat Stream Error:", err);
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          conversationId: targetConvId,
          role: "error",
          content: "Failed to generate AI response. Please try again.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingText("");
      setStreamingCitations([]);
      abortControllerRef.current = null;
    }
  };

  // 5. Stop Streaming Generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // 6. Delete Conversation
  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete conversation");

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      toast.success("Conversation deleted");
    } catch (err: any) {
      toast.error("Delete failed", err.message);
    }
  };

  // 7. Rename Conversation
  const renameConversation = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to rename conversation");

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (err: any) {
      toast.error("Rename failed", err.message);
    }
  };

  // 8. Toggle Pin Conversation
  const togglePinConversation = async (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    const nextPin = !conv.isPinned;
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: nextPin }),
      });
      if (!res.ok) throw new Error("Failed to pin conversation");

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isPinned: nextPin } : c))
      );
    } catch (err: any) {
      toast.error("Pin failed", err.message);
    }
  };

  // 9. Feedback on Message
  const handleFeedback = async (messageId: string, rating: "up" | "down") => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const nextFeedback = msg.metadata?.feedback === rating ? null : rating;
    const updatedMetadata = { ...msg.metadata, feedback: nextFeedback };

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, metadata: updatedMetadata } : m))
    );

    try {
      await fetch(`/api/chat/messages/${messageId}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });
    } catch {}
  };

  // 10. Bookmark Message
  const handleBookmark = async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const nextBookmark = !msg.metadata?.isBookmarked;
    const updatedMetadata = { ...msg.metadata, isBookmarked: nextBookmark };

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, metadata: updatedMetadata } : m))
    );

    try {
      await fetch(`/api/chat/messages/${messageId}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: updatedMetadata }),
      });
      toast.success(nextBookmark ? "Bookmarked message" : "Removed bookmark");
    } catch {}
  };

  // 11. Regenerate Response
  const handleRegenerate = async () => {
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const lastUserMsg = messages[actualIndex];

    // Remove subsequent messages
    setMessages((prev) => prev.slice(0, actualIndex + 1));
    await sendMessage(lastUserMsg.content);
  };

  // 12. Update Source Scope & Response Mode
  const updateSourceScope = (newScope: SourceScope) => {
    setSourceScope(newScope);
    if (newScope.responseMode) {
      setResponseMode(newScope.responseMode);
    }
  };

  const updateResponseMode = (newMode: AIResponseMode) => {
    setResponseMode(newMode);
    setSourceScope((prev) => ({ ...prev, responseMode: newMode }));
  };

  // Filtered conversations by search query
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    conversations: filteredConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,

    // Streaming
    isStreaming,
    streamingText,
    streamingCitations,
    sendMessage,
    stopGeneration,

    // Scope & Settings
    sourceScope,
    updateSourceScope,
    responseMode,
    updateResponseMode,
    searchQuery,
    setSearchQuery,

    // Actions
    startNewConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    handleFeedback,
    handleBookmark,
    handleRegenerate,
  };
}
