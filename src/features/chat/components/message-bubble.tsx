"use client";

import * as React from "react";
import { ChatMessage } from "../types";
import { User, Bot, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceCitationCard } from "./source-citation-card";
import { FeedbackButtons } from "./feedback-buttons";
import { MarkdownContent } from "./markdown-content";
import { RetrievalDebugPanel } from "./retrieval-debug-panel";

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback: (rating: "up" | "down") => void;
  onBookmark: () => void;
  onRegenerate?: () => void;
  isDeveloperMode?: boolean;
}

function MessageBubbleComponent({
  message,
  onFeedback,
  onBookmark,
  onRegenerate,
  isDeveloperMode = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const isSystem = message.role === "system";

  const citations = message.citations || [];
  const feedback = message.metadata?.feedback;
  const isBookmarked = message.metadata?.isBookmarked;

  const answerSource = message.metadata?.answerSource || (citations.length > 0 ? "document" : "general");
  const isDebugEnv = process.env.NEXT_PUBLIC_DEBUG_RAG === "true";
  const showDebugPanel = isDeveloperMode || isDebugEnv;

  return (
    <div
      className={cn(
        "flex w-full gap-3 sm:gap-4 p-4 rounded-2xl transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-1",
        isUser && "bg-secondary border border-border flex-row-reverse shadow-2xs",
        !isUser && !isError && !isSystem && "bg-card border border-border shadow-2xs",
        isError && "bg-destructive/10 border border-destructive/25 text-destructive",
        isSystem && "bg-muted border border-border text-muted-foreground text-xs text-center justify-center py-2"
      )}
    >
      {/* Role Avatar Icon */}
      {!isSystem && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl font-semibold shadow-2xs text-xs",
            isUser && "bg-primary text-primary-foreground",
            !isUser && !isError && "bg-primary text-primary-foreground",
            isError && "bg-destructive text-destructive-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : isError ? <AlertCircle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
      )}

      {/* Main Message Content */}
      <div className={cn("flex-1 space-y-2 min-w-0", isUser && "text-right")}>
        {/* Header Label */}
        {!isSystem && (
          <div className={cn("flex items-center gap-2 text-[11px] font-bold text-muted-foreground", isUser && "justify-end")}>
            <span className="text-foreground">{isUser ? "You" : isError ? "Error" : "ASP AI Assistant"}</span>
            <span className="text-[10px] font-normal opacity-75">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        )}

        {/* Source Badge */}
        {!isUser && !isError && !isSystem && (
          <div className="mb-2 select-none">
            {answerSource === "document" && (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <span>📚</span>
                <span>Based on your uploaded documents</span>
              </div>
            )}
            {answerSource === "general" && (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-2.5 py-1 text-[11px] font-bold text-primary shadow-2xs">
                <span>🤖</span>
                <span>AI General Knowledge</span>
              </div>
            )}
            {answerSource === "hybrid" && (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-primary/15 border border-primary/25 px-2.5 py-1 text-[11px] font-bold text-primary shadow-2xs">
                <span>📚 + 🤖</span>
                <span>Hybrid Answer</span>
              </div>
            )}
          </div>
        )}

        {/* Body */}
        {isUser ? (
          <div className="text-xs sm:text-sm font-medium leading-relaxed text-foreground whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <MarkdownContent content={message.content} />
        )}

        {/* Developer RAG Debug Panel */}
        {!isUser && !isError && !isSystem && showDebugPanel && (
          <RetrievalDebugPanel citations={citations} question="" threshold={0.25} />
        )}

        {/* Citations Row */}
        {!isUser && citations.length > 0 && (
          <div className="pt-2.5 space-y-1.5 border-t border-border">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Retrieved Sources ({citations.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {citations.map((cit, idx) => (
                <SourceCitationCard key={cit.chunkId || idx} citation={cit} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Action Bar */}
        {!isUser && !isError && !isSystem && (
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <FeedbackButtons
              messageId={message.id}
              content={message.content}
              feedback={feedback}
              isBookmarked={isBookmarked}
              onFeedback={onFeedback}
              onBookmark={onBookmark}
              onRegenerate={onRegenerate}
            />

            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
                title="Regenerate response"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = React.memo(MessageBubbleComponent, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.message.metadata?.feedback === next.message.metadata?.feedback &&
    prev.message.metadata?.isBookmarked === next.message.metadata?.isBookmarked &&
    prev.isDeveloperMode === next.isDeveloperMode
  );
});
