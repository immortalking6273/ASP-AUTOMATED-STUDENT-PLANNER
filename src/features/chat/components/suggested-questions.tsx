"use client";

import * as React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface SuggestedQuestionsProps {
  suggestions: string[];
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ suggestions, onSelect }: SuggestedQuestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>Suggested Questions</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(q)}
            className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-card p-3 text-left text-xs font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-2xs group"
          >
            <span className="line-clamp-2">{q}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
          </button>
        ))}
      </div>
    </div>
  );
}
