"use client";

import * as React from "react";
import { ChatMessage, ConversationItem, SourceScope, CitationItem, ExportFormat } from "../types";
import { MessageBubble } from "./message-bubble";
import { MessageInput, DEFAULT_SOURCE_SCOPE } from "./message-input";
import { EmptyChatState } from "./empty-chat-state";
import { StreamingIndicator } from "./streaming-indicator";
import { Bot, Download, Settings, RefreshCw, Trash2, Globe, Layers, FileText, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversation: ConversationItem | undefined;
  messages: ChatMessage[];
  sourceScope?: SourceScope;
  isStreaming: boolean;
  streamingText: string;
  streamingCitations: CitationItem[];
  suggestions: string[];
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  onRegenerate: () => void;
  onOpenSources: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  onClearMessages: () => void;
  onFeedback: (messageId: string, rating: "up" | "down") => void;
  onBookmark: (messageId: string) => void;
  onMobileMenuToggle?: () => void;
  isDeveloperMode?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  sourceScope = DEFAULT_SOURCE_SCOPE,
  isStreaming,
  streamingText,
  streamingCitations,
  suggestions,
  onSendMessage,
  onStopGeneration,
  onRegenerate,
  onOpenSources,
  onOpenExport,
  onOpenSettings,
  onClearMessages,
  onFeedback,
  onBookmark,
  onMobileMenuToggle,
  isDeveloperMode = false,
}: ChatWindowProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages or streaming text updates
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, isStreaming]);

  const effectiveScope = sourceScope || DEFAULT_SOURCE_SCOPE;

  const getSourceBadgeLabel = () => {
    if (effectiveScope.type === "notebook") {
      return effectiveScope.notebookTitle ? `Notebook: ${effectiveScope.notebookTitle}` : "Notebook Scope";
    }
    if (effectiveScope.type === "documents") {
      const count = effectiveScope.documentIds?.length || 0;
      return count > 0 ? `${count} Selected Docs` : "Selected Documents";
    }
    return "All Workspace Docs";
  };

  return (
    <div className="flex flex-col h-full flex-1 min-w-0 bg-background">
      {/* Top Header Bar */}
      <div className="flex h-16 items-center justify-between border-b border-border/70 px-4 md:px-6 bg-card/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 truncate">
          {onMobileMenuToggle && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Bot className="h-5 w-5" />
          </div>

          <div className="flex flex-col truncate">
            <h2 className="text-sm font-extrabold text-foreground truncate">
              {conversation?.title || "ASP AI Chat"}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Grounding: Active</span>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenSources}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Layers className="h-3 w-3" />
                <span>{getSourceBadgeLabel()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClearMessages}
              className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenExport}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Export conversation"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="AI RAG Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Message Stream Scroll Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
        {messages.length === 0 && !isStreaming ? (
          <EmptyChatState
            sourceScope={effectiveScope}
            suggestions={suggestions}
            onSelectSuggestion={onSendMessage}
          />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isDeveloperMode={isDeveloperMode}
                onFeedback={(rating) => onFeedback(msg.id, rating)}
                onBookmark={() => onBookmark(msg.id)}
                onRegenerate={msg.role === "assistant" ? onRegenerate : undefined}
              />
            ))}

            {/* Active Streaming Partial Message */}
            {isStreaming && (
              <div className="space-y-3">
                {streamingText ? (
                  <MessageBubble
                    message={{
                      id: "streaming-temp",
                      conversationId: conversation?.id || "",
                      role: "assistant",
                      content: streamingText,
                      citations: streamingCitations,
                      createdAt: new Date().toISOString(),
                    }}
                    isDeveloperMode={isDeveloperMode}
                    onFeedback={() => {}}
                    onBookmark={() => {}}
                  />
                ) : (
                  <StreamingIndicator />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Message Input Box */}
      <div className="p-4 bg-card/30 border-t border-border/60 shrink-0">
        <MessageInput
          sourceScope={effectiveScope}
          isStreaming={isStreaming}
          onSendMessage={onSendMessage}
          onStopGeneration={onStopGeneration}
          onOpenSources={onOpenSources}
        />
      </div>
    </div>
  );
}
