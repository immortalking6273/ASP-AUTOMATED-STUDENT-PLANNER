"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useDocumentUpload } from "@/features/documents/hooks/use-document-upload";
import {
  DocumentToolbar,
  UploadArea,
  UploadQueue,
  DocumentGrid,
  DocumentList,
  DocumentDetailsPanel,
  RenameDocumentModal,
  MoveDocumentModal,
  DeleteDocumentDialog,
  EmptyDocumentState,
  LoadingDocumentState,
  ProcessingQueue,
} from "@/features/documents";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);

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
    isLoading,
    error,
    categoryTab,
    searchQuery,
    selectedTag,
    sortBy,
    viewMode,
    activeDocument,
    renamingDocument,
    movingDocument,
    deletingDocument,
    isUploadModalOpen,
    setCategoryTab,
    setSearchQuery,
    setSelectedTag,
    setSortBy,
    setViewMode,
    setActiveDocument,
    setRenamingDocument,
    setMovingDocument,
    setDeletingDocument,
    setIsUploadModalOpen,
    handleToggleFavorite,
    handleToggleArchive,
    handleDelete,
    handleUpdate,
    handleMove,
    refresh,
  } = useDocuments(selectedWorkspaceId || undefined);

  const { queue, uploadFiles, cancelUpload, clearCompleted } = useDocumentUpload(
    selectedWorkspaceId || "",
    refresh
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Document Library
          </h1>
          <p className="text-xs text-muted-foreground">
            Upload, organize, and manage your course materials, PDF slides, notes, and research papers.
          </p>
        </div>

        {/* Workspace Selector */}
        {workspaces.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
            <select
              value={selectedWorkspaceId || ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary"
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

      {/* Active Pipeline Queue */}
      <ProcessingQueue documents={documents} onSelectDocument={(doc) => setActiveDocument(doc)} />

      {/* Upload Dropzone Drop Area */}
      <UploadArea onFilesSelected={(files) => uploadFiles(files)} />

      {/* Toolbar (Search, Filter Tabs, Sort, View Mode, Upload Button) */}
      <DocumentToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={categoryTab}
        onTabChange={setCategoryTab}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Grid/List Content */}
      {isLoading ? (
        <LoadingDocumentState />
      ) : documents.length === 0 ? (
        <EmptyDocumentState onUploadClick={() => setIsUploadModalOpen(true)} />
      ) : viewMode === "grid" ? (
        <DocumentGrid
          documents={documents}
          onSelect={(doc) => setActiveDocument(doc)}
          onToggleFavorite={handleToggleFavorite}
          onToggleArchive={handleToggleArchive}
          onDelete={(doc) => setDeletingDocument(doc)}
          onRename={(doc) => setRenamingDocument(doc)}
        />
      ) : (
        <DocumentList
          documents={documents}
          onSelect={(doc) => setActiveDocument(doc)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={(doc) => setDeletingDocument(doc)}
          onRename={(doc) => setRenamingDocument(doc)}
        />
      )}

      {/* Upload Progress Drawer Queue */}
      <UploadQueue queue={queue} onCancel={cancelUpload} onClearCompleted={clearCompleted} />

      {/* Slide-over Inspection Panel */}
      <DocumentDetailsPanel
        document={activeDocument}
        onClose={() => setActiveDocument(null)}
        onRefresh={refresh}
      />

      {/* Modals & Dialogs */}
      <RenameDocumentModal
        isOpen={!!renamingDocument}
        onClose={() => setRenamingDocument(null)}
        onSubmit={async (id, newName) => {
          await handleUpdate(id, { display_name: newName });
        }}
        document={renamingDocument}
      />

      <MoveDocumentModal
        isOpen={!!movingDocument}
        onClose={() => setMovingDocument(null)}
        onMove={handleMove}
        document={movingDocument}
      />

      <DeleteDocumentDialog
        isOpen={!!deletingDocument}
        onClose={() => setDeletingDocument(null)}
        onConfirm={async () => {
          if (deletingDocument) await handleDelete(deletingDocument.id);
        }}
        document={deletingDocument}
      />
    </div>
  );
}
