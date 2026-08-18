"use client";

import * as React from "react";
import { Cpu, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { DocumentStatusBadge } from "./document-status-badge";
import { UploadedDocumentRow } from "@/types/database";

interface ProcessingQueueProps {
  documents: UploadedDocumentRow[];
  onSelectDocument?: (doc: UploadedDocumentRow) => void;
}

export function ProcessingQueue({
  documents,
  onSelectDocument,
}: ProcessingQueueProps) {
  const activeJobs = documents.filter((d) =>
    ["processing", "chunking", "embedding"].includes((d.processing_status || "").toLowerCase())
  );

  if (activeJobs.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold text-foreground">Active Background Pipeline Queue</span>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
          {activeJobs.length} Processing
        </span>
      </div>

      <div className="space-y-2">
        {activeJobs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument?.(doc)}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-2.5 hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">
                {doc.display_name || doc.original_name}
              </span>
            </div>
            <DocumentStatusBadge status={doc.processing_status || "processing"} />
          </div>
        ))}
      </div>
    </div>
  );
}
