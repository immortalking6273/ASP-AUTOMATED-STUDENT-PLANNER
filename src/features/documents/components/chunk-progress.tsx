"use client";

import * as React from "react";
import { Layers, Hash, BookOpen } from "lucide-react";

interface ChunkProgressProps {
  totalChunks: number;
  estimatedTokens: number;
  readingTimeMinutes?: number;
}

export function ChunkProgress({
  totalChunks,
  estimatedTokens,
  readingTimeMinutes = 1,
}: ChunkProgressProps) {
  const avgTokensPerChunk = totalChunks > 0 ? Math.round(estimatedTokens / totalChunks) : 0;

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-xl border border-border/50 bg-secondary/40 p-3">
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] uppercase font-semibold">
          <Layers className="h-3 w-3 text-indigo-500" />
          <span>Chunks</span>
        </div>
        <div className="text-lg font-bold text-foreground mt-0.5">{totalChunks}</div>
        <div className="text-[10px] text-muted-foreground">Indexed Segments</div>
      </div>

      <div className="rounded-xl border border-border/50 bg-secondary/40 p-3">
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] uppercase font-semibold">
          <Hash className="h-3 w-3 text-emerald-500" />
          <span>Tokens</span>
        </div>
        <div className="text-lg font-bold text-foreground mt-0.5">
          {estimatedTokens > 1000 ? `${(estimatedTokens / 1000).toFixed(1)}k` : estimatedTokens}
        </div>
        <div className="text-[10px] text-muted-foreground">~{avgTokensPerChunk}/chunk</div>
      </div>

      <div className="rounded-xl border border-border/50 bg-secondary/40 p-3">
        <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] uppercase font-semibold">
          <BookOpen className="h-3 w-3 text-amber-500" />
          <span>Read Time</span>
        </div>
        <div className="text-lg font-bold text-foreground mt-0.5">{readingTimeMinutes}m</div>
        <div className="text-[10px] text-muted-foreground">Estimated</div>
      </div>
    </div>
  );
}
