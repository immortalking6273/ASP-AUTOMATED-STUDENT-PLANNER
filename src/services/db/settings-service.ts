import { BaseDatabaseService } from "./base-service";

export interface UserPreferencesRow {
  id: string;
  user_id: string;
  response_style: "concise" | "balanced" | "detailed" | string;
  ai_language: "auto" | "en" | "ta" | string;
  show_citations: boolean;
  reduce_motion: boolean;
  save_chat_history: boolean;
  daily_study_goal_minutes: number;
  weekly_study_goal_minutes: number;
  preferred_start_time: string;
  preferred_end_time: string;
  default_session_minutes: number;
  default_break_minutes: number;
  default_workspace_id: string | null;
  created_at: string;
  updated_at: string;
}

export class UserSettingsService extends BaseDatabaseService {
  /**
   * Fetch or create default user preferences
   */
  static async getPreferences(userId: string, client?: any): Promise<UserPreferencesRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) return data as UserPreferencesRow;

      // Insert default preferences row if not exists
      const { data: inserted, error: insertErr } = await supabase
        .from("user_preferences")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertErr || !inserted) {
        return {
          id: "default",
          user_id: userId,
          response_style: "balanced",
          ai_language: "auto",
          show_citations: true,
          reduce_motion: false,
          save_chat_history: true,
          daily_study_goal_minutes: 120,
          weekly_study_goal_minutes: 600,
          preferred_start_time: "09:00",
          preferred_end_time: "18:00",
          default_session_minutes: 60,
          default_break_minutes: 10,
          default_workspace_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return inserted as UserPreferencesRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    patch: Partial<UserPreferencesRow>,
    client?: any
  ): Promise<UserPreferencesRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("user_preferences")
        .update({
          ...patch,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as UserPreferencesRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Reset user preferences back to default values
   */
  static async resetPreferences(userId: string, client?: any): Promise<UserPreferencesRow> {
    const defaults = {
      response_style: "balanced",
      ai_language: "auto",
      show_citations: true,
      reduce_motion: false,
      save_chat_history: true,
      daily_study_goal_minutes: 120,
      weekly_study_goal_minutes: 600,
      preferred_start_time: "09:00",
      preferred_end_time: "18:00",
      default_session_minutes: 60,
      default_break_minutes: 10,
      default_workspace_id: null,
    };
    return this.updatePreferences(userId, defaults, client);
  }

  /**
   * Export all student data in structured JSON
   */
  static async exportUserData(userId: string, client?: any): Promise<any> {
    try {
      const supabase = client || this.getSupabase();

      const [
        profileRes,
        preferencesRes,
        workspacesRes,
        notebooksRes,
        tasksRes,
        flashcardsRes,
        quizzesRes,
        studySessionsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        this.getPreferences(userId, supabase),
        supabase.from("workspaces").select("*").eq("owner_id", userId),
        supabase.from("notebooks").select("*").eq("user_id", userId),
        supabase.from("tasks").select("*").eq("user_id", userId),
        supabase.from("flashcard_decks").select("*").eq("user_id", userId),
        supabase.from("quizzes").select("*").eq("user_id", userId),
        supabase.from("study_sessions").select("*").eq("user_id", userId),
      ]);

      return {
        exportedAt: new Date().toISOString(),
        aspVersion: "1.0.0",
        profile: profileRes.data || null,
        userPreferences: preferencesRes || null,
        workspaces: workspacesRes.data || [],
        notebooks: notebooksRes.data || [],
        tasks: tasksRes.data || [],
        flashcardDecks: flashcardsRes.data || [],
        quizzes: quizzesRes.data || [],
        studySessions: studySessionsRes.data || [],
      };
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
