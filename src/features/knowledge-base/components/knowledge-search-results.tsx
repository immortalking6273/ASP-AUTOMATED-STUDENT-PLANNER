"use client";

import * as React from "react";
import { KnowledgeSearchResult } from "../types";
import { Sparkles, FileText, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KnowledgeSearchResultsProps {
  results: KnowledgeSearchResult[];
  onClear: () => void;
  onSelectDocument?: (documentId: string) => void;
}

export function KnowledgeSearchResults({ results, onClear, onSelectDocument }: KnowledgeSearchResultsProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-extrabold text-base text-foreground">
            Semantic Knowledge Results
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">
            ({results.length} matches)
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          leftIcon={<X className="h-4 w-4" />}
          className="rounded-xl text-xs"
        >
          Clear Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {results.map((res) => (
          <div
            key={res.chunkId}
            className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-card space-y-2.5 shadow-2xs hover:border-primary/40 transition-all"
          >
            <div className="space-y-1.5">
              {/* Document Header & Relevance Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold text-xs text-foreground truncate">
                    {res.documentTitle}
                  </span>
                </div>

                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full border text-[10px] font-extrabold shrink-0",
                    res.relevancePercentage >= 70
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-primary/30 bg-primary/10 text-primary"
                  )}
                >
                  {res.relevancePercentage}% Relevance
                </span>
              </div>

              {res.heading && (
                <div className="text-[11px] font-bold text-muted-foreground">
                  Section: {res.heading}
                </div>
              )}

              {/* Excerpt */}
              <p className="text-xs text-foreground/90 line-clamp-3 leading-relaxed font-medium">
                &ldquo;{res.excerpt}&rdquo;
              </p>
            </div>

            {/* Action */}
            {onSelectDocument && (
              <button
                type="button"
                onClick={() => onSelectDocument(res.documentId)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline self-start cursor-pointer"
              >
                <span>View Document</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
