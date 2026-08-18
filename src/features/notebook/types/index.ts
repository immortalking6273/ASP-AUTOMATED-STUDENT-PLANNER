import { NotebookRow } from "@/types/database";
import { PageTreeNode } from "@/services/db/pages-service";

export type NotebookFilterTab = "all" | "favorites" | "archived" | "pinned";
export type NotebookSortOption = "created_desc" | "created_asc" | "title_asc" | "title_desc" | "updated_desc";
export type NotebookViewMode = "grid" | "list";

export interface ActiveNotebookContext {
  notebook: NotebookRow | null;
  pageTree: PageTreeNode[];
  stats: { pageCount: number; lastUpdated: string | null };
}
