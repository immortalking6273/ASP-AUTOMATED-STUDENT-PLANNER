"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useKBChat, KBChatMessage, KBChatCitation } from "@/features/knowledge-base/hooks/use-kb-chat";

export function KBChat({ workspaceId }: { workspaceId: string | null }) {
  const {
    messages,
    isStreaming,
    streamingText,
    streamingCitations,
    sendMessage,
    stopGeneration,
    clearChat,
    searchQuery,
    setSearchQuery,
  } = useKBChat(workspaceId);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card/60 p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-base text-foreground">Ask the Knowledge Base</h3>
        <Button variant="ghost" size="sm" onClick={clearChat} disabled={isStreaming}>
          Clear
        </Button>
      </div>

      {/* Message list — native scrollable div, no ScrollArea dependency */}
      <div ref={scrollRef} className="h-64 overflow-y-auto pr-2 mb-4 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            Ask a question about your study materials…
          </p>
        )}
        {messages.map((msg: KBChatMessage, idx: number) => (
          <div key={idx} className={cn("mb-3", msg.role === "assistant" && "ml-2")}>
            <div
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider mb-1",
                msg.role === "assistant" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {msg.role === "assistant" ? "Knowledge Base" : "You"}
            </div>
            <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </div>
            {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
              <div className="mt-2 space-y-1">
                {msg.citations.map((c: KBChatCitation, i: number) => (
                  <div
                    key={i}
                    className="text-[10px] text-muted-foreground bg-muted/40 rounded px-2 py-1 border border-border/50"
                  >
                    <span className="font-semibold text-primary/80">[{i + 1}]</span>{" "}
                    <span className="font-medium">{c.documentTitle ?? "Document"}:</span>{" "}
                    {c.snippet?.slice(0, 120)}…
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {isStreaming && streamingText && (
          <div className="ml-2">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-primary">
              Knowledge Base
            </div>
            <div className="text-xs text-foreground whitespace-pre-wrap leading-relaxed animate-pulse">
              {streamingText}
            </div>
          </div>
        )}
        {isStreaming && !streamingText && (
          <div className="ml-2 flex gap-1 items-center mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Ask a question about your study materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(searchQuery);
            }
          }}
        />
        <Button
          onClick={() => sendMessage(searchQuery)}
          disabled={isStreaming || !searchQuery.trim()}
        >
          Send
        </Button>
        {isStreaming && (
          <Button variant="destructive" onClick={stopGeneration}>
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
