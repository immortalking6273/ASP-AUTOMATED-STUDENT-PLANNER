"use client";

/**
 * use-pipeline-status
 * -------------------
 * Polls /api/documents/[id]/status every POLL_INTERVAL_MS while a document is
 * actively processing.  Returns derived per-stage state that the timeline UI
 * can render directly — no fake timers, no simulated completion.
 *
 * Stage order the BACKEND uses:
 *   uploaded  →  processing  →  chunking  →  embedding  →  ready | failed
 *
 * We expand this into a richer display model:
 *   UPLOAD     → UPLOADED  →  EXTRACTING  →  EXTRACTED
 *   → CHUNKING →  CHUNKED  →  EMBEDDING   →  EMBEDDED  →  READY
 */

import * as React from "react";

// ── Public stage keys ──────────────────────────────────────────────────────────
export type StageKey =
  | "upload"
  | "uploaded"
  | "extracting"
  | "extracted"
  | "chunking"
  | "chunked"
  | "embedding"
  | "embedded"
  | "ready";

export type StageState = "waiting" | "active" | "completed" | "failed";

export interface PipelineStage {
  key: StageKey;
  label: string;
  description: string;
  activeMessage: string;
  completedMessage: string;
  state: StageState;
  progressPercent: number; // 0-100, meaningful only when state === "active"
}

export interface PipelineStatusResult {
  stages: PipelineStage[];
  overallPercent: number;        // 0-100 across all stages
  currentStageIndex: number;     // index into stages[]
  backendStatus: string;
  isComplete: boolean;
  isFailed: boolean;
  errorMessage: string | null;
  totalChunks: number;
  estimatedTokens: number;
  isPolling: boolean;
}

// ── Stage meta-data (static) ──────────────────────────────────────────────────
const STAGE_META: Omit<PipelineStage, "state" | "progressPercent">[] = [
  {
    key: "upload",
    label: "Uploading",
    description: "Transferring file to secure storage",
    activeMessage: "Uploading document...",
    completedMessage: "Upload complete.",
  },
  {
    key: "uploaded",
    label: "Uploaded",
    description: "File stored securely in cloud",
    activeMessage: "Finalizing upload...",
    completedMessage: "File stored securely.",
  },
  {
    key: "extracting",
    label: "Extracting Text",
    description: "Parsing document structure & content",
    activeMessage: "Extracting text...",
    completedMessage: "Text extraction complete.",
  },
  {
    key: "extracted",
    label: "Extracted",
    description: "Text & structure successfully parsed",
    activeMessage: "Finalizing extraction...",
    completedMessage: "Text extraction complete.",
  },
  {
    key: "chunking",
    label: "Chunking",
    description: "Splitting into semantic segments",
    activeMessage: "Splitting document into semantic chunks...",
    completedMessage: "Chunk generation complete.",
  },
  {
    key: "chunked",
    label: "Chunked",
    description: "Semantic segments ready",
    activeMessage: "Finalizing chunks...",
    completedMessage: "Document successfully chunked.",
  },
  {
    key: "embedding",
    label: "Generating Embeddings",
    description: "Creating vector representations for AI",
    activeMessage: "Generating vector embeddings...",
    completedMessage: "Embeddings successfully generated.",
  },
  {
    key: "embedded",
    label: "Embeddings Generated",
    description: "Vectors indexed for retrieval",
    activeMessage: "Finalizing embeddings...",
    completedMessage: "Vector index complete.",
  },
  {
    key: "ready",
    label: "Ready for AI Search",
    description: "Document available for RAG queries",
    activeMessage: "Finalizing knowledge index...",
    completedMessage: "Document is now ready for AI Search.",
  },
];

// Map backend status → which display-stage is currently "active"
// The stages BEFORE the active one are "completed"; AFTER are "waiting".
const BACKEND_TO_ACTIVE_IDX: Record<string, number> = {
  uploaded: 1,    // "uploaded" stage is active
  processing: 2,  // extracting
  chunking: 4,    // chunking stage active
  embedding: 6,   // embedding stage active
  ready: 8,       // all done
  failed: -1,     // special handling
};

const POLL_INTERVAL_MS = 2500;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePipelineStatus(
  documentId: string | null,
  initialStatus: string = "uploaded",
  uploadProgressPercent: number = 100 // 0-100, provided externally during upload
): PipelineStatusResult {
  const [backendStatus, setBackendStatus] = React.useState(initialStatus);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [totalChunks, setTotalChunks] = React.useState(0);
  const [estimatedTokens, setEstimatedTokens] = React.useState(0);
  const [isPolling, setIsPolling] = React.useState(false);

  // Simulated "within-stage" progress counter for the active stage (0-99)
  // so the bar animates smoothly between actual backend status transitions.
  const [innerProgress, setInnerProgress] = React.useState(0);
  const innerTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const shouldPoll =
    !!documentId &&
    !["ready", "failed"].includes(backendStatus);

  // ── Inner animation (ticks 0→90 while stage is active) ──────────────────
  React.useEffect(() => {
    if (!shouldPoll) {
      setInnerProgress(backendStatus === "ready" ? 100 : 0);
      return;
    }
    setInnerProgress(0);
    let val = 0;
    innerTimerRef.current = setInterval(() => {
      val = Math.min(val + (Math.random() * 4 + 1), 90);
      setInnerProgress(val);
    }, 600);
    return () => {
      if (innerTimerRef.current) clearInterval(innerTimerRef.current);
    };
  }, [backendStatus, shouldPoll]);

  // ── Backend polling ───────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!shouldPoll) return;

    let cancelled = false;
    setIsPolling(true);

    const poll = async () => {
      try {
        const res = await fetch(`/api/documents/${documentId}/status`);
        if (!res.ok || cancelled) return;
        const data = await res.json();

        if (!cancelled) {
          setBackendStatus(data.status || "uploaded");
          setErrorMessage(data.errorMessage || null);
          setTotalChunks(data.totalChunks || 0);
          setEstimatedTokens(data.estimatedTokens || 0);
        }
      } catch {
        // Network hiccup — keep polling
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [documentId, shouldPoll]);

  // ── Derive stage states ──────────────────────────────────────────────────
  const stages = React.useMemo((): PipelineStage[] => {
    const norm = backendStatus.toLowerCase();
    const isFailed = norm === "failed";

    // Determine which stage index is "active"
    let activeIdx = BACKEND_TO_ACTIVE_IDX[norm] ?? 1;

    return STAGE_META.map((meta, idx) => {
      let state: StageState;
      let progressPercent = 0;

      if (idx === 0) {
        // Upload stage: driven by external uploadProgressPercent
        state = uploadProgressPercent >= 100 ? "completed" : "active";
        progressPercent = uploadProgressPercent;
      } else if (isFailed) {
        // Failed: everything up to active is complete, active is failed, rest waiting
        if (idx < activeIdx) state = "completed";
        else if (idx === activeIdx) state = "failed";
        else state = "waiting";
        progressPercent = 0;
      } else if (norm === "ready") {
        state = "completed";
        progressPercent = 100;
      } else {
        if (idx < activeIdx) {
          state = "completed";
          progressPercent = 100;
        } else if (idx === activeIdx) {
          state = "active";
          progressPercent = Math.round(innerProgress);
        } else {
          state = "waiting";
          progressPercent = 0;
        }
      }

      return { ...meta, state, progressPercent };
    });
  }, [backendStatus, innerProgress, uploadProgressPercent]);

  // Overall progress: weight each stage equally
  const overallPercent = React.useMemo(() => {
    if (backendStatus === "ready") return 100;
    if (backendStatus === "failed") return 0;
    const total = stages.length;
    const completed = stages.filter((s) => s.state === "completed").length;
    const active = stages.find((s) => s.state === "active");
    const activeContrib = active ? (active.progressPercent / 100) * (1 / total) : 0;
    return Math.round(((completed / total) + activeContrib) * 100);
  }, [stages, backendStatus]);

  const currentStageIndex = stages.findIndex((s) => s.state === "active" || s.state === "failed");

  return {
    stages,
    overallPercent,
    currentStageIndex,
    backendStatus,
    isComplete: backendStatus === "ready",
    isFailed: backendStatus === "failed",
    errorMessage,
    totalChunks,
    estimatedTokens,
    isPolling,
  };
}
