"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { DocumentsService } from "@/services/db/documents-service";
import { DocumentCategoryTab, DocumentSortOption, DocumentViewMode } from "../types";
import { toast } from "@/components/ui/toast";

export function useDocuments(workspaceId?: string) {
  const [documents, setDocuments] = React.useState<UploadedDocumentRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & State
  const [categoryTab, setCategoryTab] = React.useState<DocumentCategoryTab>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<DocumentSortOption>("created_desc");
  const [viewMode, setViewMode] = React.useState<DocumentViewMode>("grid");

  // Selection & Active Document Modal States
  const [activeDocument, setActiveDocument] = React.useState<UploadedDocumentRow | null>(null);
  const [renamingDocument, setRenamingDocument] = React.useState<UploadedDocumentRow | null>(null);
  const [movingDocument, setMovingDocument] = React.useState<UploadedDocumentRow | null>(null);
  const [deletingDocument, setDeletingDocument] = React.useState<UploadedDocumentRow | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState<boolean>(false);

  const fetchDocuments = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isFav = categoryTab === "favorites" ? true : undefined;
      const isArchived = categoryTab === "archived" ? true : false;
      const fileType = ["pdf", "word", "powerpoint", "text", "image"].includes(categoryTab)
        ? categoryTab
        : undefined;

      const data = await DocumentsService.getDocuments(
        workspaceId,
        { fileType, isFavorite: isFav, isArchived, tag: selectedTag || undefined },
        searchQuery,
        sortBy
      );
      setDocuments(data);
    } catch (err: any) {
      console.error("Failed to load documents:", err);
      setError(err.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, categoryTab, selectedTag, searchQuery, sortBy]);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Toggle favorite
  const handleToggleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_favorite: !currentStatus } : d))
      );
      await DocumentsService.toggleFavorite(id, !currentStatus);
      toast.success(currentStatus ? "Removed from favorites" : "Added to favorites");
    } catch (err: any) {
      toast.error("Failed to update favorite status", err.message);
      fetchDocuments();
    }
  };

  // Toggle archive
  const handleToggleArchive = async (id: string, currentStatus: boolean) => {
    try {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      await DocumentsService.toggleArchive(id, !currentStatus);
      toast.success(currentStatus ? "Document restored" : "Document archived");
    } catch (err: any) {
      toast.error("Failed to archive document", err.message);
      fetchDocuments();
    }
  };

  // Delete document
  const handleDelete = async (id: string) => {
    try {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      await DocumentsService.deleteDocument(id, false);
      toast.success("Document deleted");
      setDeletingDocument(null);
    } catch (err: any) {
      toast.error("Failed to delete document", err.message);
      fetchDocuments();
    }
  };

  // Update document metadata (rename, tags, description)
  const handleUpdate = async (id: string, updates: Partial<UploadedDocumentRow>) => {
    try {
      const updated = await DocumentsService.updateDocument(id, updates);
      setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
      if (activeDocument?.id === id) setActiveDocument(updated);
      toast.success("Document updated");
      setRenamingDocument(null);
    } catch (err: any) {
      toast.error("Failed to update document", err.message);
    }
  };

  // Move document to target workspace
  const handleMove = async (id: string, targetWorkspaceId: string) => {
    try {
      await DocumentsService.moveDocument(id, targetWorkspaceId);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document moved to workspace");
      setMovingDocument(null);
    } catch (err: any) {
      toast.error("Failed to move document", err.message);
    }
  };

  return {
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
    refresh: fetchDocuments,
  };
}
