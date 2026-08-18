import { BaseDatabaseService } from "./base-service";

export type CalendarEventType =
  | "study"
  | "academic"
  | "exam"
  | "assignment"
  | "meeting"
  | "personal"
  | "other";

export interface CalendarEventRow {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  location: string | null;
  event_type: CalendarEventType;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarEventPayload {
  workspaceId: string;
  title: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  location?: string | null;
  eventType?: CalendarEventType;
}

export interface UpdateCalendarEventPayload {
  title?: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  location?: string | null;
  eventType?: CalendarEventType;
}

export class CalendarEventsService extends BaseDatabaseService {
  /**
   * Fetch calendar events for a workspace within a date range
   */
  static async getEvents(
    workspaceId: string,
    rangeStart: string,
    rangeEnd: string,
    client?: any
  ): Promise<CalendarEventRow[]> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("workspace_id", workspaceId)
        .or(`all_day.eq.true,and(start_time.gte.${rangeStart},start_time.lte.${rangeEnd})`)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data || []) as CalendarEventRow[];
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Fetch a single calendar event by ID
   */
  static async getEvent(eventId: string, client?: any): Promise<CalendarEventRow | null> {
    try {
      const supabase = client || this.getSupabase();
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data as CalendarEventRow | null;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Create a new calendar event
   */
  static async createEvent(
    payload: CreateCalendarEventPayload,
    client?: any
  ): Promise<CalendarEventRow> {
    try {
      const supabase = client || this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Authenticated user required.");
      if (!payload.workspaceId) throw new Error("Workspace ID is required.");
      if (!payload.title?.trim()) throw new Error("Event title is required.");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          workspace_id: payload.workspaceId,
          user_id: user.id,
          title: payload.title.trim(),
          description: payload.description?.trim() || null,
          start_time: payload.startTime || null,
          end_time: payload.endTime || null,
          all_day: payload.allDay ?? false,
          location: payload.location?.trim() || null,
          event_type: payload.eventType || "other",
        })
        .select()
        .single();

      if (error) throw error;
      return data as CalendarEventRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Update an existing calendar event
   */
  static async updateEvent(
    eventId: string,
    payload: UpdateCalendarEventPayload,
    client?: any
  ): Promise<CalendarEventRow> {
    try {
      const supabase = client || this.getSupabase();
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (payload.title !== undefined) updateData.title = payload.title.trim();
      if (payload.description !== undefined)
        updateData.description = payload.description?.trim() || null;
      if (payload.startTime !== undefined) updateData.start_time = payload.startTime || null;
      if (payload.endTime !== undefined) updateData.end_time = payload.endTime || null;
      if (payload.allDay !== undefined) updateData.all_day = payload.allDay;
      if (payload.location !== undefined)
        updateData.location = payload.location?.trim() || null;
      if (payload.eventType !== undefined) updateData.event_type = payload.eventType;

      const { data, error } = await supabase
        .from("calendar_events")
        .update(updateData)
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;
      return data as CalendarEventRow;
    } catch (err) {
      throw this.transformError(err);
    }
  }

  /**
   * Delete a calendar event
   */
  static async deleteEvent(eventId: string, client?: any): Promise<void> {
    try {
      const supabase = client || this.getSupabase();
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    } catch (err) {
      throw this.transformError(err);
    }
  }
}
