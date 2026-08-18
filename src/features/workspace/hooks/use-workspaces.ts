"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService, CreateWorkspaceData, UpdateWorkspaceData } from "@/services/db/workspaces-service";
import { WorkspaceRow } from "@/types/database";
import { toast } from "@/components/ui/toast";

export type FilterTab = "all" | "favorites" | "archived";
export type SortOption = "created_desc" | "created_asc" | "title_asc" | "title_desc" | "updated_desc";
export type ViewMode = "grid" | "list";

export function useWorkspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load user-scoped favorites when user changes
  React.useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      try {
        const saved = localStorage.getItem(`asp_favorite_workspaces_${user.id}`);
        setFavorites(saved ? new Set(JSON.parse(saved)) : new Set());
      } catch {
        setFavorites(new Set());
      }
    } else {
      setFavorites(new Set());
    }
  }, [user?.id]);

  // Filters & Controls
  const [filterTab, setFilterTab] = React.useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<SortOption>("created_desc");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [editingWorkspace, setEditingWorkspace] = React.useState<WorkspaceRow | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = React.useState<WorkspaceRow | null>(null);
  const [archivingWorkspace, setArchivingWorkspace] = React.useState<WorkspaceRow | null>(null);

  // Synchronize favorites with user-scoped localStorage
  const toggleFavorite = React.useCallback(
    (workspaceId: string) => {
      if (!user?.id) return;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(workspaceId)) {
          next.delete(workspaceId);
          toast.info("Removed from Favorites", "Workspace removed from your quick access list.");
        } else {
          next.add(workspaceId);
          toast.success("Added to Favorites", "Workspace pinned to your favorites.");
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(`asp_favorite_workspaces_${user.id}`, JSON.stringify(Array.from(next)));
        }
        return next;
      });
    },
    [user?.id]
  );

  // Fetch workspaces
  const fetchWorkspaces = React.useCallback(
    async (isSilent = false) => {
      if (!user) {
        setWorkspaces([]);
        setIsLoading(false);
        return;
      }

      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const isArchived = filterTab === "archived";
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

        const res = await WorkspacesService.getWorkspaces(user.id, {
          isArchived,
          search: searchQuery,
          sortBy: sortField,
          sortOrder,
          pageSize: 100,
        });

        let resultData = res.data;

        // Apply Favorites client-side filter if tab is selected
        if (filterTab === "favorites") {
          resultData = resultData.filter((w) => favorites.has(w.id));
        }

        setWorkspaces(resultData);
      } catch (err: any) {
        console.error("Error loading workspaces:", err);
        setError(err?.message || "Failed to load workspaces.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [user, filterTab, searchQuery, sortBy, favorites]
  );

  React.useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Create workspace handler
  const handleCreate = async (data: CreateWorkspaceData) => {
    if (!user) return;
    try {
      const created = await WorkspacesService.createWorkspace(user.id, data);
      toast.success("Workspace Created!", `"${created.title}" is ready for your notes.`);
      setIsCreateOpen(false);
      fetchWorkspaces(true);
    } catch (err: any) {
      toast.error("Failed to Create Workspace", err.message);
      throw err;
    }
  };

  // Update workspace handler
  const handleUpdate = async (id: string, updates: UpdateWorkspaceData) => {
    try {
      const updated = await WorkspacesService.updateWorkspace(id, updates);
      toast.success("Workspace Updated", `Saved changes to "${updated.title}".`);
      setEditingWorkspace(null);
      fetchWorkspaces(true);
    } catch (err: any) {
      toast.error("Failed to Update Workspace", err.message);
      throw err;
    }
  };

  // Archive workspace handler
  const handleArchive = async (id: string) => {
    try {
      await WorkspacesService.archiveWorkspace(id);
      toast.info("Workspace Archived", "You can restore it anytime from the Archived tab.");
      setArchivingWorkspace(null);
      fetchWorkspaces(true);
    } catch (err: any) {
      toast.error("Failed to Archive Workspace", err.message);
    }
  };

  // Restore workspace handler
  const handleRestore = async (id: string) => {
    try {
      await WorkspacesService.restoreWorkspace(id);
      toast.success("Workspace Restored", "Workspace is back in your active workspaces.");
      fetchWorkspaces(true);
    } catch (err: any) {
      toast.error("Failed to Restore Workspace", err.message);
    }
  };

  // Delete workspace handler
  const handleDelete = async (id: string) => {
    try {
      await WorkspacesService.deleteWorkspace(id);
      toast.success("Workspace Deleted", "The workspace was permanently removed.");
      setDeletingWorkspace(null);
      fetchWorkspaces(true);
    } catch (err: any) {
      toast.error("Failed to Delete Workspace", err.message);
    }
  };

  // Duplicate workspace handler
  const handleDuplicate = async (id: string) => {
    if (!user) return;
    try {
      const duplicated = await WorkspacesService.duplicateWorkspace(id, user.id);
      toast.success("Workspace Duplicated", `Created "${duplicated.title}".`);
      fetchWorkspaces(true);
    } catch (err: any) {
      toast.error("Failed to Duplicate Workspace", err.message);
    }
  };

  return {
    user,
    workspaces,
    favorites,
    isLoading,
    isRefreshing,
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
    refresh: () => fetchWorkspaces(true),
  };
}
