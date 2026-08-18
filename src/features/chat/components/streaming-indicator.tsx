"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

interface StreamingIndicatorProps {
  text?: string;
}

export function StreamingIndicator({ text = "ASP AI is analyzing your knowledge base..." }: StreamingIndicatorProps) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-primary/30 bg-card p-4 text-xs font-semibold text-foreground shadow-lg ambient-violet-glow animate-fadeIn">
      {/* Orbital Particle Spinner */}
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        
        {/* Particle 1 (Primary Violet #8B5CF6) */}
        <span className="absolute h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_#8B5CF6] animate-orbit-1" />
        {/* Particle 2 (Bright Violet #A855F7) */}
        <span className="absolute h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7] animate-orbit-2" />
        {/* Particle 3 (Deep Violet #7C3AED) */}
        <span className="absolute h-1.5 w-1.5 rounded-full bg-violet-600 shadow-[0_0_8px_#7C3AED] animate-orbit-3" />
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-foreground tracking-wide">{text}</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
