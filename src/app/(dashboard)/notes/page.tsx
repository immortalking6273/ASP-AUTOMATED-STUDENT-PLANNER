"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
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

export default function NotesPage() {
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
  } = useNotebooks(selectedWorkspaceId || undefined);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Notes & Notebooks Hub
          </h1>
          <p className="text-xs text-muted-foreground">
            Organize your course knowledge, lectures, and sub-pages in dedicated notebooks.
          </p>
        </div>

        {/* Workspace Selector if multiple exist */}
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

      {/* Toolbar */}
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
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Grid/List */}
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
