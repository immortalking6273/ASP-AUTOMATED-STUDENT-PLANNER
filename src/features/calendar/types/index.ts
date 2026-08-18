import { PlannerTask, StudySessionItem } from "@/features/planner/types";
import { CalendarEventRow, CalendarEventType } from "@/services/db/calendar-events-service";

export type CalendarView = "month" | "week" | "day" | "agenda";

export type CalendarItemType = "task" | "study_session" | "event";

export type { CalendarEventType, CalendarEventRow };

/** Unified display model — normalised from tasks / study_sessions / calendar_events */
export interface CalendarItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  type: CalendarItemType;
  eventType?: CalendarEventType;
  completed?: boolean;
  subject?: string | null;
  location?: string | null;
  description?: string | null;
  metadata: PlannerTask | StudySessionItem | CalendarEventRow;
}

export interface CalendarFilterState {
  showTasks: boolean;
  showSessions: boolean;
  showEvents: boolean;
  eventTypes: CalendarEventType[];
  searchQuery?: string;
  selectedSubject?: string;
}

export interface CreateEventFormValues {
  title: string;
  description: string;
  startDate: string;   // YYYY-MM-DD
  startTime: string;   // HH:mm
  endDate: string;     // YYYY-MM-DD
  endTime: string;     // HH:mm
  allDay: boolean;
  location: string;
  eventType: CalendarEventType;
}
