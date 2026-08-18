"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarItem } from "../types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarMonthViewProps {
  currentDate: Date;
  getItemsForDate: (date: Date) => CalendarItem[];
  onDayClick: (date: Date) => void;
  onItemClick: (item: CalendarItem) => void;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isToday(d: Date) {
  return isSameDay(d, new Date());
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const result = new Date(d);
  result.setDate(d.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function buildMonthGrid(date: Date): Date[] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const gridStart = startOfWeek(firstDay);
  const gridEnd = new Date(gridStart);
  // Always 6 weeks = 42 cells
  gridEnd.setDate(gridStart.getDate() + 41);

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  study: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  academic: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  exam: "bg-red-500/20 text-red-300 border-red-500/40",
  assignment: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  meeting: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  personal: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  other: "bg-muted/40 text-muted-foreground border-border",
};

function itemColor(item: CalendarItem): string {
  if (item.type === "task") {
    if (item.completed) return "bg-muted/30 text-muted-foreground line-through border-border";
    const now = new Date();
    if (item.start < now && !item.completed)
      return "bg-red-500/15 text-red-300 border-red-500/30";
    return "bg-primary/15 text-primary border-primary/30";
  }
  if (item.type === "study_session") return "bg-violet-500/15 text-violet-300 border-violet-500/30";
  return EVENT_TYPE_COLORS[item.eventType || "other"] || EVENT_TYPE_COLORS.other;
}

export function CalendarMonthView({
  currentDate,
  getItemsForDate,
  onDayClick,
  onItemClick,
}: CalendarMonthViewProps) {
  const days = buildMonthGrid(currentDate);
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* 6×7 grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 divide-x divide-y divide-border">
        {days.map((day, idx) => {
          const items = getItemsForDate(day);
          const isCurrentMonth = day.getMonth() === currentMonth;
          const dayIsToday = isToday(day);
          const MAX_VISIBLE = 3;
          const visible = items.slice(0, MAX_VISIBLE);
          const overflow = items.length - MAX_VISIBLE;

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "relative p-1.5 min-h-[80px] cursor-pointer transition-colors",
                isCurrentMonth ? "bg-card hover:bg-accent/40" : "bg-muted/10 hover:bg-muted/20",
                dayIsToday && "ring-1 ring-inset ring-primary/50"
              )}
            >
              {/* Date number */}
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold mb-1",
                  dayIsToday
                    ? "bg-primary text-primary-foreground"
                    : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {day.getDate()}
              </span>

              {/* Events */}
              <div className="space-y-0.5">
                {visible.map((item) => (
                  <button
                    key={item.id}
                    onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                    className={cn(
                      "w-full text-left truncate rounded px-1.5 py-0.5 text-[10px] font-medium border cursor-pointer transition-opacity hover:opacity-80",
                      itemColor(item)
                    )}
                    title={item.title}
                  >
                    {!item.allDay && (
                      <span className="mr-1 opacity-70">
                        {item.start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                    )}
                    {item.title}
                  </button>
                ))}
                {overflow > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                    className="w-full text-left text-[10px] text-muted-foreground hover:text-foreground px-1.5 cursor-pointer"
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
