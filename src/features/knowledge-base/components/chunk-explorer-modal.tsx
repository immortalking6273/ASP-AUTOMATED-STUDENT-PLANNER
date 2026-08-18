"use client";

import * as React from "react";
import { X, Layers, CheckCircle2, FileText, Hash, Clock, Cpu, Search } from "lucide-react";
import { KnowledgeDocument, KnowledgeChunkDetail } from "../types";
import { Button } from "@/components/ui/button";

interface ChunkExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: KnowledgeDocument | null;
  chunks: KnowledgeChunkDetail[];
  isLoading: boolean;
}

export function ChunkExplorerModal({
  isOpen,
  onClose,
  document: doc,
  chunks,
  isLoading,
}: ChunkExplorerModalProps) {
  const [filterQuery, setFilterQuery] = React.useState("");

  if (!isOpen || !doc) return null;

  const filteredChunks = chunks.filter((c) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    const contentMatch = c.content.toLowerCase().includes(q);
    const headingMatch = c.heading ? c.heading.toLowerCase().includes(q) : false;
    return contentMatch || headingMatch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-foreground truncate max-w-md">
                {doc.display_name || doc.original_name}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Document Knowledge & Vector Chunks Explorer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Document Knowledge Meta Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-secondary/40 border border-border p-3 rounded-2xl text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">Status</span>
            <span className="font-extrabold text-foreground capitalize">{doc.processing_status || "Ready"}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">Chunks</span>
            <span className="font-extrabold text-foreground">{chunks.length || doc.total_chunks || 0}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">Embedding</span>
            <span className="font-extrabold text-foreground">384 Dimensions</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">Est. Tokens</span>
            <span className="font-extrabold text-foreground">{doc.estimated_tokens || 0}</span>
          </div>
        </div>

        {/* Chunk Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter document chunks by keyword..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Chunks List */}
        <div className="min-h-[220px] max-h-[380px] overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2 text-muted-foreground text-xs">
              <Layers className="h-6 w-6 text-primary animate-bounce" />
              <span>Loading document knowledge chunks...</span>
            </div>
          ) : filteredChunks.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              {filterQuery ? "No chunks match your filter criteria." : "No knowledge chunks available for this document."}
            </div>
          ) : (
            filteredChunks.map((chunk) => (
              <div
                key={chunk.id}
                className="p-4 rounded-2xl border border-border bg-background/80 space-y-2 text-xs shadow-2xs hover:border-primary/30 transition-all"
              >
                {/* Chunk Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg text-[10px]">
                      <Hash className="h-3 w-3" />
                      <span>Chunk {chunk.chunkIndex + 1}</span>
                    </span>

                    {chunk.heading && (
                      <span className="font-bold text-foreground truncate max-w-xs">
                        {chunk.heading}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {chunk.pageNumber && <span>Page {chunk.pageNumber}</span>}
                    <span>• {chunk.characterCount} chars</span>
                    <span>• ~{chunk.tokenEstimate} tokens</span>
                    {chunk.hasEmbedding && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-500 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Vector Ready
                      </span>
                    )}
                  </div>
                </div>

                {/* Sanitized Text Content (Raw float arrays protected & hidden) */}
                <p className="text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {chunk.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
