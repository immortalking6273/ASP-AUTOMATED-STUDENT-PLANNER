import { BaseDatabaseService } from "./base-service";

export interface NotificationRow {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  event_key: string | null;
  read_at: string | null;
  metadata: any | null;
  created_at: string;
}

export interface NotificationPreferencesRow {
  id: string;
  user_id: string;
  task_reminders: boolean;
  deadline_reminders: boolean;
  overdue_alerts: boolean;
  study_session_reminders: boolean;
  quiz_reminders: boolean;
  flashcard_reminders: boolean;
  planner_notifications: boolean;
  ai_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export class NotificationsService extends BaseDatabaseService {
  static async getNotifications(
    userId: string,
    workspaceId?: string | null,
    filter: string = "all",
    client?: any
  ): Promise<NotificationRow[]> {
    try {
      const supabase = client || this.getSupabase();
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (workspaceId) {
        query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`);
      }

      if (filter === "unread") {
        query = query.eq("is_read", false);
      } else if (filter !== "all") {
        query = query.eq("type", filter);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return (data || []) as NotificationRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async getUnreadCount(userId: string, client?: any): Promise<number> {
    try {
      const supabase = client || this.getSupabase();
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async markAsRead(notificationId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async markAllAsRead(userId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async deleteNotification(notificationId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async clearReadNotifications(userId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId)
        .eq("is_read", true);

      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async createNotification(
    payload: {
      userId: string;
      workspaceId?: string | null;
      title: string;
      message: string;
      type?: string;
      entityType?: string | null;
      entityId?: string | null;
      eventKey?: string | null;
      metadata?: any;
    },
    client?: any
  ): Promise<NotificationRow | null> {
    try {
      const supabase = client || this.getSupabase();

      // Check deduplication key if provided
      if (payload.eventKey) {
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", payload.userId)
          .eq("event_key", payload.eventKey)
          .maybeSingle();

        if (existing) return null; // Already notified!
      }

      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: payload.userId,
          workspace_id: payload.workspaceId || null,
          title: payload.title.trim(),
          message: payload.message.trim(),
          type: payload.type || "info",
          entity_type: payload.entityType || null,
          entity_id: payload.entityId || null,
          event_key: payload.eventKey || null,
          metadata: payload.metadata || null,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        // Ignore duplicate key conflict error gracefully
        if (error.code === "23505") return null;
        throw error;
      }

      return data as NotificationRow;
    } catch (err) {
      console.warn("createNotification warning:", err);
      return null;
    }
  }

  /**
   * Scans tasks, study sessions, flashcards, and quizzes to generate deduplicated reminders
   */
  static async generateAutomaticReminders(
    userId: string,
    workspaceId?: string | null,
    client?: any
  ): Promise<number> {
    try {
      const supabase = client || this.getSupabase();
      const prefs = await NotificationPreferencesService.getPreferences(userId, supabase);
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      let generatedCount = 0;

      // 1. Task Deadline & Overdue Reminders
      if (prefs.deadline_reminders || prefs.overdue_alerts) {
        let taskQuery = supabase.from("tasks").select("*").eq("user_id", userId);
        if (workspaceId) taskQuery = taskQuery.eq("workspace_id", workspaceId);

        const { data: tasks } = await taskQuery;

        for (const t of tasks || []) {
          if (t.completed || t.status === "completed") continue;
          if (!t.due_date) continue;

          const dueDate = new Date(t.due_date);
          const dueStr = dueDate.toISOString().split("T")[0];

          // Overdue Check
          if (dueDate < now && prefs.overdue_alerts) {
            const eventKey = `task:${t.id}:overdue:${todayStr}`;
            const created = await this.createNotification(
              {
                userId,
                workspaceId: t.workspace_id,
                title: `🔴 Overdue Task: ${t.title}`,
                message: `Task "${t.title}" was due on ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} and is currently overdue.`,
                type: "task_overdue",
                entityType: "task",
                entityId: t.id,
                eventKey,
              },
              supabase
            );
            if (created) generatedCount++;
          } else if (dueStr === todayStr && prefs.deadline_reminders) {
            // Due Today Check
            const eventKey = `task:${t.id}:due:today`;
            const created = await this.createNotification(
              {
                userId,
                workspaceId: t.workspace_id,
                title: `🟡 Task Due Today: ${t.title}`,
                message: `Task "${t.title}" is due today. Complete it to stay on track.`,
                type: "task_due",
                entityType: "task",
                entityId: t.id,
                eventKey,
              },
              supabase
            );
            if (created) generatedCount++;
          }
        }
      }

      // 2. Study Session Reminders
      if (prefs.study_session_reminders) {
        let sessionQuery = supabase.from("study_sessions").select("*").eq("user_id", userId);
        if (workspaceId) sessionQuery = sessionQuery.eq("workspace_id", workspaceId);

        const { data: sessions } = await sessionQuery;

        for (const s of sessions || []) {
          if (!s.start_time) continue;
          const startTime = new Date(s.start_time);
          const diffMinutes = Math.round((startTime.getTime() - now.getTime()) / (1000 * 60));

          // Reminder 30 mins before
          if (diffMinutes > 0 && diffMinutes <= 60) {
            const eventKey = `study:${s.id}:30min`;
            const created = await this.createNotification(
              {
                userId,
                workspaceId: s.workspace_id,
                title: `🟣 Upcoming Study Session`,
                message: `"${s.title || "Study Session"}" starts in ${diffMinutes} minutes.`,
                type: "study_session",
                entityType: "study_session",
                entityId: s.id,
                eventKey,
              },
              supabase
            );
            if (created) generatedCount++;
          }
        }
      }

      // 3. Flashcard Review Reminders
      if (prefs.flashcard_reminders) {
        let fcQuery = supabase.from("flashcards").select("*").eq("user_id", userId);
        if (workspaceId) fcQuery = fcQuery.eq("workspace_id", workspaceId);

        const { data: cards } = await fcQuery;
        const dueCards = (cards || []).filter((c: any) => {
          if (!c.next_review_at) return true;
          return new Date(c.next_review_at) <= now;
        });

        if (dueCards.length > 0) {
          const eventKey = `flashcards:${workspaceId || "user"}:due:${todayStr}`;
          const created = await this.createNotification(
            {
              userId,
              workspaceId,
              title: `🎴 Flashcard Review Due`,
              message: `You have ${dueCards.length} flashcard${dueCards.length > 1 ? "s" : ""} ready for review today.`,
              type: "flashcard_review",
              entityType: "flashcard",
              eventKey,
            },
            supabase
          );
          if (created) generatedCount++;
        }
      }

      // 4. Quiz Reminders
      if (prefs.quiz_reminders) {
        let quizQuery = supabase.from("quizzes").select("*").eq("user_id", userId);
        if (workspaceId) quizQuery = quizQuery.eq("workspace_id", workspaceId);

        const { data: quizzes } = await quizQuery;

        if (quizzes && quizzes.length > 0) {
          const unattemptedQuiz = quizzes.find((q: any) => !q.latest_score);
          if (unattemptedQuiz) {
            const eventKey = `quiz:${unattemptedQuiz.id}:unattempted:${todayStr}`;
            const created = await this.createNotification(
              {
                userId,
                workspaceId,
                title: `📝 Quiz Ready for Practice`,
                message: `Quiz "${unattemptedQuiz.title}" is ready. Test your knowledge!`,
                type: "quiz_reminder",
                entityType: "quiz",
                entityId: unattemptedQuiz.id,
                eventKey,
              },
              supabase
            );
            if (created) generatedCount++;
          }
        }
      }

      return generatedCount;
    } catch (err) {
      console.warn("generateAutomaticReminders error:", err);
      return 0;
    }
  }
}

export class NotificationPreferencesService extends BaseDatabaseService {
  static async getPreferences(userId: string, client?: any): Promise<NotificationPreferencesRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) return data as NotificationPreferencesRow;

      // Create default row if missing
      const { data: inserted, error: insertErr } = await supabase
        .from("notification_preferences")
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertErr || !inserted) {
        // Fallback default object if DB row creation fails
        return {
          id: "default",
          user_id: userId,
          task_reminders: true,
          deadline_reminders: true,
          overdue_alerts: true,
          study_session_reminders: true,
          quiz_reminders: true,
          flashcard_reminders: true,
          planner_notifications: true,
          ai_reminders: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return inserted as NotificationPreferencesRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  static async updatePreferences(
    userId: string,
    patch: Partial<NotificationPreferencesRow>,
    client?: any
  ): Promise<NotificationPreferencesRow> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("notification_preferences")
        .update({
          ...patch,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferencesRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
