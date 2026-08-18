"use client";

import * as React from "react";
import { PagesService, CreatePageData, UpdatePageData, PageTreeNode } from "@/services/db/pages-service";
import { PageRow } from "@/types/database";
import { toast } from "@/components/ui/toast";

export function usePageTree(notebookId?: string) {
  const [pageTree, setPageTree] = React.useState<PageTreeNode[]>([]);
  const [flatPages, setFlatPages] = React.useState<PageRow[]>([]);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Modal / Dialog States
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false);
  const [createParentId, setCreateParentId] = React.useState<string | null>(null);
  const [editingPage, setEditingPage] = React.useState<PageRow | null>(null);
  const [movingPage, setMovingPage] = React.useState<PageRow | null>(null);
  const [deletingPage, setDeletingPage] = React.useState<PageRow | null>(null);

  // Toggle tree node expand/collapse
  const toggleExpand = React.useCallback((pageId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  }, []);

  const expandAll = React.useCallback(() => {
    const ids = new Set<string>();
    const collectIds = (nodes: PageTreeNode[]) => {
      nodes.forEach((n) => {
        ids.add(n.id);
        if (n.children.length > 0) collectIds(n.children);
      });
    };
    collectIds(pageTree);
    setExpandedIds(ids);
  }, [pageTree]);

  const collapseAll = React.useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Fetch page tree
  const fetchPageTree = React.useCallback(
    async (isSilent = false) => {
      if (!notebookId) {
        setIsLoading(false);
        return;
      }

      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const [tree, flat] = await Promise.all([
          PagesService.getPageTree(notebookId),
          PagesService.getPagesByNotebook(notebookId),
        ]);

        setPageTree(tree);
        setFlatPages(flat);

        // Auto-expand root nodes by default
        setExpandedIds((prev) => {
          if (prev.size === 0 && tree.length > 0) {
            return new Set(tree.map((t) => t.id));
          }
          return prev;
        });
      } catch (err: any) {
        console.error("Error fetching page tree:", err);
        setError(err?.message || "Failed to load pages.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [notebookId]
  );

  React.useEffect(() => {
    fetchPageTree();
  }, [fetchPageTree]);

  // Open creation modal for child page
  const openCreateForParent = (parentId: string | null = null) => {
    setCreateParentId(parentId);
    setIsCreateOpen(true);
    if (parentId) {
      setExpandedIds((prev) => new Set(prev).add(parentId));
    }
  };

  // Create page
  const handleCreate = async (data: CreatePageData) => {
    if (!notebookId) return;
    try {
      const created = await PagesService.createPage(notebookId, {
        ...data,
        parent_page_id: createParentId || data.parent_page_id || null,
      });
      toast.success("Page Created", `"${created.title}" added to notebook.`);
      setIsCreateOpen(false);
      setCreateParentId(null);
      fetchPageTree(true);
      return created;
    } catch (err: any) {
      toast.error("Failed to Create Page", err.message);
      throw err;
    }
  };

  // Update page
  const handleUpdate = async (id: string, updates: UpdatePageData) => {
    try {
      const updated = await PagesService.updatePage(id, updates);
      toast.success("Page Saved", `Saved changes to "${updated.title}".`);
      setEditingPage(null);
      fetchPageTree(true);
      return updated;
    } catch (err: any) {
      toast.error("Failed to Update Page", err.message);
      throw err;
    }
  };

  // Move page to parent
  const handleMove = async (id: string, targetParentPageId: string | null) => {
    try {
      await PagesService.movePage(id, targetParentPageId);
      toast.success("Page Moved", "Hierarchical position updated.");
      setMovingPage(null);
      fetchPageTree(true);
    } catch (err: any) {
      toast.error("Failed to Move Page", err.message);
    }
  };

  // Toggle favorite page
  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await PagesService.toggleFavorite(id, currentStatus);
      toast.success(currentStatus ? "Removed from Favorites" : "Added to Favorites", "Page state updated.");
      fetchPageTree(true);
    } catch (err: any) {
      toast.error("Failed to update favorite", err.message);
    }
  };

  // Archive page
  const handleArchive = async (id: string) => {
    try {
      await PagesService.archivePage(id);
      toast.info("Page Archived", "You can restore it anytime.");
      fetchPageTree(true);
    } catch (err: any) {
      toast.error("Failed to Archive Page", err.message);
    }
  };

  // Restore page
  const handleRestore = async (id: string) => {
    try {
      await PagesService.restorePage(id);
      toast.success("Page Restored", "Page restored to notebook.");
      fetchPageTree(true);
    } catch (err: any) {
      toast.error("Failed to Restore Page", err.message);
    }
  };

  // Delete page
  const handleDelete = async (id: string) => {
    try {
      await PagesService.deletePage(id);
      toast.success("Page Deleted", "Page permanently removed.");
      setDeletingPage(null);
      fetchPageTree(true);
    } catch (err: any) {
      toast.error("Failed to Delete Page", err.message);
    }
  };

  // Duplicate page
  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await PagesService.duplicatePage(id);
      toast.success("Page Duplicated", `Created "${duplicated.title}".`);
      fetchPageTree(true);
    } catch (err: any) {
      toast.error("Failed to Duplicate Page", err.message);
    }
  };

  // Helper to build breadcrumb path for a page ID
  const getBreadcrumbs = React.useCallback(
    (pageId: string): PageRow[] => {
      const breadcrumbs: PageRow[] = [];
      let currentId: string | null = pageId;

      const pageDict = new Map(flatPages.map((p) => [p.id, p]));
      const visited = new Set<string>();

      while (currentId && pageDict.has(currentId) && !visited.has(currentId)) {
        const targetPage = pageDict.get(currentId);
        if (!targetPage) break;
        breadcrumbs.unshift(targetPage);
        currentId = targetPage.parent_page_id;
      }

      return breadcrumbs;
    },
    [flatPages]
  );

  return {
    pageTree,
    flatPages,
    expandedIds,
    isLoading,
    isRefreshing,
    error,
    isCreateOpen,
    createParentId,
    editingPage,
    movingPage,
    deletingPage,
    setIsCreateOpen,
    setEditingPage,
    setMovingPage,
    setDeletingPage,
    toggleExpand,
    expandAll,
    collapseAll,
    openCreateForParent,
    handleCreate,
    handleUpdate,
    handleMove,
    handleToggleFavorite,
    handleArchive,
    handleRestore,
    handleDelete,
    handleDuplicate,
    getBreadcrumbs,
    refresh: () => fetchPageTree(true),
  };
}
