"use client";

import * as React from "react";
import { Sparkles, CheckCircle2, Clock, RotateCcw, AlertTriangle, Layers } from "lucide-react";
import { DocumentStatusBadge } from "./document-status-badge";
import { UploadedDocumentRow } from "@/types/database";

interface AIReadinessCardProps {
  document: UploadedDocumentRow | null;
  onProcess?: () => void;
  onReprocess?: () => void;
  isProcessing?: boolean;
}

export function AIReadinessCard({
  document,
  onProcess,
  onReprocess,
  isProcessing,
}: AIReadinessCardProps) {
  if (!document) return null;

  const status = (document.processing_status || "uploaded").toLowerCase();
  const isReady = status === "ready";
  const isFailed = status === "failed";
  const totalChunks = document.total_chunks || 0;
  const estimatedTokens = document.estimated_tokens || 0;
  const processedAt = document.processed_at
    ? new Date(document.processed_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">AI Readiness & Knowledge Index</h3>
            <p className="text-[11px] text-muted-foreground">Retrieval-Augmented Generation (RAG) Preparedness</p>
          </div>
        </div>
        <DocumentStatusBadge status={status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="rounded-xl border border-border/50 bg-background/60 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
            <Layers className="h-3 w-3 text-indigo-500" />
            <span>Chunk Count</span>
          </div>
          <div className="text-base font-bold text-foreground">{totalChunks}</div>
        </div>

        <div className="rounded-xl border border-border/50 bg-background/60 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span>Tokens Indexed</span>
          </div>
          <div className="text-base font-bold text-foreground">
            {estimatedTokens > 1000 ? `${(estimatedTokens / 1000).toFixed(1)}k` : estimatedTokens}
          </div>
        </div>
      </div>

      {/* Index Time & Status Message */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Last Indexed: {processedAt || "Not yet processed"}</span>
        </div>

        {isReady && (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Prepared
          </span>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {!isReady && !isFailed && status === "uploaded" && (
          <button
            onClick={onProcess}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Process Document for AI</span>
          </button>
        )}

        {(isReady || isFailed) && (
          <button
            onClick={onReprocess}
            disabled={isProcessing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{isFailed ? "Retry Failed Processing" : "Re-index Knowledge"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
