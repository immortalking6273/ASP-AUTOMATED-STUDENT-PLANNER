"use client";

import * as React from "react";
import { KnowledgeStats } from "../types";
import { Files, Layers, CheckCircle2, RefreshCw, AlertTriangle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeStatsCardProps {
  stats: KnowledgeStats;
}

export function KnowledgeStatsCard({ stats }: KnowledgeStatsCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Documents */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Total Documents</span>
          <Files className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{stats.totalDocuments}</span>
          <span className="text-xs text-muted-foreground font-medium">files</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Uploaded course materials</p>
      </div>

      {/* 2. Knowledge Chunks */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Knowledge Chunks</span>
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{stats.totalChunks}</span>
          <span className="text-xs text-muted-foreground font-medium">vector chunks</span>
        </div>
        <p className="text-[11px] text-muted-foreground">384-D Bag-of-Words embeddings</p>
      </div>

      {/* 3. Ready / Indexed */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Indexed & Ready</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{stats.readyCount}</span>
          <span className="text-xs text-muted-foreground font-medium">ready for AI</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Available for hybrid RAG retrieval</p>
      </div>

      {/* 4. Processing */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Processing</span>
          <RefreshCw className={cn("h-4 w-4 text-amber-500", stats.processingCount > 0 && "animate-spin")} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{stats.processingCount}</span>
          <span className="text-xs text-muted-foreground font-medium">in pipeline</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Extracting & embedding text</p>
      </div>

      {/* 5. Failed */}
      <div
        className={cn(
          "rounded-2xl border p-4 space-y-2 shadow-2xs transition-colors",
          stats.failedCount > 0
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-border bg-card text-foreground"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Failed Status</span>
          <AlertTriangle className={cn("h-4 w-4", stats.failedCount > 0 ? "text-destructive" : "text-muted-foreground")} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{stats.failedCount}</span>
          <span className="text-xs text-muted-foreground font-medium">errors</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {stats.failedCount > 0 ? "Requires re-indexing" : "Zero extraction errors"}
        </p>
      </div>
    </div>
  );
}
