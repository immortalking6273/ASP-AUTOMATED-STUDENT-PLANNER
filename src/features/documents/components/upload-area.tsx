"use client";

import * as React from "react";
import { UploadCloud } from "lucide-react";

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export function UploadArea({ onFilesSelected, isUploading }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 p-8 text-center space-y-3 ${
        isDragOver
          ? "border-primary bg-primary/10 scale-[1.01] shadow-[0_0_35px_-5px_rgba(139,92,246,0.35)]"
          : "border-border bg-card hover:bg-accent/60 hover:border-primary/50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg,.webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl mx-auto shadow-sm transition-transform duration-200 ${
          isDragOver
            ? "bg-primary/20 text-primary scale-110"
            : "bg-primary/10 text-primary border border-primary/20"
        }`}
      >
        <UploadCloud className={`h-7 w-7 ${isDragOver ? "animate-bounce" : ""}`} />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-sm font-extrabold text-foreground">
          Drag & drop course materials or <span className="text-primary hover:underline">browse</span>
        </h3>
        <p className="text-xs text-muted-foreground">
          Supports PDF, Word, PowerPoint, Markdown, Text, and Images (Up to 50MB per file)
        </p>
      </div>
    </div>
  );
}
