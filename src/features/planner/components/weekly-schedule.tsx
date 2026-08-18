"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit2, Trash2, BookOpen, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlannerTask, StudySessionItem } from "../types";
import { cn } from "@/lib/utils";

interface WeeklyScheduleProps {
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
  tasks: PlannerTask[];
  studySessions: StudySessionItem[];
  onEditTask: (task: PlannerTask) => void;
  onEditSession: (session: StudySessionItem) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function WeeklySchedule({
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  tasks,
  studySessions,
  onEditTask,
  onEditSession,
  onDeleteSession,
}: WeeklyScheduleProps) {
  // Generate 7 days (Mon-Sun) starting from currentWeekStart
  const days = React.useMemo(() => {
    const list: Array<{ date: Date; dateStr: string; dayName: string; formattedDate: string }> = [];
    const base = new Date(currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      list.push({ date: d, dateStr, dayName, formattedDate });
    }
    return list;
  }, [currentWeekStart]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Format week range for header
  const startMonthDay = days[0].formattedDate;
  const endMonthDay = days[6].formattedDate;

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-2xs">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-base text-foreground">Weekly Study Schedule</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {startMonthDay} – {endMonthDay}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetWeek}
            className="rounded-xl text-xs"
          >
            Today
          </Button>

          <div className="flex items-center border border-border rounded-xl bg-background p-0.5">
            <button
              type="button"
              onClick={onPrevWeek}
              className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Next Week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 7 Columns for Days */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {days.map((day) => {
          const isToday = day.dateStr === todayStr;

          // Filter tasks due on this day
          const dayTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate).toISOString().split("T")[0] === day.dateStr;
          });

          // Filter study sessions on this day
          const daySessions = studySessions.filter((s) => {
            if (!s.startTime) return false;
            return new Date(s.startTime).toISOString().split("T")[0] === day.dateStr;
          });

          return (
            <div
              key={day.dateStr}
              className={cn(
                "flex flex-col min-h-[180px] rounded-2xl border p-3 space-y-2.5 transition-colors",
                isToday
                  ? "border-primary/40 bg-primary/5 shadow-2xs"
                  : "border-border/60 bg-background/60"
              )}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs font-extrabold uppercase tracking-wider", isToday ? "text-primary" : "text-muted-foreground")}>
                    {day.dayName}
                  </span>
                  {isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                <span className={cn("text-[11px] font-semibold", isToday ? "text-primary font-bold" : "text-foreground")}>
                  {day.date.getDate()}
                </span>
              </div>

              {/* Day Body Items */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] text-xs">
                {/* 1. Study Sessions */}
                {daySessions.map((session) => {
                  const startFmt = new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  return (
                    <div
                      key={session.id}
                      className="group relative rounded-xl border border-primary/30 bg-primary/10 p-2 text-primary text-[11px] font-semibold space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <BookOpen className="h-3 w-3 shrink-0" />
                          <span className="truncate font-bold text-foreground">{session.title}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            onClick={() => onEditSession(session)}
                            className="p-0.5 rounded-xs hover:bg-primary/20 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onDeleteSession(session.id)}
                            className="p-0.5 rounded-xs hover:bg-destructive/20 text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] opacity-80 font-normal">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{startFmt}</span>
                        {session.subject && <span className="font-bold">• {session.subject}</span>}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Tasks Due on Day */}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className={cn(
                      "rounded-xl border p-2 text-[11px] font-medium space-y-1 cursor-pointer transition-all hover:border-primary/40",
                      task.completed
                        ? "border-border bg-card/40 opacity-50 line-through"
                        : "border-border bg-card shadow-2xs"
                    )}
                  >
                    <div className="flex items-center gap-1 text-foreground">
                      <CheckSquare className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate font-semibold">{task.title}</span>
                    </div>
                    {task.subject && (
                      <div className="text-[9px] text-muted-foreground font-normal">
                        {task.subject}
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty Day State */}
                {daySessions.length === 0 && dayTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[10px] text-muted-foreground/60 italic text-center">
                    No items scheduled
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
