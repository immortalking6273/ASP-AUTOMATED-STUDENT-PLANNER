"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Calendar,
  List,
  Clock,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarView } from "../types";

interface CalendarHeaderProps {
  view: CalendarView;
  currentDate: Date;
  onViewChange: (v: CalendarView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAddEvent: () => void;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatRange(view: CalendarView, date: Date): string {
  const m = MONTH_NAMES[date.getMonth()];
  const y = date.getFullYear();

  if (view === "month" || view === "agenda") return `${m} ${y}`;

  if (view === "week") {
    // Monday of the week
    const day = date.getDay();
    const diff = (day + 6) % 7;
    const mon = new Date(date); mon.setDate(date.getDate() - diff);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const startLabel = `${MONTH_NAMES[mon.getMonth()]} ${mon.getDate()}`;
    const endLabel =
      mon.getMonth() === sun.getMonth()
        ? `${sun.getDate()}, ${sun.getFullYear()}`
        : `${MONTH_NAMES[sun.getMonth()]} ${sun.getDate()}, ${sun.getFullYear()}`;
    return `${startLabel} – ${endLabel}`;
  }

  // day
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

const VIEWS: { id: CalendarView; label: string; Icon: React.FC<any> }[] = [
  { id: "month",  label: "Month",  Icon: CalendarDays },
  { id: "week",   label: "Week",   Icon: Calendar },
  { id: "day",    label: "Day",    Icon: Clock },
  { id: "agenda", label: "Agenda", Icon: List },
];

export function CalendarHeader({
  view,
  currentDate,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onAddEvent,
}: CalendarHeaderProps) {
  const rangeLabel = formatRange(view, currentDate);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 py-3 border-b border-border mb-4">
      {/* Left — nav + title */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          aria-label="Previous"
          className="p-1.5 rounded-lg hover:bg-accent/70 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          aria-label="Next"
          className="p-1.5 rounded-lg hover:bg-accent/70 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-accent/70 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Today
        </button>
        <h2 className="ml-2 text-base font-extrabold text-foreground tracking-tight">
          {rangeLabel}
        </h2>
      </div>

      {/* Right — view switcher + add */}
      <div className="flex items-center gap-2">
        {/* View tabs */}
        <div className="flex rounded-xl border border-border overflow-hidden">
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              aria-label={label}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                view === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <Button size="sm" onClick={onAddEvent} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Event</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}
