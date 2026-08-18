import { BaseDatabaseService, QueryOptions, PaginatedResult } from "./base-service";
import { ProfilesService } from "./profiles-service";
import { WorkspaceRow } from "@/types/database";
import { Logger } from "@/lib/logger";

export interface WorkspaceQueryOptions extends QueryOptions {
  search?: string;
  isArchived?: boolean;
}

export interface CreateWorkspaceData {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateWorkspaceData {
  title?: string;
  description?: string | null;
  icon?: string;
  color?: string;
  is_archived?: boolean;
}

export interface WorkspaceStats {
  notebookCount: number;
  taskCount: number;
  documentCount: number;
  pageCount: number;
}

export class WorkspacesService extends BaseDatabaseService {
  /**
   * Fetch user workspaces with support for search, archiving filter, pagination, and sorting
   */
  static async getWorkspaces(
    ownerId: string,
    options?: WorkspaceQueryOptions
  ): Promise<PaginatedResult<WorkspaceRow>> {
    const start = performance.now();
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const supabase = this.getSupabase();
      let query = supabase
        .from("workspaces")
        .select("*", { count: "exact" })
        .eq("owner_id", ownerId);

      // Archive filter (defaults to active non-archived workspaces)
      if (options?.isArchived !== undefined) {
        query = query.eq("is_archived", options.isArchived);
      } else {
        query = query.eq("is_archived", false);
      }

      // Search filter across title & description
      if (options?.search && options.search.trim() !== "") {
        const term = `%${options.search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
      }

      // Sort ordering
      const sortBy = options?.sortBy || "created_at";
      const sortOrder = options?.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" }).range(from, to);

      const { data, count, error } = await query;
      Logger.metric("WorkspacesService.getWorkspaces", performance.now() - start);
      if (error) throw error;

      const totalCount = count || 0;
      return {
        data: (data || []) as WorkspaceRow[],
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
   * Get single workspace by ID with owner validation
   */
  static async getWorkspaceById(id: string, ownerId: string): Promise<WorkspaceRow | null> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .eq("owner_id", ownerId)
        .single();

      Logger.metric("WorkspacesService.getWorkspaceById", performance.now() - start);
      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data as WorkspaceRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Create a new workspace with custom icon and color.
   * Guarantees session persistence, owner_id verification against auth.users.id,
   * and profile existence in public.profiles.
   */
  static async createWorkspace(
    ownerId: string,
    data: CreateWorkspaceData
  ): Promise<WorkspaceRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();

      // 1. Verify active authenticated user session
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("Authentication required. Please sign in to create a workspace.");
      }

      // 2. Ensure owner_id is set strictly to the authenticated user's UUID (auth.users.id)
      const validOwnerId = authData.user.id || ownerId;
      if (!validOwnerId) {
        throw new Error("Invalid user identity for workspace creation.");
      }

      // 3. Ensure profile record exists in public.profiles for user_id to satisfy workspaces_owner_id_fkey
      await ProfilesService.ensureProfile(
        validOwnerId,
        authData.user.email,
        authData.user.user_metadata?.full_name
      );

      // 4. Perform workspace insertion
      const { data: created, error } = await supabase
        .from("workspaces")
        .insert({
          owner_id: validOwnerId,
          title: data.title.trim(),
          description: data.description ? data.description.trim() : null,
          icon: data.icon || "FolderKanban",
          color: data.color || "#6366f1",
          is_archived: false,
        })
        .select()
        .single();

      Logger.metric("WorkspacesService.createWorkspace", performance.now() - start);
      if (error) throw error;
      return created as WorkspaceRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update workspace title, description, icon, color, or archived status
   */
  static async updateWorkspace(
    id: string,
    updates: UpdateWorkspaceData
  ): Promise<WorkspaceRow> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { data: updated, error } = await supabase
        .from("workspaces")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      Logger.metric("WorkspacesService.updateWorkspace", performance.now() - start);
      if (error) throw error;
      return updated as WorkspaceRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Soft delete / Archive workspace
   */
  static async archiveWorkspace(id: string): Promise<boolean> {
    try {
      await this.updateWorkspace(id, { is_archived: true });
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Restore an archived workspace
   */
  static async restoreWorkspace(id: string): Promise<boolean> {
    try {
      await this.updateWorkspace(id, { is_archived: false });
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Hard delete workspace permanently
   */
  static async deleteWorkspace(id: string): Promise<boolean> {
    const start = performance.now();
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      Logger.metric("WorkspacesService.deleteWorkspace", performance.now() - start);
      if (error) throw error;
      return true;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Duplicate existing workspace
   */
  static async duplicateWorkspace(id: string, ownerId: string): Promise<WorkspaceRow> {
    const original = await this.getWorkspaceById(id, ownerId);
    if (!original) throw new Error("Workspace not found");

    return await this.createWorkspace(ownerId, {
      title: `${original.title} (Copy)`,
      description: original.description || undefined,
      icon: original.icon,
      color: original.color,
    });
  }

  /**
   * Fetch aggregated statistics for a given workspace
   */
  static async getWorkspaceStats(workspaceId: string): Promise<WorkspaceStats> {
    try {
      const supabase = this.getSupabase();

      const [notebooksRes, tasksRes, docsRes] = await Promise.all([
        supabase.from("notebooks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
        supabase.from("uploaded_documents").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
      ]);

      return {
        notebookCount: notebooksRes.count || 0,
        taskCount: tasksRes.count || 0,
        documentCount: docsRes.count || 0,
        pageCount: (notebooksRes.count || 0) * 3, // Estimated page count ratio
      };
    } catch {
      return { notebookCount: 0, taskCount: 0, documentCount: 0, pageCount: 0 };
    }
  }
}
