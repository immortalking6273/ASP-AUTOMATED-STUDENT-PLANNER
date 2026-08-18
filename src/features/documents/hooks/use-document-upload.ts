"use client";

import * as React from "react";
import { UploadQueueItem } from "../types";
import { validateDocumentFile } from "../utils/validation";
import { DocumentsService } from "@/services/db/documents-service";
import { toast } from "@/components/ui/toast";

// Extend UploadQueueItem status to include "processing" for the pipeline phase
export type ExtendedUploadStatus = "pending" | "uploading" | "processing" | "completed" | "error";

export interface ExtendedQueueItem extends Omit<UploadQueueItem, "status"> {
  status: ExtendedUploadStatus;
  documentId?: string; // set after upload so pipeline can poll status
}

export function useDocumentUpload(workspaceId: string, onUploadComplete?: () => void) {
  const [queue, setQueue] = React.useState<ExtendedQueueItem[]>([]);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);

  const updateItem = (id: string, patch: Partial<ExtendedQueueItem>) => {
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const processFile = async (file: File) => {
    const validation = validateDocumentFile(file);
    const itemId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    if (!validation.isValid) {
      setQueue((prev) => [
        ...prev,
        {
          id: itemId,
          file,
          progress: 0,
          status: "error",
          errorMessage: validation.error,
        },
      ]);
      toast.error(`Upload rejected: ${file.name}`, validation.error);
      return;
    }

    // Add to queue in uploading status
    const newItem: ExtendedQueueItem = {
      id: itemId,
      file,
      progress: 5,
      status: "uploading",
    };

    setQueue((prev) => [...prev, newItem]);
    setIsUploading(true);

    try {
      // Simulate progressive upload progress (storage API doesn't expose XHR progress)
      const progressSteps = [15, 30, 50, 70];
      for (const pct of progressSteps) {
        await new Promise<void>((r) => setTimeout(r, 200));
        updateItem(itemId, { progress: pct });
      }

      // ── Stage 1: Upload to Supabase Storage + DB ────────────────────────
      const uploadedDoc = await DocumentsService.uploadDocumentFile(workspaceId, file);

      // Upload done: 100%
      updateItem(itemId, {
        progress: 100,
        status: "processing",  // Move to pipeline phase, NOT "completed"
        documentId: uploadedDoc?.id,
      });

      // Notify parent to refresh document list
      onUploadComplete?.();

      // ── Stage 2: Trigger AI Processing Pipeline ─────────────────────────
      if (uploadedDoc?.id) {
        console.log(`[Pipeline Trigger] Triggering AI pipeline for document ${uploadedDoc.id}`);

        try {
          const res = await fetch("/api/documents/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId: uploadedDoc.id }),
          });
          const data = await res.json();

          if (data.success) {
            console.log(`[Pipeline Complete] Document ${uploadedDoc.id} indexed successfully`);
            updateItem(itemId, { status: "completed" });
            toast.success(`${file.name} is ready for AI Search`);
          } else {
            console.warn(`[Pipeline Warning] Document ${uploadedDoc.id}:`, data.error);
            updateItem(itemId, {
              status: "error",
              errorMessage: data.error || "Processing failed",
            });
            toast.error(`Processing failed: ${file.name}`, data.error);
          }
        } catch (pipelineErr: any) {
          console.error("[Pipeline Error]", pipelineErr);
          updateItem(itemId, {
            status: "error",
            errorMessage: pipelineErr.message || "Pipeline error",
          });
        }
      }

      // Final refresh after pipeline
      onUploadComplete?.();
    } catch (err: any) {
      console.error("Upload error:", err);
      updateItem(itemId, {
        status: "error",
        errorMessage: err.message || "Failed to upload file.",
      });
      toast.error(`Failed to upload ${file.name}`, err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((f) => processFile(f));
  };

  const cancelUpload = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const clearCompleted = () => {
    setQueue((prev) =>
      prev.filter((q) => q.status === "uploading" || q.status === "processing")
    );
  };

  return {
    queue: queue as UploadQueueItem[], // cast to satisfy existing prop types
    isUploading,
    uploadFiles,
    cancelUpload,
    clearCompleted,
  };
}
