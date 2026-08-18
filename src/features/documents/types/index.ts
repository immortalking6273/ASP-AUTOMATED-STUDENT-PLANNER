import { UploadedDocumentRow } from "@/types/database";
import { DocumentSortOption } from "@/services/db/documents-service";

export type { DocumentSortOption };
export type DocumentCategoryTab = "all" | "pdf" | "word" | "powerpoint" | "text" | "image" | "favorites" | "archived";
export type DocumentViewMode = "grid" | "list";

export interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  errorMessage?: string;
}

export interface DocumentFilterState {
  category: DocumentCategoryTab;
  searchQuery: string;
  selectedTag: string | null;
  sortBy: DocumentSortOption;
  viewMode: DocumentViewMode;
}
