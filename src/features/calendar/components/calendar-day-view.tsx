"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarItem } from "../types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface CalendarDayViewProps {
  currentDate: Date;
  getItemsForDate: (date: Date) => CalendarItem[];
  onItemClick: (item: CalendarItem) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

function hourLabel(h: number) {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

const TYPE_COLORS: Record<string, string> = {
  task:          "bg-primary/20 border-primary/50 text-primary",
  study_session: "bg-violet-500/20 border-violet-500/50 text-violet-300",
  event:         "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
};

export function CalendarDayView({
  currentDate,
  getItemsForDate,
  onItemClick,
  onSlotClick,
}: CalendarDayViewProps) {
  const CELL_HEIGHT = 64; // px per hour
  const total = CELL_HEIGHT * 24;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = CELL_HEIGHT * 7;
  }, []);

  const items = getItemsForDate(currentDate).filter((it) => !it.allDay);
  const allDayItems = getItemsForDate(currentDate).filter((it) => it.allDay);

  const now = new Date();
  const nowTop = (now.getHours() + now.getMinutes() / 60) / 24 * total;

  const dayLabel = currentDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day header */}
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">{dayLabel}</h3>
        {allDayItems.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {allDayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-medium border cursor-pointer transition-opacity hover:opacity-80",
                  item.type === "task"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                )}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="relative grid grid-cols-[64px_1fr]"
          style={{ height: total }}
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const y = e.clientY - rect.top;
            const hour = Math.floor((y / total) * 24);
            onSlotClick(currentDate, Math.max(0, Math.min(23, hour)));
          }}
        >
          {/* Hour labels */}
          <div className="relative select-none">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ top: h * CELL_HEIGHT }}
                className="absolute right-2 -translate-y-2 text-[10px] text-muted-foreground"
              >
                {hourLabel(h)}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative border-l border-border">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ top: h * CELL_HEIGHT }}
                className="absolute left-0 right-0 border-t border-border/40 pointer-events-none"
              />
            ))}

            {/* Current time indicator */}
            <div style={{ top: nowTop }} className="absolute left-0 right-0 z-10 pointer-events-none">
              <div className="h-0.5 bg-red-500" />
              <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
            </div>

            {/* Events */}
            {items.map((item) => {
              const startH = item.start.getHours() + item.start.getMinutes() / 60;
              const durH = Math.max(
                (item.end.getTime() - item.start.getTime()) / (1000 * 60 * 60),
                0.25
              );
              const top = (startH / 24) * total;
              const height = Math.max((durH / 24) * total, 24);

              return (
                <button
                  key={item.id}
                  onClick={(e) => { e.stopPropagation(); onItemClick(item); }}
                  style={{ top, height, left: 8, right: 8 }}
                  className={cn(
                    "absolute rounded-xl border px-3 py-1.5 text-left cursor-pointer z-20 hover:opacity-90 transition-opacity",
                    TYPE_COLORS[item.type] || TYPE_COLORS.event
                  )}
                >
                  <div className="text-xs font-bold truncate">{item.title}</div>
                  {item.subject && (
                    <div className="text-[10px] opacity-70 mt-0.5">{item.subject}</div>
                  )}
                  <div className="text-[10px] opacity-60 mt-0.5">
                    {item.start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    {" – "}
                    {item.end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
