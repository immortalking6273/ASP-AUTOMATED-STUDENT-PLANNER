"use client";

import * as React from "react";
import { FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyDocumentStateProps {
  onUploadClick: () => void;
}

export function EmptyDocumentState({ onUploadClick }: EmptyDocumentStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center space-y-4 my-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto shadow-xs">
        <FileText className="h-8 w-8" />
      </div>
      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-foreground">No documents found</h3>
        <p className="text-xs text-muted-foreground">
          Upload PDF lecture slides, Word documents, Markdown notes, or images to build your study library.
        </p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onUploadClick}
        leftIcon={<UploadCloud className="h-4 w-4" />}
        className="rounded-2xl text-xs font-semibold shadow-xs"
      >
        Upload Your First Document
      </Button>
    </div>
  );
}
