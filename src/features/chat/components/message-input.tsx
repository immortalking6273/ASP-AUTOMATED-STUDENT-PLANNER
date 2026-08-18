"use client";

import * as React from "react";
import { Send, Square, Layers, FileText, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceScope } from "../types";

export const DEFAULT_SOURCE_SCOPE: SourceScope = {
  type: "workspace",
  documentIds: [],
  notebookId: undefined,
  notebookTitle: "",
  responseMode: "hybrid",
};

interface MessageInputProps {
  isStreaming: boolean;
  sourceScope?: SourceScope;
  onSend?: (text: string) => void;
  onSendMessage?: (text: string) => void;
  onStop?: () => void;
  onStopGeneration?: () => void;
  onOpenSources?: () => void;
}

export function MessageInput({
  isStreaming,
  sourceScope = DEFAULT_SOURCE_SCOPE,
  onSend,
  onSendMessage,
  onStop,
  onStopGeneration,
  onOpenSources,
}: MessageInputProps) {
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Guarantee scope is initialized
  const scope = sourceScope || DEFAULT_SOURCE_SCOPE;
  const handleSend = onSendMessage || onSend || (() => { });
  const handleStop = onStopGeneration || onStop || (() => { });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim() && !isStreaming) {
        handleSend(text.trim());
        setText("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSendClick = () => {
    if (text.trim() && !isStreaming) {
      handleSend(text.trim());
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const getSourceBadgeLabel = () => {
    if (scope.type === "notebook") {
      return scope.notebookTitle ? `Notebook: ${scope.notebookTitle}` : "Notebook Scope";
    }
    if (scope.type === "documents") {
      const count = scope.documentIds?.length || 0;
      return count > 0 ? `${count} Selected Document${count > 1 ? "s" : ""}` : "Selected Documents";
    }
    return "All Workspace Documents";
  };

  return (
    <div className="relative w-full rounded-2xl border border-border/80 bg-card p-3 shadow-lg focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all space-y-2">
      {/* Source Scope Shortcut Badge */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2 px-1">
        <button
          type="button"
          onClick={onOpenSources}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground hover:bg-secondary border border-border/60 transition-colors"
          title="Click to select documents or notebook"
        >
          {scope.type === "notebook" ? (
            <Layers className="h-3 w-3 text-primary" />
          ) : scope.type === "documents" ? (
            <FileText className="h-3 w-3 text-indigo-500" />
          ) : (
            <Globe className="h-3 w-3 text-emerald-500" />
          )}
          <span className="truncate max-w-[200px]">{getSourceBadgeLabel()}</span>
        </button>

        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          Press <kbd className="rounded bg-muted px-1 font-mono text-[9px]">Enter</kbd> to send, <kbd className="rounded bg-muted px-1 font-mono text-[9px]">Shift+Enter</kbd> for line
        </span>
      </div>

      {/* Input Text Area + Controls */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your study materials..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-1 text-xs sm:text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none max-h-44 min-h-[38px]"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors"
            title="Stop generating response"
          >
            <Square className="h-4 w-4 fill-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendClick}
            disabled={!text.trim()}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm",
              text.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
