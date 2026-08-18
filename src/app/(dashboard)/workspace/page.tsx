"use client";

import * as React from "react";
import {
  useWorkspaces,
  WorkspaceHeader,
  WorkspaceFilters,
  WorkspaceGrid,
  WorkspaceList,
  WorkspaceModal,
  DeleteDialog,
  ArchiveDialog,
  EmptyWorkspace,
  LoadingWorkspace,
} from "@/features/workspace";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspacePage() {
  const {
    workspaces,
    favorites,
    isLoading,
    error,
    filterTab,
    searchQuery,
    sortBy,
    viewMode,
    isCreateOpen,
    editingWorkspace,
    deletingWorkspace,
    archivingWorkspace,
    setFilterTab,
    setSearchQuery,
    setSortBy,
    setViewMode,
    setIsCreateOpen,
    setEditingWorkspace,
    setDeletingWorkspace,
    setArchivingWorkspace,
    toggleFavorite,
    handleCreate,
    handleUpdate,
    handleArchive,
    handleRestore,
    handleDelete,
    handleDuplicate,
    refresh,
  } = useWorkspaces();

  if (isLoading) {
    return <LoadingWorkspace />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="text-base font-bold text-foreground">Failed to Load Workspaces</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh} leftIcon={<RotateCcw className="h-4 w-4" />}>
          Retry Data Fetch
        </Button>
      </div>
    );
  }

  const activeWorkspacesCount = workspaces.filter((w) => !w.is_archived).length;
  const favoriteCount = workspaces.filter((w) => favorites.has(w.id)).length;
  const archivedCount = workspaces.filter((w) => w.is_archived).length;

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Header Section */}
      <WorkspaceHeader
        totalWorkspaces={activeWorkspacesCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateOpen={() => setIsCreateOpen(true)}
      />

      {/* Filter Tabs & Sorting Toolbar */}
      <WorkspaceFilters
        activeTab={filterTab}
        onTabChange={setFilterTab}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCounts={{
          all: activeWorkspacesCount,
          favorites: favoriteCount,
          archived: archivedCount,
        }}
      />

      {/* Workspace Cards Section */}
      {workspaces.length === 0 ? (
        <EmptyWorkspace
          isSearch={Boolean(searchQuery)}
          searchQuery={searchQuery}
          onCreateOpen={() => setIsCreateOpen(true)}
          onClearSearch={() => setSearchQuery("")}
        />
      ) : viewMode === "grid" ? (
        <WorkspaceGrid
          workspaces={workspaces}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onEdit={(ws) => setEditingWorkspace(ws)}
          onDuplicate={handleDuplicate}
          onArchive={(ws) => setArchivingWorkspace(ws)}
          onRestore={handleRestore}
          onDelete={(ws) => setDeletingWorkspace(ws)}
        />
      ) : (
        <WorkspaceList
          workspaces={workspaces}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onEdit={(ws) => setEditingWorkspace(ws)}
          onDuplicate={handleDuplicate}
          onArchive={(ws) => setArchivingWorkspace(ws)}
          onRestore={handleRestore}
          onDelete={(ws) => setDeletingWorkspace(ws)}
        />
      )}

      {/* Modals & Dialogs */}
      <WorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {editingWorkspace && (
        <WorkspaceModal
          isOpen={Boolean(editingWorkspace)}
          workspace={editingWorkspace}
          onClose={() => setEditingWorkspace(null)}
          onSubmit={(data) => handleUpdate(editingWorkspace.id, data)}
        />
      )}

      <DeleteDialog
        isOpen={Boolean(deletingWorkspace)}
        workspace={deletingWorkspace}
        onClose={() => setDeletingWorkspace(null)}
        onConfirmDelete={handleDelete}
        onConfirmArchive={handleArchive}
      />

      <ArchiveDialog
        isOpen={Boolean(archivingWorkspace)}
        workspace={archivingWorkspace}
        onClose={() => setArchivingWorkspace(null)}
        onConfirm={(id) => {
          if (archivingWorkspace?.is_archived) {
            handleRestore(id);
          } else {
            handleArchive(id);
          }
        }}
      />
    </div>
  );
}
