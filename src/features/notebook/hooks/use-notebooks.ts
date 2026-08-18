"use client";

import * as React from "react";
import { NotebooksService, CreateNotebookData, UpdateNotebookData } from "@/services/db/notebooks-service";
import { NotebookRow } from "@/types/database";
import { NotebookFilterTab, NotebookSortOption, NotebookViewMode } from "../types";
import { toast } from "@/components/ui/toast";

export function useNotebooks(workspaceId?: string) {
  const [notebooks, setNotebooks] = React.useState<NotebookRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & Controls
  const [filterTab, setFilterTab] = React.useState<NotebookFilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<NotebookSortOption>("created_desc");
  const [viewMode, setViewMode] = React.useState<NotebookViewMode>("grid");

  // Modal Dialog States
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [editingNotebook, setEditingNotebook] = React.useState<NotebookRow | null>(null);
  const [deletingNotebook, setDeletingNotebook] = React.useState<NotebookRow | null>(null);
  const [archivingNotebook, setArchivingNotebook] = React.useState<NotebookRow | null>(null);

  const fetchNotebooks = React.useCallback(
    async (isSilent = false) => {
      if (!workspaceId) {
        setIsLoading(false);
        return;
      }

      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const isArchived = filterTab === "archived";
        const isFavorite = filterTab === "favorites" ? true : undefined;
        const isPinned = filterTab === "pinned" ? true : undefined;

        let sortField = "created_at";
        let sortOrder: "asc" | "desc" = "desc";

        if (sortBy === "created_asc") sortOrder = "asc";
        else if (sortBy === "title_asc") {
          sortField = "title";
          sortOrder = "asc";
        } else if (sortBy === "title_desc") {
          sortField = "title";
          sortOrder = "desc";
        } else if (sortBy === "updated_desc") {
          sortField = "updated_at";
          sortOrder = "desc";
        }

        const res = await NotebooksService.getNotebooks(workspaceId, {
          isArchived,
          isFavorite,
          isPinned,
          color: selectedColor || undefined,
          search: searchQuery,
          sortBy: sortField,
          sortOrder,
          pageSize: 100,
        });

        setNotebooks(res.data);
      } catch (err: any) {
        console.error("Error fetching notebooks:", err);
        setError(err?.message || "Failed to load notebooks.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [workspaceId, filterTab, searchQuery, selectedColor, sortBy]
  );

  React.useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  // Create notebook handler
  const handleCreate = async (data: CreateNotebookData) => {
    if (!workspaceId) return;
    try {
      const created = await NotebooksService.createNotebook(workspaceId, data);
      toast.success("Notebook Created!", `"${created.title}" is ready for your notes.`);
      setIsCreateOpen(false);
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to Create Notebook", err.message);
      throw err;
    }
  };

  // Update notebook handler
  const handleUpdate = async (id: string, updates: UpdateNotebookData) => {
    try {
      const updated = await NotebooksService.updateNotebook(id, updates);
      toast.success("Notebook Updated", `Changes saved to "${updated.title}".`);
      setEditingNotebook(null);
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to Update Notebook", err.message);
      throw err;
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await NotebooksService.toggleFavorite(id, currentStatus);
      toast.success(
        currentStatus ? "Removed from Favorites" : "Added to Favorites",
        "Notebook status updated."
      );
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to update favorite status", err.message);
    }
  };

  // Toggle pin status
  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    try {
      await NotebooksService.togglePin(id, currentStatus);
      toast.success(
        currentStatus ? "Unpinned Notebook" : "Pinned Notebook",
        "Notebook pin status updated."
      );
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to update pin status", err.message);
    }
  };

  // Archive notebook
  const handleArchive = async (id: string) => {
    try {
      await NotebooksService.archiveNotebook(id);
      toast.info("Notebook Archived", "You can restore it anytime from the Archived filter.");
      setArchivingNotebook(null);
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to Archive Notebook", err.message);
    }
  };

  // Restore notebook
  const handleRestore = async (id: string) => {
    try {
      await NotebooksService.restoreNotebook(id);
      toast.success("Notebook Restored", "Notebook is back in active notebooks.");
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to Restore Notebook", err.message);
    }
  };

  // Delete notebook permanently
  const handleDelete = async (id: string) => {
    try {
      await NotebooksService.deleteNotebook(id);
      toast.success("Notebook Deleted", "Notebook was permanently removed.");
      setDeletingNotebook(null);
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to Delete Notebook", err.message);
    }
  };

  // Duplicate notebook
  const handleDuplicate = async (id: string) => {
    if (!workspaceId) return;
    try {
      const duplicated = await NotebooksService.duplicateNotebook(id, workspaceId);
      toast.success("Notebook Duplicated", `Created "${duplicated.title}".`);
      fetchNotebooks(true);
    } catch (err: any) {
      toast.error("Failed to Duplicate Notebook", err.message);
    }
  };

  return {
    notebooks,
    isLoading,
    isRefreshing,
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
    refresh: () => fetchNotebooks(true),
  };
}
