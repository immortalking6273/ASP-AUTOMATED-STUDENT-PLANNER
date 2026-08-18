"use client";

/**
 * ProcessingTimeline
 * ------------------
 * Vertical 9-stage timeline driven entirely by real backend status.
 * Stages: Upload → Uploaded → Extracting → Extracted → Chunking →
 *         Chunked → Generating Embeddings → Embeddings Generated → Ready
 *
 * Each stage supports four visual states: waiting / active / completed / failed.
 * Progress bars animate between actual backend transitions.
 */

import * as React from "react";
import {
  Check,
  X,
  Loader2,
  Clock,
  Upload,
  ScanText,
  Scissors,
  Cpu,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePipelineStatus, PipelineStage, StageKey } from "../hooks/use-pipeline-status";
import { UploadedDocumentRow } from "@/types/database";

// ── Per-stage icon map ────────────────────────────────────────────────────────
const STAGE_ICONS: Record<StageKey, React.ElementType> = {
  upload: Upload,
  uploaded: Check,
  extracting: ScanText,
  extracted: Check,
  chunking: Scissors,
  chunked: Check,
  embedding: Cpu,
  embedded: Check,
  ready: Sparkles,
};

// ── Sub-components ────────────────────────────────────────────────────────────

interface StageDotProps {
  stage: PipelineStage;
  isLast: boolean;
}

function StageDot({ stage, isLast }: StageDotProps) {
  const Icon = STAGE_ICONS[stage.key];
  const { state } = stage;

  return (
    <div className="relative flex flex-col items-center">
      {/* Connector line above dot (not for first item) */}
      {!isLast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-px overflow-hidden"
             style={{ height: "100%", marginTop: 2 }}>
          <div
            className={cn(
              "w-full transition-all duration-500",
              state === "completed" ? "bg-emerald-400 dark:bg-emerald-500" :
              state === "active"    ? "bg-primary/60" :
                                     "bg-border/60"
            )}
            style={{ height: "100%" }}
          />
        </div>
      )}

      {/* Dot */}
      <div className="relative flex items-center justify-center">
        {/* Ping ring — only when active */}
        {state === "active" && (
          <span
            className="ring-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: "hsl(var(--primary) / 0.35)" }}
          />
        )}

        <div
          className={cn(
            "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300",
            state === "completed" && "bg-emerald-500 shadow-md success-glow",
            state === "active"    && "bg-primary shadow-lg shadow-primary/30",
            state === "failed"    && "bg-destructive shadow-md error-shake",
            state === "waiting"   && "bg-muted border border-border",
          )}
        >
          {state === "completed" && (
            <Check className="check-pop h-3.5 w-3.5 stroke-[3] text-white" />
          )}
          {state === "active" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          )}
          {state === "failed" && (
            <X className="h-3.5 w-3.5 stroke-[3] text-white" />
          )}
          {state === "waiting" && (
            <Clock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

interface StageRowProps {
  stage: PipelineStage;
  index: number;
  onRetry?: () => void;
  isProcessing?: boolean;
}

function StageRow({ stage, index, onRetry, isProcessing }: StageRowProps) {
  const { state, label, activeMessage, completedMessage, description, progressPercent } = stage;

  const isActive = state === "active";
  const isDone   = state === "completed";
  const isFailed = state === "failed";
  const isWait   = state === "waiting";

  return (
    <div
      className="stage-enter flex gap-3"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* ── Icon column ── */}
      <div className="flex flex-col items-center" style={{ width: 28 }}>
        <div className="relative flex items-center justify-center">
          {/* Active ping */}
          {isActive && (
            <span className="ring-ping absolute inline-flex h-7 w-7 rounded-full"
                  style={{ background: "hsl(var(--primary) / 0.25)" }} />
          )}
          <div
            className={cn(
              "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-400",
              isDone   && "bg-emerald-500 shadow-sm",
              isActive && "bg-primary shadow-md shadow-primary/30",
              isFailed && "bg-destructive shadow-sm",
              isWait   && "bg-muted border border-border/60",
            )}
          >
            {isDone   && <Check className="check-pop h-3.5 w-3.5 stroke-[3] text-white" />}
            {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />}
            {isFailed && <X className="h-3.5 w-3.5 stroke-[2.5] text-white" />}
            {isWait   && <Clock className="h-3 w-3 text-muted-foreground" />}
          </div>
        </div>

        {/* Vertical connector */}
        <div className={cn(
          "flex-1 w-px mt-1.5 min-h-[20px]",
          isDone   ? "bg-emerald-400/60 dark:bg-emerald-500/50" :
          isActive ? "bg-primary/30" :
                     "bg-border/50"
        )} />
      </div>

      {/* ── Content column ── */}
      <div className="flex-1 pb-4 min-w-0">
        {/* Title + desc */}
        <div className={cn(
          "text-xs font-semibold leading-tight transition-colors duration-200",
          isDone   && "text-emerald-600 dark:text-emerald-400",
          isActive && "text-primary font-bold",
          isFailed && "text-destructive",
          isWait   && "text-muted-foreground",
        )}>
          {isActive ? activeMessage : isDone ? completedMessage : isFailed ? `❌ ${label} Failed` : label}
        </div>

        <div className={cn(
          "text-[11px] mt-0.5 transition-colors",
          isDone   ? "text-emerald-600/70 dark:text-emerald-500/70" :
          isActive ? "text-primary/70" :
          isFailed ? "text-destructive/70" :
                     "text-muted-foreground/60"
        )}>
          {description}
        </div>

        {/* Active progress bar */}
        {isActive && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-primary/70 font-medium">Processing...</span>
              <span className="text-[10px] font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
              <div
                className="h-full rounded-full pipeline-shimmer progress-bar-transition"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed tick */}
        {isDone && (
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            <Check className="h-3 w-3 stroke-[3]" />
            <span>Complete</span>
          </div>
        )}

        {/* Failed state: retry */}
        {isFailed && (
          <div className="mt-2 flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {isProcessing
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <RotateCcw className="h-3 w-3" />}
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Overall progress header ───────────────────────────────────────────────────
interface OverallProgressProps {
  percent: number;
  isComplete: boolean;
  isFailed: boolean;
  backendStatus: string;
}

function OverallProgressBar({ percent, isComplete, isFailed, backendStatus }: OverallProgressProps) {
  const label = isComplete
    ? "Processing complete"
    : isFailed
    ? "Processing failed"
    : `${backendStatus === "uploaded" ? "Uploading" : "Processing"}... ${percent}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-[11px] font-semibold",
          isComplete ? "text-emerald-600 dark:text-emerald-400" :
          isFailed   ? "text-destructive" :
                       "text-primary"
        )}>
          {label}
        </span>
        <span className={cn(
          "text-[11px] font-bold tabular-nums",
          isComplete ? "text-emerald-600 dark:text-emerald-400" :
          isFailed   ? "text-destructive" : "text-foreground"
        )}>
          {percent}%
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        {isFailed ? (
          <div className="h-full w-full bg-destructive/40 rounded-full" />
        ) : isComplete ? (
          <div className="h-full w-full bg-emerald-500 rounded-full progress-bar-transition success-glow" />
        ) : (
          <div
            className="h-full rounded-full pipeline-shimmer progress-bar-transition"
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
interface ProcessingTimelineProps {
  /** Pass the full document row so we can extract ID + initial status */
  document?: UploadedDocumentRow | null;
  /** Fallback: pass just the status string (for backwards-compat) */
  status?: string;
  /** Current upload progress 0-100 (from useDocumentUpload) */
  uploadProgress?: number;
  onRetry?: () => void;
  isProcessing?: boolean;
}

export function ProcessingTimeline({
  document,
  status,
  uploadProgress = 100,
  onRetry,
  isProcessing,
}: ProcessingTimelineProps) {
  const documentId = document?.id ?? null;
  const initialStatus = document?.processing_status ?? status ?? "uploaded";

  const pipeline = usePipelineStatus(documentId, initialStatus, uploadProgress);

  const { stages, overallPercent, isComplete, isFailed, backendStatus } = pipeline;

  // Hide the "upload" stage row when the upload is already done and
  // we're showing a pre-existing document from the library.
  const visibleStages = uploadProgress >= 100 && stages[0]?.state === "completed"
    ? stages.slice(1)  // drop "upload" row — it's done, collapse into "uploaded"
    : stages;

  const visibleStartIdx = stages.length - visibleStages.length;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            Pipeline Execution Stages
          </h4>
          {pipeline.isPolling && !isComplete && !isFailed && (
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Overall progress bar */}
        <OverallProgressBar
          percent={overallPercent}
          isComplete={isComplete}
          isFailed={isFailed}
          backendStatus={backendStatus}
        />
      </div>

      {/* Stage rows */}
      <div className="px-4 py-3 space-y-0">
        {visibleStages.map((stage, i) => (
          <StageRow
            key={stage.key}
            stage={stage}
            index={i}
            onRetry={stage.state === "failed" ? onRetry : undefined}
            isProcessing={isProcessing}
          />
        ))}
      </div>

      {/* Footer: success/fail summary */}
      {isComplete && (
        <div className="px-4 pb-4 pt-0">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 p-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Document is now ready for AI Search
              </div>
              <div className="text-[11px] text-emerald-600/70 dark:text-emerald-500/70">
                {pipeline.totalChunks > 0
                  ? `${pipeline.totalChunks} chunks · ~${pipeline.estimatedTokens.toLocaleString()} tokens indexed`
                  : "Knowledge index complete"}
              </div>
            </div>
          </div>
        </div>
      )}

      {isFailed && pipeline.errorMessage && (
        <div className="px-4 pb-4 pt-0">
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <X className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
              <div>
                <div className="text-xs font-bold text-destructive">Processing Failed</div>
                <div className="text-[11px] text-destructive/70 mt-0.5 break-words">
                  {pipeline.errorMessage}
                </div>
              </div>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50 mt-1"
              >
                {isProcessing
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <RotateCcw className="h-3.5 w-3.5" />}
                Retry Processing
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
