"use client";

import * as React from "react";
import { Tag, Globe, User, BookMarked } from "lucide-react";

interface KnowledgeSummaryProps {
  metadata?: {
    title?: string;
    author?: string | null;
    subject?: string | null;
    keywords?: string[];
    language?: string;
  } | null;
}

export function KnowledgeSummary({ metadata }: KnowledgeSummaryProps) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 text-xs text-muted-foreground italic text-center">
        No extracted metadata available yet. Process document to generate summary.
      </div>
    );
  }

  const { author, subject, keywords, language } = metadata;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Extracted Knowledge Metadata
      </h4>

      <div className="space-y-2 text-xs">
        {subject && (
          <div className="flex items-center gap-2">
            <BookMarked className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">Subject:</span>
            <span className="font-semibold text-foreground">{subject}</span>
          </div>
        )}

        {author && (
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium text-foreground">{author}</span>
          </div>
        )}

        {language && (
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">Language:</span>
            <span className="font-medium text-foreground">{language}</span>
          </div>
        )}

        {keywords && keywords.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Tag className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>Keywords & Topics:</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
