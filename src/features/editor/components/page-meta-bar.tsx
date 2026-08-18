"use client";

import * as React from "react";
import { SaveStatus, EditorBlock } from "../types";
import { PageRow } from "@/types/database";
import { Clock, Search, Star, Archive, FileText, CheckCircle, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageMetaBarProps {
  page: PageRow;
  blocks: EditorBlock[];
  saveStatus: SaveStatus;
  lastSavedTime: Date | null;
  onToggleSearch: () => void;
  onOpenAIAssistant?: () => void;
  onToggleFavorite?: () => void;
  onToggleArchive?: () => void;
}

export function PageMetaBar({
  page,
  blocks,
  saveStatus,
  lastSavedTime,
  onToggleSearch,
  onOpenAIAssistant,
  onToggleFavorite,
  onToggleArchive,
}: PageMetaBarProps) {
  // Calculate document statistics
  const textContent = blocks.map((b) => b.content?.text || "").join(" ");
  const characterCount = textContent.length;
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const renderSaveBadge = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <RefreshCw className="h-3 w-3 animate-spin" /> Saving...
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Saved
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 text-xs text-destructive font-semibold bg-destructive/10 px-2.5 py-1 rounded-full border border-destructive/20">
            <AlertCircle className="h-3 w-3" /> Save Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-accent/40 px-2.5 py-1 rounded-full border border-border">
            Saved
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
      {/* Metrics (Words, Chars, Reading time) */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5 font-medium">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>{wordCount} words</span>
        </div>
        <span>•</span>
        <div className="font-medium">
          <span>{characterCount} chars</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>{readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* Save Status Badge & Quick Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {renderSaveBadge()}

        {onOpenAIAssistant && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAIAssistant}
            leftIcon={<Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />}
            className="text-xs h-8 rounded-xl font-semibold border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          >
            AI Assistant
          </Button>
        )}

        <button
          type="button"
          onClick={onToggleSearch}
          className="p-1.5 rounded-xl border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Find in page (Ctrl+F)"
        >
          <Search className="h-4 w-4" />
        </button>

        {onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-accent text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer"
            title="Favorite Page"
          >
            <Star className="h-4 w-4" />
          </button>
        )}

        {onToggleArchive && (
          <button
            type="button"
            onClick={onToggleArchive}
            className="p-1.5 rounded-xl border border-border bg-background hover:bg-accent text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            title="Archive Page"
          >
            <Archive className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
