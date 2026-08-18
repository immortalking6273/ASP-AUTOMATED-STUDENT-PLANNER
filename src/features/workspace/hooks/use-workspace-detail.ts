"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService, WorkspaceStats } from "@/services/db/workspaces-service";
import { WorkspaceRow } from "@/types/database";
import { toast } from "@/components/ui/toast";

export function useWorkspaceDetail(workspaceId: string) {
  const { user } = useAuth();
  const [workspace, setWorkspace] = React.useState<WorkspaceRow | null>(null);
  const [stats, setStats] = React.useState<WorkspaceStats>({
    notebookCount: 0,
    taskCount: 0,
    documentCount: 0,
    pageCount: 0,
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWorkspace = React.useCallback(async () => {
    if (!user || !workspaceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await WorkspacesService.getWorkspaceById(workspaceId, user.id);
      if (!data) {
        setError("Workspace not found or permission denied.");
        return;
      }
      setWorkspace(data);

      const statsData = await WorkspacesService.getWorkspaceStats(workspaceId);
      setStats(statsData);
    } catch (err: any) {
      console.error("Error loading workspace detail:", err);
      setError(err?.message || "Failed to load workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [user, workspaceId]);

  React.useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  // Rename workspace
  const handleRename = async (newTitle: string) => {
    if (!workspace) return;
    try {
      const updated = await WorkspacesService.updateWorkspace(workspace.id, {
        title: newTitle,
      });
      setWorkspace(updated);
      toast.success("Workspace Renamed", `Updated title to "${newTitle}".`);
    } catch (err: any) {
      toast.error("Failed to Rename", err.message);
    }
  };

  // Update description
  const handleUpdateDescription = async (newDesc: string) => {
    if (!workspace) return;
    try {
      const updated = await WorkspacesService.updateWorkspace(workspace.id, {
        description: newDesc,
      });
      setWorkspace(updated);
      toast.success("Description Updated", "Saved workspace description.");
    } catch (err: any) {
      toast.error("Failed to Update Description", err.message);
    }
  };

  // Update icon & color
  const handleUpdateAppearance = async (icon: string, color: string) => {
    if (!workspace) return;
    try {
      const updated = await WorkspacesService.updateWorkspace(workspace.id, {
        icon,
        color,
      });
      setWorkspace(updated);
      toast.success("Appearance Saved", "Updated workspace icon and color.");
    } catch (err: any) {
      toast.error("Failed to Update Appearance", err.message);
    }
  };

  return {
    user,
    workspace,
    stats,
    isLoading,
    error,
    refresh: fetchWorkspace,
    handleRename,
    handleUpdateDescription,
    handleUpdateAppearance,
  };
}
