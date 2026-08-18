"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { useDocumentDetails } from "../hooks/use-document-details";
import { formatBytes } from "../utils/validation";
import { X, Download, Tag, HardDrive, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIReadinessCard } from "./ai-readiness-card";
import { KnowledgeSummary } from "./knowledge-summary";
import { ProcessingTimeline } from "./processing-timeline";
import { ChunkProgress } from "./chunk-progress";
import { RetryProcessingDialog } from "./retry-processing-dialog";
import { ErrorRecoveryPanel } from "./error-recovery-panel";

interface DocumentDetailsPanelProps {
  document: UploadedDocumentRow | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function DocumentDetailsPanel({
  document: doc,
  onClose,
  onRefresh,
}: DocumentDetailsPanelProps) {
  const { downloadUrl, isGeneratingUrl, addTag, removeTag } = useDocumentDetails(doc);
  const [newTagInput, setNewTagInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isRetryDialogOpen, setIsRetryDialogOpen] = React.useState(false);
  const [localDoc, setLocalDoc] = React.useState<UploadedDocumentRow | null>(doc);

  React.useEffect(() => {
    setLocalDoc(doc);
  }, [doc]);

  if (!localDoc) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      addTag(newTagInput.trim());
      setNewTagInput("");
    }
  };

  const handleTriggerProcessing = async () => {
    setIsProcessing(true);
    try {
      const endpoint = localDoc.processing_status === "ready" || localDoc.processing_status === "failed"
        ? `/api/documents/${localDoc.id}/reprocess`
        : "/api/documents/process";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: localDoc.id }),
      });
      const data = await res.json();
      if (data.success) {
        // Fetch refreshed status details
        const statusRes = await fetch(`/api/documents/${localDoc.id}/status`);
        const statusData = await statusRes.json();

        setLocalDoc((prev) =>
          prev
            ? {
                ...prev,
                processing_status: "ready",
                total_chunks: data.totalChunks || statusData.totalChunks || 0,
                estimated_tokens: statusData.estimatedTokens || 0,
                reading_time_minutes: statusData.readingTimeMinutes || 1,
                extracted_metadata: data.metadata || statusData.metadata || null,
                error_message: null,
                processed_at: new Date().toISOString(),
              }
            : null
        );
        onRefresh?.();
      } else {
        setLocalDoc((prev) =>
          prev ? { ...prev, processing_status: "failed", error_message: data.error } : null
        );
      }
    } catch (err: any) {
      setLocalDoc((prev) =>
        prev
          ? {
              ...prev,
              processing_status: "failed",
              error_message: err?.message || "Processing failed",
            }
          : null
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 border-l border-border/80 bg-popover/95 backdrop-blur-2xl p-6 shadow-2xl space-y-6 overflow-y-auto animate-in slide-in-from-right-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <h3 className="text-sm font-bold text-foreground truncate max-w-[220px]">
          {localDoc.display_name || localDoc.original_name}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-xl hover:bg-accent text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main File Info */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>File Size</span>
            <span className="font-bold text-foreground">{formatBytes(localDoc.file_size)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>File Format</span>
            <span className="font-bold text-foreground uppercase">{localDoc.file_type || "pdf"}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>MIME Type</span>
            <span className="font-medium text-foreground truncate max-w-[150px]">{localDoc.mime_type}</span>
          </div>
        </div>

        {/* Download Action */}
        {downloadUrl ? (
          <a href={downloadUrl} download={localDoc.original_name} target="_blank" rel="noreferrer">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              className="w-full rounded-2xl text-xs font-semibold shadow-xs"
            >
              Download File
            </Button>
          </a>
        ) : (
          <Button disabled size="sm" className="w-full rounded-2xl text-xs">
            {isGeneratingUrl ? "Generating Link..." : "Download Unavailable"}
          </Button>
        )}
      </div>

      {/* AI Readiness Card */}
      <AIReadinessCard
        document={localDoc}
        onProcess={handleTriggerProcessing}
        onReprocess={() => setIsRetryDialogOpen(true)}
        isProcessing={isProcessing}
      />

      {/* Error Recovery Panel if Failed */}
      {localDoc.processing_status === "failed" && localDoc.error_message && (
        <ErrorRecoveryPanel
          errorMessage={localDoc.error_message}
          onRetry={handleTriggerProcessing}
          isProcessing={isProcessing}
        />
      )}

      {/* Chunk Metrics */}
      {localDoc.total_chunks ? (
        <ChunkProgress
          totalChunks={localDoc.total_chunks || 0}
          estimatedTokens={localDoc.estimated_tokens || 0}
          readingTimeMinutes={localDoc.reading_time_minutes || 1}
        />
      ) : null}

      {/* Knowledge Metadata Summary */}
      <KnowledgeSummary metadata={localDoc.extracted_metadata as any} />

      {/* Pipeline Timeline — live-polled from backend */}
      <ProcessingTimeline
        document={localDoc}
        onRetry={handleTriggerProcessing}
        isProcessing={isProcessing}
      />

      {/* Tags Section */}
      <div className="space-y-2 border-t border-border/40 pt-4">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" />
            <span>Tags</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {localDoc.tags && localDoc.tags.length > 0 ? (
            localDoc.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-xl"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">No tags added</span>
          )}
        </div>

        {/* Add Tag Form */}
        <form onSubmit={handleAddTag} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Add new tag..."
            className="w-full rounded-xl border border-border bg-background px-3 py-1 text-xs focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="p-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Storage & Metadata Details */}
      <div className="space-y-3 border-t border-border/40 pt-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <HardDrive className="h-3.5 w-3.5 text-cyan-500" />
            <span>Storage Path</span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground break-all bg-accent/40 p-2 rounded-xl border border-border/40">
            {localDoc.storage_path}
          </p>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Uploaded on {new Date(localDoc.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Retry Modal */}
      <RetryProcessingDialog
        isOpen={isRetryDialogOpen}
        onClose={() => setIsRetryDialogOpen(false)}
        onConfirm={handleTriggerProcessing}
        document={localDoc}
      />
    </div>
  );
}
