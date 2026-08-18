"use client";

import * as React from "react";
import { Bot, Sparkles, BookOpen, Layers, Zap, ShieldCheck } from "lucide-react";
import { SuggestedQuestions } from "./suggested-questions";
import { SourceScope } from "../types";

interface EmptyChatStateProps {
  sourceScope: SourceScope;
  suggestions: string[];
  onSelectSuggestion: (question: string) => void;
}

export function EmptyChatState({
  sourceScope,
  suggestions,
  onSelectSuggestion,
}: EmptyChatStateProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-8 px-4 text-center space-y-6 animate-in fade-in-0">
      {/* Hero Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner border border-primary/20">
        <Bot className="h-8 w-8" />
      </div>

      {/* Hero Title */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
          ASP Academic AI Tutor
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          Ask questions, synthesize notes, and study your materials. AI combines your uploaded documents with general knowledge for clear, comprehensive answers.
        </p>
      </div>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 font-semibold text-secondary-foreground border border-border/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>True Hybrid AI</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 font-semibold text-secondary-foreground border border-border/60">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span>Inline Source Citations</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 px-3 py-1 font-semibold text-secondary-foreground border border-border/60">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Powered by NVIDIA NIM</span>
        </span>
      </div>

      {/* Suggested Starter Prompts */}
      <div className="w-full pt-4">
        <SuggestedQuestions suggestions={suggestions} onSelect={onSelectSuggestion} />
      </div>
    </div>
  );
}
