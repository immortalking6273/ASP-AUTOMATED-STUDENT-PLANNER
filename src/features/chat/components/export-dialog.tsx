"use client";

import * as React from "react";
import { ExportFormat } from "../types";
import { Download, FileText, Code, AlignLeft, X } from "lucide-react";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

export function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in-0">
      <div
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">Export Conversation Log</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Download your conversation transcript including assistant answers and document citations.
        </p>

        {/* Format Options */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onExport("markdown");
              onClose();
            }}
            className="flex items-center justify-between w-full rounded-2xl border border-border p-3 text-left hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs font-bold text-foreground">Markdown (.md)</div>
                <div className="text-[11px] text-muted-foreground">Best for Obsidian, note editors, and formatted docs</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => {
              onExport("txt");
              onClose();
            }}
            className="flex items-center justify-between w-full rounded-2xl border border-border p-3 text-left hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <AlignLeft className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-foreground">Plain Text (.txt)</div>
                <div className="text-[11px] text-muted-foreground">Simple readable transcript</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => {
              onExport("json");
              onClose();
            }}
            className="flex items-center justify-between w-full rounded-2xl border border-border p-3 text-left hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-indigo-500" />
              <div>
                <div className="text-xs font-bold text-foreground">JSON Data (.json)</div>
                <div className="text-[11px] text-muted-foreground">Structured JSON data for developer backups</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
