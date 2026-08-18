"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useNotebooks } from "@/features/notebook/hooks/use-notebooks";
import {
  NotebookToolbar,
  NotebookGrid,
  NotebookList,
  EmptyNotebookState,
  LoadingNotebookState,
  CreateNotebookModal,
  DeleteNotebookDialog,
  ArchiveNotebookDialog,
} from "@/features/notebook";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";

export default function WorkspaceNotebooksPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = React.useState<WorkspaceRow | null>(null);

  const {
    notebooks,
    isLoading,
    error,
    filterTab,
    searchQuery,
    selectedColor,
    sortBy,
    viewMode,
    isCreateOpen,
    editingNotebook,
    deletingNotebook,
    archivingNotebook,
    setFilterTab,
    setSearchQuery,
    setSelectedColor,
    setSortBy,
    setViewMode,
    setIsCreateOpen,
    setEditingNotebook,
    setDeletingNotebook,
    setArchivingNotebook,
    handleCreate,
    handleUpdate,
    handleToggleFavorite,
    handleTogglePin,
    handleArchive,
    handleRestore,
    handleDelete,
    handleDuplicate,
  } = useNotebooks(workspaceId);

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
            Notebook Hub
          </h1>
          <p className="text-xs text-muted-foreground">
            {workspace ? `Organizing knowledge for ${workspace.title}` : "Manage and organize your study notebooks"}
          </p>
        </div>
      </div>

      {/* Toolbar (Search, Filter Tabs, Sort, View Mode, Create Button) */}
      <NotebookToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={filterTab}
        onTabChange={setFilterTab}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* Error View */}
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center justify-between">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingNotebookState />
      ) : notebooks.length === 0 ? (
        <EmptyNotebookState onCreateClick={() => setIsCreateOpen(true)} />
      ) : viewMode === "grid" ? (
        <NotebookGrid
          notebooks={notebooks}
          searchQuery={searchQuery}
          onEdit={(nb) => setEditingNotebook(nb)}
          onDelete={(nb) => setDeletingNotebook(nb)}
          onArchive={(nb) => setArchivingNotebook(nb)}
          onRestore={filterTab === "archived" ? (nb) => handleRestore(nb.id) : undefined}
          onDuplicate={(nb) => handleDuplicate(nb.id)}
          onToggleFavorite={handleToggleFavorite}
          onTogglePin={handleTogglePin}
        />
      ) : (
        <NotebookList
          notebooks={notebooks}
          searchQuery={searchQuery}
          onEdit={(nb) => setEditingNotebook(nb)}
          onDelete={(nb) => setDeletingNotebook(nb)}
          onArchive={(nb) => setArchivingNotebook(nb)}
          onRestore={filterTab === "archived" ? (nb) => handleRestore(nb.id) : undefined}
          onDuplicate={(nb) => handleDuplicate(nb.id)}
          onToggleFavorite={handleToggleFavorite}
          onTogglePin={handleTogglePin}
        />
      )}

      {/* Modals & Dialogs */}
      <CreateNotebookModal
        isOpen={isCreateOpen || !!editingNotebook}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingNotebook(null);
        }}
        onSubmit={async (data) => {
          if (editingNotebook) {
            await handleUpdate(editingNotebook.id, data);
          } else {
            await handleCreate(data);
          }
        }}
        initialData={editingNotebook}
        isEditing={!!editingNotebook}
      />

      <DeleteNotebookDialog
        isOpen={!!deletingNotebook}
        onClose={() => setDeletingNotebook(null)}
        onConfirm={async () => {
          if (deletingNotebook) await handleDelete(deletingNotebook.id);
        }}
        item={deletingNotebook}
        itemType="notebook"
      />

      <ArchiveNotebookDialog
        isOpen={!!archivingNotebook}
        onClose={() => setArchivingNotebook(null)}
        onConfirm={async () => {
          if (archivingNotebook) await handleArchive(archivingNotebook.id);
        }}
        item={archivingNotebook}
        itemType="notebook"
      />
    </div>
  );
}
