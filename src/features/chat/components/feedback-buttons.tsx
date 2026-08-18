"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown, Bookmark, Copy, Check, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface FeedbackButtonsProps {
  messageId: string;
  content: string;
  feedback?: "up" | "down" | null;
  isBookmarked?: boolean;
  onFeedback: (rating: "up" | "down") => void;
  onBookmark: () => void;
  onRegenerate?: () => void;
}

export function FeedbackButtons({
  messageId,
  content,
  feedback,
  isBookmarked,
  onFeedback,
  onBookmark,
  onRegenerate,
}: FeedbackButtonsProps) {
  const [copiedResponse, setCopiedResponse] = React.useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = React.useState(false);

  const handleCopyResponse = async () => {
    try {
      // Strip markdown tags for clean plain text copy
      const plainText = content
        .replace(/#{1,6}\s+/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`{3}[\s\S]*?`{3}/g, (m) => m.replace(/`{3}\w*\n?/g, ""))
        .replace(/`(.*?)`/g, "$1");

      await navigator.clipboard.writeText(plainText.trim());
      setCopiedResponse(true);
      toast.success("Plain text response copied");
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch {
      toast.error("Failed to copy response");
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMarkdown(true);
      toast.success("Raw Markdown syntax copied");
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch {
      toast.error("Failed to copy markdown");
    }
  };

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      {/* Copy Clean Response Button */}
      <button
        type="button"
        onClick={handleCopyResponse}
        className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-accent hover:text-foreground transition-colors text-[11px] font-medium"
        title="Copy response as plain text"
      >
        {copiedResponse ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Copy Text</span>
      </button>

      {/* Copy Raw Markdown Button */}
      <button
        type="button"
        onClick={handleCopyMarkdown}
        className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-accent hover:text-foreground transition-colors text-[11px] font-medium"
        title="Copy raw Markdown syntax"
      >
        {copiedMarkdown ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <FileCode className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">Copy Markdown</span>
      </button>

      {/* Thumbs Up */}
      <button
        type="button"
        onClick={() => onFeedback("up")}
        className={cn(
          "rounded-lg p-1.5 transition-colors",
          feedback === "up"
            ? "bg-emerald-500/10 text-emerald-500 font-bold"
            : "hover:bg-accent hover:text-foreground"
        )}
        title="Good response"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>

      {/* Thumbs Down */}
      <button
        type="button"
        onClick={() => onFeedback("down")}
        className={cn(
          "rounded-lg p-1.5 transition-colors",
          feedback === "down"
            ? "bg-destructive/10 text-destructive font-bold"
            : "hover:bg-accent hover:text-foreground"
        )}
        title="Bad response"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>

      {/* Bookmark Button */}
      <button
        type="button"
        onClick={onBookmark}
        className={cn(
          "rounded-lg p-1.5 transition-colors",
          isBookmarked
            ? "bg-primary/10 text-primary font-bold"
            : "hover:bg-accent hover:text-foreground"
        )}
        title="Bookmark response"
      >
        <Bookmark className={cn("h-3.5 w-3.5", isBookmarked && "fill-primary")} />
      </button>
    </div>
  );
}
