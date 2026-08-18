"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarItem } from "../types";
import { CheckSquare, Clock, Calendar, Tag } from "lucide-react";

interface CalendarAgendaViewProps {
  currentDate: Date;
  filteredItems: CalendarItem[];
  onItemClick: (item: CalendarItem) => void;
}

function formatDay(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isToday(d: Date) { return isSameDay(d, new Date()); }

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const TYPE_BG: Record<string, string> = {
  task:          "bg-primary/10 border-primary/30",
  study_session: "bg-violet-500/10 border-violet-500/30",
  event:         "bg-emerald-500/10 border-emerald-500/30",
};
const TYPE_ICON_COLOR: Record<string, string> = {
  task:          "text-primary",
  study_session: "text-violet-400",
  event:         "text-emerald-400",
};

function TypeIcon({ type }: { type: string }) {
  const cls = cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", TYPE_ICON_COLOR[type] || "text-muted-foreground");
  if (type === "task") return <CheckSquare className={cls} />;
  if (type === "study_session") return <Clock className={cls} />;
  return <Calendar className={cls} />;
}

export function CalendarAgendaView({
  currentDate,
  filteredItems,
  onItemClick,
}: CalendarAgendaViewProps) {
  // Show 30 days from currentDate
  const days: Date[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const grouped = React.useMemo(() => {
    return days.map((day) => ({
      day,
      items: filteredItems.filter((item) => {
        const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day); dayEnd.setHours(23, 59, 59, 999);
        if (item.allDay) return item.start <= dayEnd && item.end >= dayStart;
        return item.start >= dayStart && item.start <= dayEnd;
      }).sort((a, b) => a.start.getTime() - b.start.getTime()),
    })).filter((g) => g.items.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems, currentDate.toDateString()]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-24 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-semibold text-muted-foreground">No events in the next 30 days</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Add tasks, study sessions, or events to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 py-2">
      {grouped.map(({ day, items }) => (
        <div key={day.toISOString()}>
          {/* Date header */}
          <div
            className={cn(
              "sticky top-0 z-10 flex items-center gap-3 px-4 py-2 border-b border-border",
              isToday(day)
                ? "bg-primary/10 border-primary/20"
                : "bg-card/80 backdrop-blur-sm"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold flex-shrink-0",
                isToday(day) ? "bg-primary text-primary-foreground" : "bg-accent text-foreground"
              )}
            >
              {day.getDate()}
            </span>
            <div>
              <div className={cn("text-sm font-bold", isToday(day) ? "text-primary" : "text-foreground")}>
                {isToday(day) ? "Today" : day.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {day.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 px-4 pt-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className={cn(
                  "w-full text-left flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all hover:scale-[1.005] hover:shadow-md",
                  TYPE_BG[item.type] || TYPE_BG.event,
                  item.type === "task" && item.completed && "opacity-50"
                )}
              >
                <TypeIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate text-foreground", item.type === "task" && item.completed && "line-through")}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {!item.allDay && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(item.start)} – {formatTime(item.end)}
                      </span>
                    )}
                    {item.allDay && (
                      <span className="text-[10px] text-muted-foreground">All day</span>
                    )}
                    {item.subject && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Tag className="h-2.5 w-2.5" /> {item.subject}
                      </span>
                    )}
                  </div>
                </div>
                {item.type === "task" && item.completed && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex-shrink-0">Done</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
