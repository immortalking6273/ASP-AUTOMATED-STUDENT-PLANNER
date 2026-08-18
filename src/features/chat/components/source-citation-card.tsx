"use client";

import * as React from "react";
import { CitationItem } from "../types";
import { FileText, ExternalLink, ChevronRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceCitationCardProps {
  citation: CitationItem;
  index: number;
}

export function SourceCitationCard({ citation, index }: SourceCitationCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const matchPercent = Math.round((citation.similarityScore || 0) * 100);

  return (
    <>
      {/* Clickable Citation Pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs",
          "hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
        )}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {index + 1}
        </span>
        <FileText className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="truncate max-w-[140px] text-foreground font-semibold">
          {citation.documentTitle}
        </span>
        {citation.heading && (
          <span className="text-[10px] text-muted-foreground truncate max-w-[100px] hidden sm:inline">
            · {citation.heading}
          </span>
        )}
        <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {matchPercent}% match
        </span>
      </button>

      {/* Detail Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in-0">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{citation.documentTitle}</h3>
                  {citation.heading && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <ChevronRight className="h-3 w-3 text-primary" />
                      <span>{citation.heading}</span>
                    </p>
                  )}
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {matchPercent}% Vector Match
              </span>
            </div>

            {/* Content Snippet */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Retrieved Context Snippet
              </label>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-foreground font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {citation.snippet}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
