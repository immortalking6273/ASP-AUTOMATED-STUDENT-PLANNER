"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
} from "@/features/documents";

export default function WorkspaceDocumentsPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = React.useState<WorkspaceRow | null>(null);

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
  } = useDocuments(workspaceId);

  const { queue, uploadFiles, cancelUpload, clearCompleted } = useDocumentUpload(workspaceId, refresh);

  React.useEffect(() => {
    if (workspaceId) {
      WorkspacesService.getWorkspaceById(workspaceId, "").then(setWorkspace).catch(() => {});
    }
  }, [workspaceId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Workspace Documents
          </h1>
          <p className="text-xs text-muted-foreground">
            {workspace ? `Course documents for ${workspace.title}` : "Manage workspace documents"}
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <UploadArea onFilesSelected={(files) => uploadFiles(files)} />

      {/* Toolbar */}
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

      {/* Error View */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Grid / List */}
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

      {/* Upload Progress Drawer */}
      <UploadQueue queue={queue} onCancel={cancelUpload} onClearCompleted={clearCompleted} />

      {/* Slide-over Inspection Panel */}
      <DocumentDetailsPanel document={activeDocument} onClose={() => setActiveDocument(null)} />

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
