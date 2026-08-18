"use client";

/**
 * AIProcessingStatus
 * ------------------
 * Compact status card shown in the AI Readiness section.
 * Drives its overall progress bar from the real backend via usePipelineStatus.
 */

import * as React from "react";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { DocumentStatusBadge } from "./document-status-badge";
import { usePipelineStatus } from "../hooks/use-pipeline-status";
import { UploadedDocumentRow } from "@/types/database";
import { cn } from "@/lib/utils";

interface AIProcessingStatusProps {
  document?: UploadedDocumentRow | null;
  /** Fallback string status for backwards compat */
  status?: string;
  errorMessage?: string | null;
  onRetry?: () => void;
  isProcessing?: boolean;
}

export function AIProcessingStatus({
  document,
  status,
  errorMessage,
  onRetry,
  isProcessing,
}: AIProcessingStatusProps) {
  const documentId = document?.id ?? null;
  const initialStatus = document?.processing_status ?? status ?? "uploaded";

  const pipeline = usePipelineStatus(documentId, initialStatus);

  const { overallPercent, isComplete, isFailed, backendStatus } = pipeline;

  // Current stage label
  const activeStage = pipeline.stages.find((s) => s.state === "active");
  const currentMessage = activeStage?.activeMessage ?? (isComplete ? "Document is ready for AI Search." : "Queued for processing");

  const displayStatus = backendStatus || status || "uploaded";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : isFailed
            ? <AlertCircle className="h-4 w-4 text-destructive" />
            : <Sparkles className={cn("h-4 w-4 text-primary", !isComplete && !isFailed && "animate-pulse")} />}
          <span className="text-xs font-semibold text-foreground">AI Knowledge Pipeline</span>
        </div>
        <DocumentStatusBadge status={displayStatus} />
      </div>

      {/* Current stage message */}
      <p className={cn(
        "text-[11px]",
        isComplete ? "text-emerald-600 dark:text-emerald-400 font-medium" :
        isFailed   ? "text-destructive" :
                     "text-muted-foreground"
      )}>
        {isComplete
          ? "Document is now ready for AI Search."
          : isFailed
          ? (pipeline.errorMessage || errorMessage || "Processing failed.")
          : currentMessage}
      </p>

      {/* Overall progress bar */}
      {!isFailed && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Progress</span>
            <span className={cn(
              "font-bold tabular-nums",
              isComplete ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
            )}>
              {overallPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            {isComplete ? (
              <div className="h-full w-full rounded-full bg-emerald-500 success-glow progress-bar-transition" />
            ) : (
              <div
                className="h-full rounded-full pipeline-shimmer progress-bar-transition"
                style={{ width: `${overallPercent}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Error + retry */}
      {isFailed && (pipeline.errorMessage || errorMessage) && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{pipeline.errorMessage || errorMessage}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1 text-xs font-semibold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isProcessing && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>Retry Processing</span>
            </button>
          )}
        </div>
      )}

      {/* Live indicator */}
      {pipeline.isPolling && !isComplete && !isFailed && (
        <div className="flex items-center gap-1.5 text-[10px] text-primary/60">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>Updating live…</span>
        </div>
      )}
    </div>
  );
}
