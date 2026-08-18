"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarItem } from "../types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface CalendarWeekViewProps {
  currentDate: Date;
  getItemsForDate: (date: Date) => CalendarItem[];
  onItemClick: (item: CalendarItem) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const result = new Date(d);
  result.setDate(d.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isToday(d: Date) { return isSameDay(d, new Date()); }

function hourLabel(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

function eventTopPercent(item: CalendarItem): number {
  const h = item.start.getHours() + item.start.getMinutes() / 60;
  return (h / 24) * 100;
}

function eventHeightPercent(item: CalendarItem): number {
  const dur = (item.end.getTime() - item.start.getTime()) / (1000 * 60 * 60);
  return Math.max((dur / 24) * 100, 1.5);
}

const TYPE_COLORS: Record<string, string> = {
  task:          "bg-primary/20 border-primary/50 text-primary",
  study_session: "bg-violet-500/20 border-violet-500/50 text-violet-300",
  event:         "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
};

export function CalendarWeekView({
  currentDate,
  getItemsForDate,
  onItemClick,
  onSlotClick,
}: CalendarWeekViewProps) {
  const CELL_HEIGHT = 48; // px per hour
  const total = CELL_HEIGHT * 24;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // scroll to 7 AM on mount
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = CELL_HEIGHT * 7;
    }
  }, []);

  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const today = new Date();
  const nowTop = (today.getHours() + today.getMinutes() / 60) / 24 * total;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day headers */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
        <div /> {/* spacer for time column */}
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "py-2 text-center border-l border-border",
              isToday(day) && "bg-primary/5"
            )}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {DAY_LABELS[i]}
            </div>
            <div
              className={cn(
                "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold",
                isToday(day)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[56px_repeat(7,1fr)]" style={{ height: total }}>
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ top: h * CELL_HEIGHT }}
                className="absolute right-2 -translate-y-2 text-[10px] text-muted-foreground select-none"
              >
                {hourLabel(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const items = getItemsForDate(day).filter((it) => !it.allDay);
            const dayIsToday = isSameDay(day, today);
            return (
              <div
                key={di}
                className="relative border-l border-border"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const hour = Math.floor((y / total) * 24);
                  onSlotClick(day, Math.max(0, Math.min(23, hour)));
                }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{ top: h * CELL_HEIGHT }}
                    className="absolute left-0 right-0 border-t border-border/40 pointer-events-none"
                  />
                ))}

                {/* Current time indicator */}
                {dayIsToday && (
                  <div
                    style={{ top: nowTop }}
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                  >
                    <div className="h-0.5 bg-red-500" />
                    <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
                  </div>
                )}

                {/* Events */}
                {items.map((item) => {
                  const top = eventTopPercent(item) / 100 * total;
                  const height = Math.max(eventHeightPercent(item) / 100 * total, 20);
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                      style={{ top, height, left: 2, right: 2 }}
                      className={cn(
                        "absolute rounded-lg border px-1.5 py-0.5 text-left text-[10px] font-medium cursor-pointer overflow-hidden z-20 hover:opacity-90 transition-opacity",
                        TYPE_COLORS[item.type] || TYPE_COLORS.event
                      )}
                    >
                      <div className="font-semibold truncate">{item.title}</div>
                      <div className="opacity-70">
                        {item.start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
