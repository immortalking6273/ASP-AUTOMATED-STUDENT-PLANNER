"use client";

import * as React from "react";
import { NotebooksService, NotebookStats } from "@/services/db/notebooks-service";
import { PagesService } from "@/services/db/pages-service";
import { NotebookRow, PageRow } from "@/types/database";

export function useNotebookDetail(notebookId: string, workspaceId?: string) {
  const [notebook, setNotebook] = React.useState<NotebookRow | null>(null);
  const [stats, setStats] = React.useState<NotebookStats>({ pageCount: 0, lastUpdated: null });
  const [recentPages, setRecentPages] = React.useState<PageRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDetail = React.useCallback(async () => {
    if (!notebookId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [nb, nbStats, pages] = await Promise.all([
        NotebooksService.getNotebookById(notebookId, workspaceId),
        NotebooksService.getNotebookStats(notebookId),
        PagesService.getPagesByNotebook(notebookId, { isArchived: false }),
      ]);

      if (!nb) {
        setError("Notebook not found or access denied.");
      } else {
        setNotebook(nb);
        setStats(nbStats);
        // Sort recent pages by updated_at descending
        const sorted = [...pages].sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setRecentPages(sorted.slice(0, 5));
      }
    } catch (err: any) {
      console.error("Error loading notebook details:", err);
      setError(err?.message || "Failed to load notebook.");
    } finally {
      setIsLoading(false);
    }
  }, [notebookId, workspaceId]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    notebook,
    stats,
    recentPages,
    isLoading,
    error,
    refresh: fetchDetail,
  };
}
