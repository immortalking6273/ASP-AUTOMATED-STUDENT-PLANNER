"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarFilterState, CalendarEventType } from "../types";
import { Filter, X } from "lucide-react";

interface CalendarFiltersProps {
  filters: CalendarFilterState;
  onChange: (filters: CalendarFilterState) => void;
  subjects?: string[];
}

const EVENT_TYPES: { value: CalendarEventType; label: string; color: string }[] = [
  { value: "study",      label: "Study",      color: "bg-violet-500/20 border-violet-500/40 text-violet-300" },
  { value: "academic",   label: "Academic",   color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
  { value: "exam",       label: "Exam",       color: "bg-red-500/20 border-red-500/40 text-red-300" },
  { value: "assignment", label: "Assignment", color: "bg-amber-500/20 border-amber-500/40 text-amber-300" },
  { value: "meeting",    label: "Meeting",    color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" },
  { value: "personal",   label: "Personal",   color: "bg-pink-500/20 border-pink-500/40 text-pink-300" },
  { value: "other",      label: "Other",      color: "bg-muted/40 border-border text-muted-foreground" },
];

function Toggle({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all",
        active
          ? "shadow-sm scale-105"
          : "opacity-50 hover:opacity-80",
        className
      )}
    >
      {children}
    </button>
  );
}

export function CalendarFilters({ filters, onChange, subjects = [] }: CalendarFiltersProps) {
  const [open, setOpen] = React.useState(false);

  const hasActiveFilters =
    !filters.showTasks ||
    !filters.showSessions ||
    !filters.showEvents ||
    filters.eventTypes.length > 0 ||
    Boolean(filters.searchQuery?.trim()) ||
    Boolean(filters.selectedSubject && filters.selectedSubject !== "all");

  const resetFilters = () =>
    onChange({
      showTasks: true,
      showSessions: true,
      showEvents: true,
      eventTypes: [],
      searchQuery: "",
      selectedSubject: "all",
    });

  const toggleEventType = (type: CalendarEventType) => {
    const types = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter((t) => t !== type)
      : [...filters.eventTypes, type];
    onChange({ ...filters, eventTypes: types });
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Search Input inline */}
      <div className="relative hidden sm:block">
        <Input
          type="text"
          placeholder="Search calendar…"
          value={filters.searchQuery || ""}
          onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
          className="h-8 w-40 md:w-52 rounded-xl text-xs bg-card/80 pr-7"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onChange({ ...filters, searchQuery: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all",
          open || hasActiveFilters
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-accent/70 hover:text-foreground"
        )}
      >
        <Filter className="h-3.5 w-3.5" />
        Filter
        {hasActiveFilters && (
          <span className="ml-0.5 h-4 w-4 rounded-full bg-primary text-[9px] text-primary-foreground flex items-center justify-center font-bold">
            !
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground">Filter Calendar</span>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden mb-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search tasks, sessions, events…"
              value={filters.searchQuery || ""}
              onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
              className="h-8 rounded-xl text-xs"
            />
          </div>

          {/* Subject Filter */}
          {subjects.length > 0 && (
            <div className="mb-3">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Subject
              </label>
              <select
                value={filters.selectedSubject || "all"}
                onChange={(e) => onChange({ ...filters, selectedSubject: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Source toggles */}
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Show</p>
            <div className="flex flex-wrap gap-2">
              <Toggle
                active={filters.showTasks}
                onClick={() => onChange({ ...filters, showTasks: !filters.showTasks })}
                className="bg-primary/15 border-primary/30 text-primary"
              >
                Tasks
              </Toggle>
              <Toggle
                active={filters.showSessions}
                onClick={() => onChange({ ...filters, showSessions: !filters.showSessions })}
                className="bg-violet-500/15 border-violet-500/30 text-violet-300"
              >
                Study Sessions
              </Toggle>
              <Toggle
                active={filters.showEvents}
                onClick={() => onChange({ ...filters, showEvents: !filters.showEvents })}
                className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              >
                Events
              </Toggle>
            </div>
          </div>

          {/* Event type filter */}
          {filters.showEvents && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Event Types (all if none selected)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map(({ value, label, color }) => (
                  <Toggle
                    key={value}
                    active={filters.eventTypes.includes(value)}
                    onClick={() => toggleEventType(value)}
                    className={color}
                  >
                    {label}
                  </Toggle>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
