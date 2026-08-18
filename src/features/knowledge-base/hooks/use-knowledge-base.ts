"use client";

import * as React from "react";
import {
  KnowledgeStats,
  KnowledgeDocument,
  KnowledgeChunkDetail,
  KnowledgeSearchResult,
  KnowledgeFilterTab,
} from "../types";
import { KnowledgeBaseService } from "@/services/db/knowledge-base-service";
import { toast } from "@/components/ui/toast";

export function useKnowledgeBase(workspaceId: string | null) {
  const [documents, setDocuments] = React.useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = React.useState<KnowledgeStats>({
    totalDocuments: 0,
    totalChunks: 0,
    readyCount: 0,
    processingCount: 0,
    failedCount: 0,
    totalTokens: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [filterTab, setFilterTab] = React.useState<KnowledgeFilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Semantic Search State
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<KnowledgeSearchResult[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Chunk Explorer Modal State
  const [inspectingDocument, setInspectingDocument] = React.useState<KnowledgeDocument | null>(null);
  const [chunks, setChunks] = React.useState<KnowledgeChunkDetail[]>([]);
  const [isLoadingChunks, setIsLoadingChunks] = React.useState(false);

  // Load Overview Data
  const loadOverview = React.useCallback(async () => {
    if (!workspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedDocs, fetchedStats] = await Promise.all([
        KnowledgeBaseService.getKnowledgeDocuments(workspaceId),
        KnowledgeBaseService.getKnowledgeStats(workspaceId),
      ]);

      setDocuments(fetchedDocs);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error("Error loading Knowledge Base:", err);
      toast.error("Could not load Knowledge Base data");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    loadOverview();
  }, [workspaceId, loadOverview]);

  // Filtered Documents
  const filteredDocuments = React.useMemo(() => {
    return documents.filter((doc) => {
      const st = (doc.processing_status || "uploaded").toLowerCase();

      // Tab filter
      if (filterTab === "ready") {
        if (st !== "ready" && st !== "indexed") return false;
      } else if (filterTab === "processing") {
        if (st === "ready" || st === "indexed" || st === "failed") return false;
      } else if (filterTab === "failed") {
        if (st !== "failed") return false;
      }

      // Search query against doc title
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (doc.display_name || doc.original_name || "").toLowerCase().includes(q);
        if (!titleMatch) return false;
      }

      return true;
    });
  }, [documents, filterTab, searchQuery]);

  // Execute Semantic Search
  const performSearch = async (queryText: string) => {
    if (!workspaceId || !queryText.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch("/api/knowledge-base/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, query: queryText.trim() }),
      });

      if (!res.ok) throw new Error("Knowledge search failed");

      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      toast.error("Knowledge search error", err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  // Inspect Chunks for Document
  const inspectDocumentChunks = async (doc: KnowledgeDocument) => {
    setInspectingDocument(doc);
    setIsLoadingChunks(true);
    try {
      const fetchedChunks = await KnowledgeBaseService.getDocumentChunkDetails(doc.id);
      setChunks(fetchedChunks);
    } catch (err: any) {
      toast.error("Could not load knowledge chunks", err.message);
    } finally {
      setIsLoadingChunks(false);
    }
  };

  const closeChunkInspector = () => {
    setInspectingDocument(null);
    setChunks([]);
  };

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    stats,
    isLoading,
    filterTab,
    setFilterTab,
    searchQuery,
    setSearchQuery,

    // Semantic Search
    isSearching,
    searchResults,
    hasSearched,
    performSearch,
    clearSearch,

    // Chunk Inspector
    inspectingDocument,
    chunks,
    isLoadingChunks,
    inspectDocumentChunks,
    closeChunkInspector,

    // Actions
    refresh: loadOverview,
  };
}
