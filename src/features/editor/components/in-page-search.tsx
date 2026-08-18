"use client";

import * as React from "react";
import { SearchMatch } from "../types";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

interface InPageSearchProps {
  isOpen: boolean;
  query: string;
  matches: SearchMatch[];
  activeMatchIndex: number;
  onQueryChange: (q: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function InPageSearch({
  isOpen,
  query,
  matches,
  activeMatchIndex,
  onQueryChange,
  onNext,
  onPrev,
  onClose,
}: InPageSearchProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl p-2 shadow-2xl animate-in fade-in-0 slide-in-from-top-2">
      <div className="flex items-center gap-2 bg-background/80 border border-border rounded-xl px-3 py-1.5 text-xs">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Find in page..."
          autoFocus
          className="w-36 sm:w-48 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
        />
        {matches.length > 0 && (
          <span className="text-[10px] font-bold text-primary shrink-0">
            {activeMatchIndex + 1} of {matches.length}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onPrev}
        disabled={matches.length === 0}
        className="p-1.5 rounded-xl hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={matches.length === 0}
        className="p-1.5 rounded-xl hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
