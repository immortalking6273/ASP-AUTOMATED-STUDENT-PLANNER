"use client";

import * as React from "react";
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { UploadedDocumentRow } from "@/types/database";

interface RetryProcessingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  document: UploadedDocumentRow | null;
}

export function RetryProcessingDialog({
  isOpen,
  onClose,
  onConfirm,
  document,
}: RetryProcessingDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !document) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl border border-border space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Re-index Document Knowledge</h3>
            <p className="text-xs text-muted-foreground">
              {document.display_name || document.original_name}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Re-processing will clear existing chunks, re-extract text structure, and generate fresh semantic embeddings for Retrieval-Augmented Generation (RAG).
        </p>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span>Start Reprocessing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
