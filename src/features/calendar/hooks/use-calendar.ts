"use client";

import * as React from "react";
import { CalendarItem, CalendarView, CalendarFilterState, CalendarEventRow } from "../types";
import { PlannerTask, StudySessionItem } from "@/features/planner/types";
import { toast } from "@/components/ui/toast";

// ─── date helpers ──────────────────────────────────────────────────────────────

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // shift so Monday=0
  const result = new Date(d);
  result.setDate(d.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}
function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const result = new Date(start);
  result.setDate(start.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function getRange(view: CalendarView, current: Date): { start: Date; end: Date } {
  switch (view) {
    case "week":
      return { start: startOfWeek(current), end: endOfWeek(current) };
    case "day":
      return { start: startOfDay(current), end: endOfDay(current) };
    case "agenda":
      return { start: startOfDay(current), end: endOfDay(new Date(current.getTime() + 30 * 86400000)) };
    case "month":
    default: {
      // include 6 extra days on each side for the grid padding
      const s = startOfMonth(current);
      const e = endOfMonth(current);
      const gridStart = startOfWeek(s);
      const gridEnd = endOfWeek(e);
      return { start: gridStart, end: gridEnd };
    }
  }
}

// ─── normalise DB rows into CalendarItems ──────────────────────────────────────

function normaliseTasks(tasks: PlannerTask[]): CalendarItem[] {
  return tasks
    .filter((t) => t.dueDate)
    .map((t) => {
      const due = new Date(t.dueDate!);
      return {
        id: `task-${t.id}`,
        title: t.title,
        start: due,
        end: due,
        allDay: true,
        type: "task" as const,
        completed: t.completed,
        subject: t.subject,
        description: t.description,
        metadata: t,
      };
    });
}

function normaliseSessions(sessions: StudySessionItem[]): CalendarItem[] {
  return sessions.map((s) => ({
    id: `session-${s.id}`,
    title: s.title,
    start: new Date(s.startTime),
    end: new Date(s.endTime),
    allDay: false,
    type: "study_session" as const,
    subject: s.subject,
    description: s.notes,
    metadata: s,
  }));
}

function normaliseEvents(events: CalendarEventRow[]): CalendarItem[] {
  return events.map((e) => ({
    id: `event-${e.id}`,
    title: e.title,
    start: e.start_time ? new Date(e.start_time) : new Date(e.created_at),
    end: e.end_time ? new Date(e.end_time) : new Date(e.created_at),
    allDay: e.all_day,
    type: "event" as const,
    eventType: e.event_type,
    location: e.location,
    description: e.description,
    metadata: e,
  }));
}

function applyFilters(items: CalendarItem[], filters: CalendarFilterState): CalendarItem[] {
  return items.filter((item) => {
    if (item.type === "task" && !filters.showTasks) return false;
    if (item.type === "study_session" && !filters.showSessions) return false;
    if (item.type === "event") {
      if (!filters.showEvents) return false;
      if (
        filters.eventTypes.length > 0 &&
        item.eventType &&
        !filters.eventTypes.includes(item.eventType)
      )
        return false;
    }

    if (filters.selectedSubject && filters.selectedSubject !== "all") {
      if (!item.subject || item.subject.toLowerCase() !== filters.selectedSubject.toLowerCase()) {
        return false;
      }
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubject = item.subject?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLocation = item.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchDesc && !matchLocation) {
        return false;
      }
    }

    return true;
  });
}

// ─── hook ──────────────────────────────────────────────────────────────────────

export function useCalendar(workspaceId: string | null) {
  const [view, setView] = React.useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [allItems, setAllItems] = React.useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<CalendarFilterState>({
    showTasks: true,
    showSessions: true,
    showEvents: true,
    eventTypes: [],
  });

  const { start: rangeStart, end: rangeEnd } = React.useMemo(
    () => getRange(view, currentDate),
    [view, currentDate]
  );

  const loadData = React.useCallback(async () => {
    if (!workspaceId) {
      setAllItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startISO = rangeStart.toISOString();
      const endISO = rangeEnd.toISOString();

      const [tasksRes, sessionsRes, eventsRes] = await Promise.all([
        fetch(`/api/calendar/data?workspaceId=${workspaceId}&type=tasks&start=${startISO}&end=${endISO}`),
        fetch(`/api/calendar/data?workspaceId=${workspaceId}&type=sessions&start=${startISO}&end=${endISO}`),
        fetch(`/api/calendar/data?workspaceId=${workspaceId}&type=events&start=${startISO}&end=${endISO}`),
      ]);

      const [tasksData, sessionsData, eventsData] = await Promise.all([
        tasksRes.ok ? tasksRes.json() : { tasks: [] },
        sessionsRes.ok ? sessionsRes.json() : { sessions: [] },
        eventsRes.ok ? eventsRes.json() : { events: [] },
      ]);

      const normalised: CalendarItem[] = [
        ...normaliseTasks(tasksData.tasks || []),
        ...normaliseSessions(sessionsData.sessions || []),
        ...normaliseEvents(eventsData.events || []),
      ];

      setAllItems(normalised);
    } catch (err: any) {
      setError("Unable to load your calendar. Please try again.");
      console.error("[useCalendar] load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, rangeStart.toISOString(), rangeEnd.toISOString()]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = React.useMemo(
    () => applyFilters(allItems, filters),
    [allItems, filters]
  );

  // ─── navigation ─────────────────────────────────────────────────────────────

  const goToToday = React.useCallback(() => setCurrentDate(new Date()), []);

  const goToPrev = React.useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "month") d.setMonth(d.getMonth() - 1);
      else if (view === "week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  }, [view]);

  const goToNext = React.useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "month") d.setMonth(d.getMonth() + 1);
      else if (view === "week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  }, [view]);

  const goToDate = React.useCallback((date: Date) => setCurrentDate(date), []);

  // ─── event CRUD via API ─────────────────────────────────────────────────────

  const createEvent = React.useCallback(
    async (payload: {
      title: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      allDay?: boolean;
      location?: string;
      eventType?: string;
    }) => {
      if (!workspaceId) return;
      try {
        const res = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId, ...payload }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Unable to create this event.");
        }
        toast.success("Event created");
        await loadData();
      } catch (err: any) {
        toast.error(err.message || "Unable to create this event.");
        throw err;
      }
    },
    [workspaceId, loadData]
  );

  const updateEvent = React.useCallback(
    async (
      eventId: string,
      payload: {
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
        allDay?: boolean;
        location?: string;
        eventType?: string;
      }
    ) => {
      try {
        const res = await fetch(`/api/calendar/events/${eventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Unable to update this event.");
        }
        toast.success("Event updated");
        await loadData();
      } catch (err: any) {
        toast.error(err.message || "Unable to update this event.");
        throw err;
      }
    },
    [loadData]
  );

  const deleteEvent = React.useCallback(
    async (eventId: string) => {
      try {
        const res = await fetch(`/api/calendar/events/${eventId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Unable to delete this event.");
        }
        toast.success("Event deleted");
        await loadData();
      } catch (err: any) {
        toast.error(err.message || "Unable to delete this event.");
        throw err;
      }
    },
    [loadData]
  );

  // ─── helpers for views ──────────────────────────────────────────────────────

  const getItemsForDate = React.useCallback(
    (date: Date): CalendarItem[] => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      return filteredItems.filter((item) => {
        if (item.allDay) {
          return (
            item.start <= dayEnd && item.end >= dayStart
          );
        }
        return item.start >= dayStart && item.start <= dayEnd;
      });
    },
    [filteredItems]
  );

  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((it) => {
      if (it.subject?.trim()) set.add(it.subject.trim());
    });
    return Array.from(set).sort();
  }, [allItems]);

  return {
    view,
    setView,
    currentDate,
    goToToday,
    goToPrev,
    goToNext,
    goToDate,
    rangeStart,
    rangeEnd,
    filteredItems,
    subjects,
    isLoading,
    error,
    filters,
    setFilters,
    createEvent,
    updateEvent,
    deleteEvent,
    getItemsForDate,
    refresh: loadData,
  };
}
