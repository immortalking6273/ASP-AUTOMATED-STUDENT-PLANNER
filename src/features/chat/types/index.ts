import { AIConversationRow, AIChatMessageRow } from "@/types/database";

export type AIResponseMode = "hybrid" | "strict_document" | "general_ai";
export type AnswerSource = "document" | "general" | "hybrid";

export interface CitationItem {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  heading: string | null;
  snippet: string;
  similarityScore: number;
}

export interface SourceScope {
  type: "workspace" | "notebook" | "documents";
  notebookId?: string;
  notebookTitle?: string;
  documentIds?: string[];
  documentTitles?: string[];
  responseMode?: AIResponseMode;
}

export interface MessageMetadata {
  feedback?: "up" | "down" | null;
  isBookmarked?: boolean;
  tokenCount?: number;
  processingTimeMs?: number;
  answerSource?: AnswerSource;
  responseMode?: AIResponseMode;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "error";
  content: string;
  citations?: CitationItem[];
  metadata?: MessageMetadata;
  createdAt: string;
  isStreaming?: boolean;
}

export interface ConversationItem {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  sourceScope: SourceScope;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExportFormat = "markdown" | "txt" | "json";
