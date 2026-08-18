import { BaseDatabaseService, QueryOptions, PaginatedResult } from "./base-service";
import { NotebookRow } from "@/types/database";
import { Logger } from "@/lib/logger";

export interface NotebookQueryOptions extends QueryOptions {
  search?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  isPinned?: boolean;
  color?: string;
}

export interface CreateNotebookData {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateNotebookData {
  title?: string;
  description?: string | null;
  icon?: string;
  color?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  is_pinned?: boolean;
  order_index?: number;
}

export interface NotebookStats {
  pageCount: number;
  lastUpdated: string | null;
}

export class NotebooksService extends BaseDatabaseService {
  /**
   * Fetch notebooks for a workspace with search, filter, sort, and pagination
   */
  static async getNotebooks(
    workspaceId: string,
    options?: NotebookQueryOptions
  ): Promise<PaginatedResult<NotebookRow>> {
    const start = performance.now();
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 100;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const supabase = this.getSupabase();
      let query = supabase
        .from("notebooks")
        .select("*", { count: "exact" })
        .eq("workspace_id", workspaceId);

      // Archive filter (defaults to active non-archived notebooks)
      if (options?.isArchived !== undefined) {
        query = query.eq("is_archived", options.isArchived);
      } else {
        query = query.eq("is_archived", false);
      }

      // Favorite filter
      if (options?.isFavorite !== undefined) {
        query = query.eq("is_favorite", options.isFavorite);
      }

      // Pinned filter
      if (options?.isPinned !== undefined) {
        query = query.eq("is_pinned", options.isPinned);
      }

      // Color filter
      if (options?.color && options.color.trim() !== "") {
        query = query.eq("color", options.color.trim());
      }

      // Search filter across title & description
      if (options?.search && options.search.trim() !== "") {
        const term = `%${options.search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
      }

      // Sort ordering
      const sortBy = options?.sortBy || "created_at";
      const sortOrder = options?.sortOrder || "desc";
      query = query.order("is_pinned", { ascending: false }).order(sortBy, { ascending: sortOrder === "asc" }).range(from, to);

      const { data, count, error } = await query;
      Logger.metric("NotebooksService.getNotebooks", performance.now() - start);
      if (error) throw error;

      const totalCount = count || 0;
      return {
        data: (data || []) as NotebookRow[],
        count: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Get single notebook by ID
   */
  static async getNotebookById(id: string, workspaceId?: string): Promise<NotebookRow | null> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      let query = supabase.from("notebooks").select("*").eq("id", id);
      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      const { data, error } = await query.single();
      Logger.metric("NotebooksService.getNotebookById", performance.now() - start);
      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data as NotebookRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Create a new notebook
   */
  static async createNotebook(
    workspaceId: string,
    data: CreateNotebookData
  ): Promise<NotebookRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data: created, error } = await supabase
        .from("notebooks")
        .insert({
          workspace_id: workspaceId,
          title: data.title.trim(),
          description: data.description ? data.description.trim() : null,
          icon: data.icon || "FileText",
          color: data.color || "#6366f1",
          is_archived: false,
          is_favorite: false,
          is_pinned: false,
        })
        .select()
        .single();

      Logger.metric("NotebooksService.createNotebook", performance.now() - start);
      if (error) throw error;
      return created as NotebookRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update notebook
   */
  static async updateNotebook(
    id: string,
    updates: UpdateNotebookData
  ): Promise<NotebookRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data: updated, error } = await supabase
        .from("notebooks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      Logger.metric("NotebooksService.updateNotebook", performance.now() - start);
      if (error) throw error;
      return updated as NotebookRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Toggle notebook favorite status
   */
  static async toggleFavorite(id: string, currentStatus: boolean): Promise<NotebookRow> {
    return await this.updateNotebook(id, { is_favorite: !currentStatus });
  }

  /**
   * Toggle notebook pinned status
   */
  static async togglePin(id: string, currentStatus: boolean): Promise<NotebookRow> {
    return await this.updateNotebook(id, { is_pinned: !currentStatus });
  }

  /**
   * Archive notebook (soft delete)
   */
  static async archiveNotebook(id: string): Promise<boolean> {
    await this.updateNotebook(id, { is_archived: true });
    return true;
  }

  /**
   * Restore an archived notebook
   */
  static async restoreNotebook(id: string): Promise<boolean> {
    await this.updateNotebook(id, { is_archived: false });
    return true;
  }

  /**
   * Permanently delete notebook
   */
  static async deleteNotebook(id: string): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("notebooks").delete().eq("id", id);
      Logger.metric("NotebooksService.deleteNotebook", performance.now() - start);
      if (error) throw error;
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Duplicate notebook
   */
  static async duplicateNotebook(id: string, workspaceId: string): Promise<NotebookRow> {
    const original = await this.getNotebookById(id, workspaceId);
    if (!original) throw new Error("Notebook not found.");

    return await this.createNotebook(workspaceId, {
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      icon: original.icon,
      color: original.color,
    });
  }

  /**
   * Fetch stats for notebook (page count, last updated)
   */
  static async getNotebookStats(notebookId: string): Promise<NotebookStats> {
    try {
      const supabase = this.getSupabase();
      const { count, error } = await supabase
        .from("pages")
        .select("id", { count: "exact", head: true })
        .eq("notebook_id", notebookId)
        .eq("is_archived", false);

      if (error) throw error;

      const { data: recent } = await supabase
        .from("pages")
        .select("updated_at")
        .eq("notebook_id", notebookId)
        .order("updated_at", { ascending: false })
        .limit(1);

      return {
        pageCount: count || 0,
        lastUpdated: recent && recent.length > 0 ? recent[0].updated_at : null,
      };
    } catch {
      return { pageCount: 0, lastUpdated: null };
    }
  }
}
