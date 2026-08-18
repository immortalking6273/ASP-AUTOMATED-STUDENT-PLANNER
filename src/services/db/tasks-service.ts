import { BaseDatabaseService, QueryOptions, PaginatedResult } from "./base-service";
import { TaskRow } from "@/types/database";

export class TasksService extends BaseDatabaseService {
  static async getTasksByWorkspace(
    workspaceId: string,
    options?: QueryOptions
  ): Promise<PaginatedResult<TaskRow>> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const supabase = this.getSupabase();
      const { data, count, error } = await supabase
        .from("tasks")
        .select("*", { count: "exact" })
        .eq("workspace_id", workspaceId)
        .order(options?.sortBy || "created_at", { ascending: options?.sortOrder === "asc" })
        .range(from, to);

      if (error) throw error;
      const totalCount = count || 0;

      return {
        data: (data || []) as TaskRow[],
        count: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async toggleTaskCompletion(taskId: string, completed: boolean): Promise<TaskRow> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", taskId)
        .select()
        .single();
      if (error) throw error;
      return data as TaskRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
