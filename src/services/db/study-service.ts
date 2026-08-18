import { BaseDatabaseService } from "./base-service";
import { StudySessionRow, NotificationRow } from "@/types/database";

export class StudyService extends BaseDatabaseService {
  static async getStudySessions(userId: string): Promise<StudySessionRow[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data || []) as StudySessionRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async getNotifications(userId: string): Promise<NotificationRow[]> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as NotificationRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
