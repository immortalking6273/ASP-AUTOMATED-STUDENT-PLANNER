"use client";

import * as React from "react";
import { Loader2, CheckCircle2, AlertTriangle, FileText, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type DocumentStatusType =
  | "uploaded"
  | "pending"
  | "processing"
  | "chunking"
  | "embedding"
  | "ready"
  | "failed";

interface DocumentStatusBadgeProps {
  status: DocumentStatusType | string;
  className?: string;
  showIcon?: boolean;
}

export function DocumentStatusBadge({
  status,
  className,
  showIcon = true,
}: DocumentStatusBadgeProps) {
  const normStatus = (status || "uploaded").toLowerCase() as DocumentStatusType;

  switch (normStatus) {
    case "ready":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
            className
          )}
        >
          {showIcon && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          <span>Ready for AI</span>
        </span>
      );

    case "processing":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20",
            className
          )}
        >
          {showIcon && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />}
          <span>Extracting</span>
        </span>
      );

    case "chunking":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
            className
          )}
        >
          {showIcon && <Layers className="h-3.5 w-3.5 animate-pulse text-indigo-500" />}
          <span>Chunking</span>
        </span>
      );

    case "embedding":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20",
            className
          )}
        >
          {showIcon && <Cpu className="h-3.5 w-3.5 animate-pulse text-purple-500" />}
          <span>Embedding</span>
        </span>
      );

    case "failed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive border border-destructive/20",
            className
          )}
        >
          {showIcon && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
          <span>Failed</span>
        </span>
      );

    case "uploaded":
    case "pending":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border/50",
            className
          )}
        >
          {showIcon && <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
          <span>Uploaded</span>
        </span>
      );
  }
}
