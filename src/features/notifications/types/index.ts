import {
  NotificationRow,
  NotificationPreferencesRow,
} from "@/services/db/notifications-service";

export type { NotificationRow, NotificationPreferencesRow };

export type NotificationCategory =
  | "all"
  | "unread"
  | "task_due"
  | "task_overdue"
  | "study_session"
  | "quiz_reminder"
  | "flashcard_review"
  | "planner"
  | "system"
  | "ai_reminder";

export interface NotificationFilterState {
  category: NotificationCategory;
  searchQuery?: string;
}
