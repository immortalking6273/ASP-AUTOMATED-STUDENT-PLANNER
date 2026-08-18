"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, HelpCircle } from "lucide-react";

interface ErrorRecoveryPanelProps {
  errorMessage: string;
  onRetry: () => void;
  isProcessing?: boolean;
}

export function ErrorRecoveryPanel({
  errorMessage,
  onRetry,
  isProcessing,
}: ErrorRecoveryPanelProps) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-destructive">Document Processing Failed</h4>
          <p className="text-xs text-muted-foreground font-mono bg-background/80 p-2 rounded-lg border border-border/50 break-all">
            {errorMessage}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground bg-background/40 p-3 rounded-xl border border-border/40">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <HelpCircle className="h-3.5 w-3.5 text-primary" />
          <span>Troubleshooting Recommendations</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Ensure the document file is not password protected or corrupted.</li>
          <li>Check that the PDF or document contains selectable text (not scanned images).</li>
          <li>Verify network connection and retry the pipeline.</li>
        </ul>
      </div>

      <div className="flex justify-end pt-1">
        <button
          onClick={onRetry}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-white hover:bg-destructive/90 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
          <span>Retry Processing Pipeline</span>
        </button>
      </div>
    </div>
  );
}
