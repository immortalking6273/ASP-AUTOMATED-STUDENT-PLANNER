"use client";

import * as React from "react";
import { CitationItem } from "../types";
import { Bug, ChevronDown, ChevronUp, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetrievalDebugPanelProps {
  citations: CitationItem[];
  question: string;
  threshold?: number;
}

export function RetrievalDebugPanel({
  citations,
  question,
  threshold = 0.25,
}: RetrievalDebugPanelProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!citations || citations.length === 0) {
    return (
      <div className="my-3 overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400 font-mono select-none">
        <div className="flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-500" />
            <span>RAG Debug Panel: 0 Chunks Retrieved</span>
          </div>
          <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">Threshold: {threshold}</span>
        </div>
        <p className="mt-1 opacity-80">
          No document chunks passed threshold ({threshold}). Check if documents are uploaded and processed in this workspace.
        </p>
      </div>
    );
  }

  const highestScore = citations[0]?.similarityScore || 0;

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-indigo-500/40 bg-zinc-950/90 dark:bg-zinc-900/90 text-zinc-200 font-mono text-xs shadow-lg">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-indigo-950/80 px-4 py-2.5 text-left border-b border-indigo-500/30 hover:bg-indigo-900/60 transition-colors"
      >
        <div className="flex items-center gap-2 font-bold text-indigo-300">
          <Bug className="h-4 w-4 text-indigo-400 animate-pulse" />
          <span>Developer RAG Debug Panel ({citations.length} Chunks Matched)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
            Top Score: {(highestScore * 100).toFixed(1)}% ({highestScore})
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-indigo-400" />}
        </div>
      </button>

      {/* Expanded Debug Content */}
      {isOpen && (
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto divide-y divide-zinc-800">
          {citations.map((cit, idx) => {
            const scorePercent = Number((cit.similarityScore * 100).toFixed(1));
            const isHigh = cit.similarityScore >= 0.5;
            const isMedium = cit.similarityScore >= threshold && cit.similarityScore < 0.5;

            return (
              <div key={cit.chunkId || idx} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-bold truncate max-w-[70%]">
                    <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{cit.documentTitle}</span>
                    {cit.heading && <span className="text-zinc-500 font-normal">({cit.heading})</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 font-extrabold text-[10px]",
                        isHigh && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                        isMedium && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                        !isHigh && !isMedium && "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      )}
                    >
                      Score: {cit.similarityScore} ({scorePercent}%)
                    </span>
                  </div>
                </div>

                {/* Chunk Content Snippet */}
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-[11px] text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                  {cit.snippet}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
