"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import { Loader2, AlertTriangle, Calendar, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCalendar,
  CalendarHeader,
  CalendarMonthView,
  CalendarWeekView,
  CalendarDayView,
  CalendarAgendaView,
  CalendarFilters,
  EventDialog,
  EventDetailPanel,
  AIOptimizationDialog,
  CalendarItem,
  CreateEventFormValues,
} from "@/features/calendar";

// ─── Workspace selector ─────────────────────────────────────────────────────

function WorkspaceSelector({
  workspaces,
  selected,
  onChange,
}: {
  workspaces: WorkspaceRow[];
  selected: string | null;
  onChange: (id: string) => void;
}) {
  if (workspaces.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-1">
      <label htmlFor="cal-workspace" className="text-xs font-semibold text-muted-foreground">
        Workspace:
      </label>
      <select
        id="cal-workspace"
        value={selected || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
      >
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.title}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user } = useAuth();

  // Workspaces
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);
  const [workspacesLoading, setWorkspacesLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    WorkspacesService.getWorkspaces(user.id)
      .then((res) => {
        setWorkspaces(res.data || []);
        if ((res.data || []).length > 0) {
          setSelectedWorkspaceId(res.data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setWorkspacesLoading(false));
  }, [user]);

  const calendar = useCalendar(selectedWorkspaceId);

  // Dialog state
  const [addEventOpen, setAddEventOpen] = React.useState(false);
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = React.useState<Date | undefined>(undefined);
  const [selectedSlotHour, setSelectedSlotHour] = React.useState<number | undefined>(undefined);
  const [selectedItem, setSelectedItem] = React.useState<CalendarItem | null>(null);

  const handleSlotClick = React.useCallback((date: Date, hour: number) => {
    setSelectedSlotDate(date);
    setSelectedSlotHour(hour);
    setAddEventOpen(true);
  }, []);

  const handleDayClick = React.useCallback(
    (date: Date) => {
      calendar.goToDate(date);
      calendar.setView("day");
    },
    [calendar]
  );

  const handleCreateEvent = React.useCallback(
    async (values: CreateEventFormValues) => {
      if (!selectedWorkspaceId) return;

      let startTime: string | undefined;
      let endTime: string | undefined;

      if (!values.allDay) {
        startTime = new Date(`${values.startDate}T${values.startTime}`).toISOString();
        endTime = new Date(`${values.endDate}T${values.endTime}`).toISOString();
      } else {
        // All-day: store start of day in UTC
        startTime = new Date(`${values.startDate}T00:00:00`).toISOString();
        endTime = new Date(`${values.startDate}T23:59:59`).toISOString();
      }

      await calendar.createEvent({
        title: values.title,
        description: values.description || undefined,
        startTime,
        endTime,
        allDay: values.allDay,
        location: values.location || undefined,
        eventType: values.eventType,
      });
    },
    [selectedWorkspaceId, calendar]
  );

  // ─── render guards ──────────────────────────────────────────────────────────

  if (workspacesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <p className="text-sm font-bold text-foreground">No workspaces yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a workspace first to use the Calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-background">
      {/* Page header */}
      <div className="px-4 pt-5 pb-3 border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/25">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-foreground">Calendar</h1>
              <p className="text-[11px] text-muted-foreground">
                Tasks · Study Sessions · Events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiDialogOpen(true)}
              className="h-8 gap-1.5 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Optimize Schedule</span>
            </Button>
            <WorkspaceSelector
              workspaces={workspaces}
              selected={selectedWorkspaceId}
              onChange={setSelectedWorkspaceId}
            />
            <CalendarFilters
              filters={calendar.filters}
              onChange={calendar.setFilters}
              subjects={calendar.subjects}
            />
            <button
              onClick={calendar.refresh}
              disabled={calendar.isLoading}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${calendar.isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar nav header */}
      <div className="px-4 bg-card/40">
        <CalendarHeader
          view={calendar.view}
          currentDate={calendar.currentDate}
          onViewChange={calendar.setView}
          onPrev={calendar.goToPrev}
          onNext={calendar.goToNext}
          onToday={calendar.goToToday}
          onAddEvent={() => {
            setSelectedSlotDate(new Date());
            setSelectedSlotHour(new Date().getHours());
            setAddEventOpen(true);
          }}
        />
      </div>

      {/* Error banner */}
      {calendar.error && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive">{calendar.error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={calendar.refresh}
            className="ml-auto text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading overlay */}
      {calendar.isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Calendar view — fills remaining height */}
      {!calendar.isLoading && (
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="flex flex-col h-full rounded-2xl border border-border bg-card overflow-hidden">
            {calendar.view === "month" && (
              <CalendarMonthView
                currentDate={calendar.currentDate}
                getItemsForDate={calendar.getItemsForDate}
                onDayClick={handleDayClick}
                onItemClick={setSelectedItem}
              />
            )}
            {calendar.view === "week" && (
              <CalendarWeekView
                currentDate={calendar.currentDate}
                getItemsForDate={calendar.getItemsForDate}
                onItemClick={setSelectedItem}
                onSlotClick={handleSlotClick}
              />
            )}
            {calendar.view === "day" && (
              <CalendarDayView
                currentDate={calendar.currentDate}
                getItemsForDate={calendar.getItemsForDate}
                onItemClick={setSelectedItem}
                onSlotClick={handleSlotClick}
              />
            )}
            {calendar.view === "agenda" && (
              <CalendarAgendaView
                currentDate={calendar.currentDate}
                filteredItems={calendar.filteredItems}
                onItemClick={setSelectedItem}
              />
            )}
          </div>
        </div>
      )}

      {/* Add Event Dialog */}
      <EventDialog
        open={addEventOpen}
        onClose={() => setAddEventOpen(false)}
        onSubmit={handleCreateEvent}
        defaultDate={selectedSlotDate}
        defaultHour={selectedSlotHour}
      />

      {/* Event Detail Panel */}
      <EventDetailPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDeleteEvent={async (eventId) => {
          await calendar.deleteEvent(eventId);
        }}
      />

      {/* AI Schedule Optimization Dialog */}
      <AIOptimizationDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        workspaceId={selectedWorkspaceId}
        onSuccess={calendar.refresh}
      />
    </div>
  );
}
