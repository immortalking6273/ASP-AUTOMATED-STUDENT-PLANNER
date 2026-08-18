"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import {
  useKnowledgeBase,
  KnowledgeHeader,
  KnowledgeStatsCard,
  ChunkExplorerModal,
  KnowledgeSearchResults,
  KnowledgeDocument,
} from "@/features/knowledge-base";
import { DocumentGrid, UploadArea } from "@/features/documents";
import { useDocumentUpload } from "@/features/documents/hooks/use-document-upload";
import { Database, FileText, Layers, RefreshCw, Upload, CheckCircle2, AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);

  // Fetch workspaces for current user
  React.useEffect(() => {
    if (user) {
      WorkspacesService.getWorkspaces(user.id).then((res) => {
        setWorkspaces(res.data);
        if (res.data.length > 0) {
          setSelectedWorkspaceId(res.data[0].id);
        }
      });
    }
  }, [user]);

  const {
    documents,
    allDocuments,
    stats,
    isLoading,
    filterTab,
    setFilterTab,
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    hasSearched,
    performSearch,
    clearSearch,
    inspectingDocument,
    chunks,
    isLoadingChunks,
    inspectDocumentChunks,
    closeChunkInspector,
    refresh,
  } = useKnowledgeBase(selectedWorkspaceId);

  const { uploadFiles } = useDocumentUpload(selectedWorkspaceId || "", refresh);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Top Workspace Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {workspaces.length > 1 && (
          <div className="flex items-center gap-2 self-end">
            <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
            <select
              value={selectedWorkspaceId || ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Knowledge Header & Search Bar */}
      <KnowledgeHeader
        filterTab={filterTab}
        onTabChange={setFilterTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={performSearch}
        onClearSearch={clearSearch}
        hasSearched={hasSearched}
        isSearching={isSearching}
      />

      {/* Overview Statistics Cards */}
      <KnowledgeStatsCard stats={stats} />

      {/* Semantic Search Results Panel */}
      {hasSearched && (
        <KnowledgeSearchResults
          results={searchResults}
          onClear={clearSearch}
          onSelectDocument={(docId) => {
            const doc = allDocuments.find((d) => d.id === docId);
            if (doc) inspectDocumentChunks(doc);
          }}
        />
      )}

      {/* Upload Drop Area */}
      <UploadArea onFilesSelected={(files) => uploadFiles(files)} />

      {/* Knowledge Document Library Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-base text-foreground">Indexed Study Documents</h3>
            <span className="text-xs font-semibold text-muted-foreground">({documents.length})</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl border border-border bg-card/60 animate-pulse p-4 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded-md" />
                <div className="h-3 w-1/2 bg-muted/60 rounded-md" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Database className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-extrabold text-base text-foreground">Your knowledge base is empty</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload study materials, lecture PDFs, or class notes to start building your AI knowledge library.
              </p>
            </div>
          </div>
        ) : (
          /* Documents Grid with Knowledge Inspection Action */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const status = (doc.processing_status || "uploaded").toLowerCase();
              const isReady = status === "ready" || status === "indexed";
              const isFailed = status === "failed";
              const isProcessing = !isReady && !isFailed;

              return (
                <div
                  key={doc.id}
                  className="group relative flex flex-col justify-between p-4 rounded-2xl border border-border bg-card shadow-2xs hover:border-primary/40 transition-all space-y-3"
                >
                  <div className="space-y-2">
                    {/* Status Badge & File Icon */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                          <FileText className="h-4 w-4" />
                        </div>
                        <h4 className="font-extrabold text-xs text-foreground truncate max-w-[160px]">
                          {doc.display_name || doc.original_name}
                        </h4>
                      </div>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full border text-[10px] font-extrabold capitalize shrink-0",
                          isReady && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          isProcessing && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                          isFailed && "border-destructive/30 bg-destructive/10 text-destructive"
                        )}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                      <div>
                        <span className="font-semibold text-foreground">{doc.total_chunks || 0}</span> chunks
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">384-D</span> vector
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inspectDocumentChunks(doc)}
                      leftIcon={<Eye className="h-3.5 w-3.5 text-primary" />}
                      className="rounded-xl text-[11px] font-semibold w-full"
                    >
                      View Knowledge
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chunk Explorer Modal */}
      <ChunkExplorerModal
        isOpen={!!inspectingDocument}
        onClose={closeChunkInspector}
        document={inspectingDocument}
        chunks={chunks}
        isLoading={isLoadingChunks}
      />
    </div>
  );
}
