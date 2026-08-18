import { BaseDatabaseService } from "./base-service";
import { PlannerTask, StudySessionItem, TaskStatus, TaskPriority } from "@/features/planner/types";

export class StudyPlannerService extends BaseDatabaseService {
  // ==========================================
  // TASKS CRUD
  // ==========================================

  static async getTasks(workspaceId: string): Promise<PlannerTask[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        workspaceId: row.workspace_id,
        userId: row.user_id || null,
        title: row.title,
        description: row.description || null,
        subject: row.subject || null,
        priority: (row.priority || "medium") as TaskPriority,
        status: (row.status || (row.completed ? "completed" : "todo")) as TaskStatus,
        dueDate: row.due_date || null,
        estimatedMinutes: row.estimated_minutes || 30,
        completed: Boolean(row.completed || row.status === "completed"),
        completedAt: row.completed_at || null,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async createTask(payload: {
    workspaceId: string;
    userId?: string;
    title: string;
    description?: string;
    subject?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
    estimatedMinutes?: number;
  }): Promise<PlannerTask> {
    try {
      const supabase = this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      if (!payload.workspaceId || payload.workspaceId.startsWith("temp-")) {
        throw new Error("Invalid workspace ID. Please select a valid workspace.");
      }

      if (!payload.title || !payload.title.trim()) {
        throw new Error("Task title is required.");
      }

      // Base payload matching 20260804000000_module3_database_schema.sql
      const basePayload: any = {
        workspace_id: payload.workspaceId,
        title: payload.title.trim(),
        description: payload.description ? payload.description.trim() : null,
        priority: payload.priority || "medium",
        due_date: payload.dueDate ? new Date(payload.dueDate).toISOString() : null,
        completed: payload.status === "completed",
      };

      // Extended payload including 20260809_study_planner_schema.sql columns
      const fullPayload: any = {
        ...basePayload,
        status: payload.status || "todo",
        estimated_minutes: payload.estimatedMinutes !== undefined ? payload.estimatedMinutes : 30,
      };

      if (user?.id) {
        fullPayload.user_id = user.id;
      }
      if (payload.subject) {
        fullPayload.subject = payload.subject.trim();
      }
      if (payload.status === "completed") {
        fullPayload.completed_at = new Date().toISOString();
      }

      // Try inserting full payload first
      let data: any = null;
      const { data: resData, error } = await supabase
        .from("tasks")
        .insert(fullPayload)
        .select()
        .single();

      if (error) {
        // Fallback: If missing columns in database schema (PGRST204 / 42703 / column error), insert base payload
        if (
          error.code === "PGRST204" ||
          error.code === "42703" ||
          error.message?.includes("column") ||
          error.message?.includes("schema cache")
        ) {
          console.warn("[TasksService] Extended payload insert failed due to column mismatch. Retrying with base task schema...", error.message);
          const fallbackRes = await supabase
            .from("tasks")
            .insert(basePayload)
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = fallbackRes.data;
        } else {
          throw error;
        }
      } else {
        data = resData;
      }

      return {
        id: data.id,
        workspaceId: data.workspace_id,
        userId: data.user_id || user?.id || null,
        title: data.title,
        description: data.description || null,
        subject: data.subject || payload.subject || null,
        priority: (data.priority || payload.priority || "medium") as TaskPriority,
        status: (data.status || (data.completed ? "completed" : payload.status || "todo")) as TaskStatus,
        dueDate: data.due_date || null,
        estimatedMinutes: data.estimated_minutes || payload.estimatedMinutes || 30,
        completed: Boolean(data.completed || data.status === "completed"),
        completedAt: data.completed_at || null,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async updateTask(
    taskId: string,
    payload: {
      title?: string;
      description?: string | null;
      subject?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: string | null;
      estimatedMinutes?: number;
    }
  ): Promise<PlannerTask> {
    try {
      const supabase = this.getSupabase();
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.description !== undefined) updateData.description = payload.description ? payload.description.trim() : null;
      if (payload.subject !== undefined) updateData.subject = payload.subject ? payload.subject.trim() : null;
      if (payload.priority !== undefined) updateData.priority = payload.priority;
      if (payload.dueDate !== undefined) updateData.due_date = payload.dueDate ? new Date(payload.dueDate).toISOString() : null;
      if (payload.estimatedMinutes !== undefined) updateData.estimated_minutes = payload.estimatedMinutes;

      if (payload.status !== undefined) {
        updateData.status = payload.status;
        updateData.completed = payload.status === "completed";
        updateData.completed_at = payload.status === "completed" ? new Date().toISOString() : null;
      }

      let data: any = null;
      const { data: resData, error } = await supabase
        .from("tasks")
        .update(updateData)
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        if (
          error.code === "PGRST204" ||
          error.code === "42703" ||
          error.message?.includes("column") ||
          error.message?.includes("schema cache")
        ) {
          console.warn("[TasksService] Extended update failed due to column mismatch. Retrying with base task schema...", error.message);
          delete updateData.subject;
          delete updateData.status;
          delete updateData.estimated_minutes;
          delete updateData.completed_at;

          const fallbackRes = await supabase
            .from("tasks")
            .update(updateData)
            .eq("id", taskId)
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = fallbackRes.data;
        } else {
          throw error;
        }
      } else {
        data = resData;
      }

      return {
        id: data.id,
        workspaceId: data.workspace_id,
        userId: data.user_id || null,
        title: data.title,
        description: data.description || null,
        subject: data.subject || payload.subject || null,
        priority: (data.priority || payload.priority || "medium") as TaskPriority,
        status: (data.status || (data.completed ? "completed" : payload.status || "todo")) as TaskStatus,
        dueDate: data.due_date || null,
        estimatedMinutes: data.estimated_minutes || payload.estimatedMinutes || 30,
        completed: Boolean(data.completed || data.status === "completed"),
        completedAt: data.completed_at || null,
        createdAt: data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || new Date().toISOString(),
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async toggleTaskCompletion(taskId: string, completed: boolean): Promise<PlannerTask> {
    const status: TaskStatus = completed ? "completed" : "todo";
    return this.updateTask(taskId, { status });
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  // ==========================================
  // STUDY SESSIONS CRUD
  // ==========================================

  static async getStudySessions(workspaceId: string): Promise<StudySessionItem[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .order("started_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        workspaceId: row.workspace_id || workspaceId,
        userId: row.user_id,
        title: row.title || row.subject || "Study Session",
        subject: row.subject,
        startTime: row.start_time || row.started_at || new Date().toISOString(),
        endTime: row.end_time || row.ended_at || row.start_time || new Date().toISOString(),
        durationMinutes: row.duration || 60,
        notes: row.notes || null,
        createdAt: row.created_at,
      }));
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async createStudySession(payload: {
    workspaceId: string;
    userId?: string;
    title: string;
    subject?: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<StudySessionItem> {
    try {
      const supabase = this.getSupabase();
      const { data: { user } } = await supabase.auth.getUser();

      const start = new Date(payload.startTime);
      const end = new Date(payload.endTime);
      const duration = Math.max(15, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));

      // Base payload compatible with 20260804000000_module3_database_schema.sql
      const basePayload: any = {
        user_id: payload.userId || user?.id,
        duration: Math.max(60, duration * 60), // seconds in base schema
        subject: payload.subject || payload.title || "General",
        started_at: payload.startTime,
        ended_at: payload.endTime,
      };

      // Extended payload matching 20260809_study_planner_schema.sql
      const fullPayload: any = {
        ...basePayload,
        workspace_id: payload.workspaceId,
        title: payload.title.trim(),
        start_time: payload.startTime,
        end_time: payload.endTime,
        duration, // minutes in extended schema
        notes: payload.notes ? payload.notes.trim() : null,
      };

      let data: any = null;
      const { data: resData, error } = await supabase
        .from("study_sessions")
        .insert(fullPayload)
        .select()
        .single();

      if (error) {
        if (
          error.code === "PGRST204" ||
          error.code === "42703" ||
          error.message?.includes("column") ||
          error.message?.includes("schema cache")
        ) {
          console.warn("[StudyPlannerService] Extended study_session insert failed. Retrying with base schema...", error.message);
          const fallbackRes = await supabase
            .from("study_sessions")
            .insert(basePayload)
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = fallbackRes.data;
        } else {
          throw error;
        }
      } else {
        data = resData;
      }

      return {
        id: data.id,
        workspaceId: data.workspace_id || payload.workspaceId,
        userId: data.user_id,
        title: data.title || payload.title,
        subject: data.subject || payload.subject || null,
        startTime: data.start_time || data.started_at || payload.startTime,
        endTime: data.end_time || data.ended_at || payload.endTime,
        durationMinutes: data.duration || duration,
        notes: data.notes || payload.notes || null,
        createdAt: data.created_at || new Date().toISOString(),
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async updateStudySession(
    sessionId: string,
    payload: {
      title?: string;
      subject?: string | null;
      startTime?: string;
      endTime?: string;
      notes?: string | null;
    }
  ): Promise<StudySessionItem> {
    try {
      const supabase = this.getSupabase();
      const updateData: any = {};

      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.subject !== undefined) updateData.subject = payload.subject ? payload.subject.trim() : "General";
      if (payload.notes !== undefined) updateData.notes = payload.notes ? payload.notes.trim() : null;
      if (payload.startTime !== undefined) {
        updateData.start_time = payload.startTime;
        updateData.started_at = payload.startTime;
      }
      if (payload.endTime !== undefined) {
        updateData.end_time = payload.endTime;
        updateData.ended_at = payload.endTime;
      }

      if (payload.startTime && payload.endTime) {
        const start = new Date(payload.startTime);
        const end = new Date(payload.endTime);
        const mins = Math.max(15, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
        updateData.duration = mins;
      }

      let data: any = null;
      const { data: resData, error } = await supabase
        .from("study_sessions")
        .update(updateData)
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        if (
          error.code === "PGRST204" ||
          error.code === "42703" ||
          error.message?.includes("column") ||
          error.message?.includes("schema cache")
        ) {
          delete updateData.title;
          delete updateData.notes;
          delete updateData.start_time;
          delete updateData.end_time;

          const fallbackRes = await supabase
            .from("study_sessions")
            .update(updateData)
            .eq("id", sessionId)
            .select()
            .single();

          if (fallbackRes.error) throw fallbackRes.error;
          data = fallbackRes.data;
        } else {
          throw error;
        }
      } else {
        data = resData;
      }

      return {
        id: data.id,
        workspaceId: data.workspace_id || null,
        userId: data.user_id,
        title: data.title || payload.title || "Study Session",
        subject: data.subject || payload.subject || null,
        startTime: data.start_time || data.started_at || new Date().toISOString(),
        endTime: data.end_time || data.ended_at || new Date().toISOString(),
        durationMinutes: data.duration || 60,
        notes: data.notes || payload.notes || null,
        createdAt: data.created_at || new Date().toISOString(),
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async deleteStudySession(sessionId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();
      const { error } = await supabase.from("study_sessions").delete().eq("id", sessionId);
      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async batchCreateStudySessions(
    workspaceId: string,
    sessions: Array<{ title: string; subject: string; startTime: string; endTime: string; notes?: string }>
  ): Promise<StudySessionItem[]> {
    const results: StudySessionItem[] = [];
    for (const s of sessions) {
      const created = await this.createStudySession({
        workspaceId,
        title: s.title,
        subject: s.subject,
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.notes,
      });
      results.push(created);
    }
    return results;
  }
}
