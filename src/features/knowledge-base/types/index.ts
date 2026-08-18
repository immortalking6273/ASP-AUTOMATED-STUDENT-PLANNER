import { UploadedDocumentRow, DocumentChunkRow } from "@/types/database";

export interface KnowledgeStats {
  totalDocuments: number;
  totalChunks: number;
  readyCount: number;
  processingCount: number;
  failedCount: number;
  totalTokens: number;
}

export type KnowledgeStatus =
  | "uploading"
  | "extracting"
  | "chunking"
  | "embedding"
  | "indexed"
  | "ready"
  | "failed";

export interface KnowledgeDocument extends UploadedDocumentRow {
  chunk_count?: number;
  embedding_dimensions?: number;
  subject_name?: string | null;
  notebook_title?: string | null;
}

export interface KnowledgeChunkDetail {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  heading: string | null;
  content: string;
  characterCount: number;
  tokenEstimate: number;
  pageNumber?: number | null;
  hasEmbedding: boolean;
}

export interface KnowledgeSearchResult {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  heading: string | null;
  excerpt: string;
  similarityScore: number;
  relevancePercentage: number;
  relevanceLabel: "High Relevance" | "Medium Relevance" | "Low Relevance";
}

export type KnowledgeFilterTab = "all" | "ready" | "processing" | "failed";
