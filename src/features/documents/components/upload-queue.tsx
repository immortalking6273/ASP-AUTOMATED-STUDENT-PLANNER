"use client";

/**
 * UploadQueue — bottom-right drawer showing active uploads + pipeline transitions
 *
 * States per item:
 *   uploading  → file transfer in progress (XHR progress bar)
 *   processing → file stored, pipeline running (cycling stage label)
 *   completed  → pipeline done, ready for AI
 *   error      → upload or pipeline failed
 */

import * as React from "react";
import { UploadQueueItem } from "../types";
import { formatBytes } from "../utils/validation";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FileText,
  Cpu,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadQueueProps {
  queue: UploadQueueItem[];
  onCancel: (id: string) => void;
  onClearCompleted: () => void;
}

// Cycling stage labels shown while pipeline runs
const PIPELINE_STAGE_LABELS = [
  "Extracting text...",
  "Chunking document...",
  "Generating embeddings...",
  "Finalizing index...",
];

function useCyclingLabel(active: boolean) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setIdx(0); return; }
    const t = setInterval(() => setIdx((i) => (i + 1) % PIPELINE_STAGE_LABELS.length), 2800);
    return () => clearInterval(t);
  }, [active]);
  return PIPELINE_STAGE_LABELS[idx];
}

function QueueItem({
  item,
  onCancel,
}: {
  item: UploadQueueItem;
  onCancel: (id: string) => void;
}) {
  const isUploading   = item.status === "uploading";
  const isProcessing  = (item as any).status === "processing";
  const isCompleted   = item.status === "completed";
  const isError       = item.status === "error";

  const cyclingLabel = useCyclingLabel(isProcessing);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-background/90 text-xs overflow-hidden transition-all duration-300",
        isCompleted && "border-emerald-300/60 dark:border-emerald-700/40",
        isError     && "border-destructive/40 error-shake",
        isUploading && "border-primary/30",
        isProcessing && "border-indigo-300/40 dark:border-indigo-700/40",
        !isCompleted && !isError && !isUploading && !isProcessing && "border-border/60"
      )}
    >
      {/* File info row */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-2 truncate">
          <div className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
            isCompleted  ? "bg-emerald-100 dark:bg-emerald-900/30" :
            isError      ? "bg-destructive/10" :
            isProcessing ? "bg-indigo-100 dark:bg-indigo-900/30" :
                           "bg-primary/10"
          )}>
            {isCompleted  && <Sparkles className="h-3.5 w-3.5 text-emerald-500" />}
            {isError      && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
            {isProcessing && <Cpu className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />}
            {isUploading  && <UploadCloud className="h-3.5 w-3.5 text-primary" />}
            {!isCompleted && !isError && !isProcessing && !isUploading &&
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <span className="truncate font-semibold text-foreground">{item.file.name}</span>
        </div>

        <button
          type="button"
          onClick={() => onCancel(item.id)}
          className="shrink-0 p-0.5 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Size + status label */}
      <div className="flex items-center justify-between px-3 pb-1 text-[11px] text-muted-foreground">
        <span>{formatBytes(item.file.size)}</span>

        {isUploading && (
          <span className="flex items-center gap-1 font-semibold text-primary">
            <Loader2 className="h-3 w-3 animate-spin" />
            {item.progress}% uploading
          </span>
        )}
        {isProcessing && (
          <span className="flex items-center gap-1 font-semibold text-indigo-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            {cyclingLabel}
          </span>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1 font-bold text-emerald-500">
            <CheckCircle2 className="h-3 w-3" />
            Ready for AI
          </span>
        )}
        {isError && (
          <span className="flex items-center gap-1 font-semibold text-destructive truncate max-w-[160px]">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {item.errorMessage || "Failed"}
          </span>
        )}
      </div>

      {/* Progress bar — only during upload */}
      {isUploading && (
        <div className="mx-3 mb-2.5 h-1.5 rounded-full bg-primary/10 overflow-hidden">
          <div
            className="h-full rounded-full pipeline-shimmer progress-bar-transition"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}

      {/* Pipeline indicator — cycling dots while processing */}
      {isProcessing && (
        <div className="mx-3 mb-2.5 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full bg-indigo-400/40 overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-indigo-500 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success bar — full green */}
      {isCompleted && (
        <div className="mx-3 mb-2.5 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden">
          <div className="h-full w-full rounded-full bg-emerald-500 success-glow" />
        </div>
      )}
    </div>
  );
}

export function UploadQueue({ queue, onCancel, onClearCompleted }: UploadQueueProps) {
  if (queue.length === 0) return null;

  const activeCount  = queue.filter((q) => q.status === "uploading" || (q as any).status === "processing").length;
  const doneCount    = queue.filter((q) => q.status === "completed").length;
  const failedCount  = queue.filter((q) => q.status === "error").length;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-3xl border border-border/80 bg-popover/95 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/50">
        <div className="flex items-center gap-2">
          {activeCount > 0
            ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
            : doneCount > 0
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <AlertCircle className="h-4 w-4 text-destructive" />}
          <h4 className="text-xs font-bold text-foreground">
            {activeCount > 0
              ? `Processing ${activeCount} document${activeCount > 1 ? "s" : ""}…`
              : `${doneCount} complete${failedCount > 0 ? `, ${failedCount} failed` : ""}`}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClearCompleted}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear done
        </button>
      </div>

      {/* Items */}
      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
        {queue.map((item) => (
          <QueueItem key={item.id} item={item} onCancel={onCancel} />
        ))}
      </div>

      {/* Overall mini-progress */}
      {activeCount > 0 && (
        <div className="px-4 py-2.5 border-t border-border/30 bg-card/30">
          <div className="h-1 w-full rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full rounded-full pipeline-shimmer"
              style={{ width: `${((doneCount) / queue.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
