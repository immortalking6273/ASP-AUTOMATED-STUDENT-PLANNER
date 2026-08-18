"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarItem, CalendarEventRow } from "../types";
import {
  X, Clock, MapPin, Tag, CheckSquare, Calendar,
  BookOpen, Trash2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlannerTask } from "@/features/planner/types";

interface EventDetailPanelProps {
  item: CalendarItem | null;
  onClose: () => void;
  onDeleteEvent?: (eventId: string) => Promise<void>;
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  task: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: <CheckSquare className="h-4 w-4 text-primary" />,
    label: "Task",
  },
  study_session: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    icon: <BookOpen className="h-4 w-4 text-violet-400" />,
    label: "Study Session",
  },
  event: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: <Calendar className="h-4 w-4 text-emerald-400" />,
    label: "Event",
  },
};

export function EventDetailPanel({ item, onClose, onDeleteEvent }: EventDetailPanelProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!item) return null;

  const style = TYPE_STYLES[item.type] || TYPE_STYLES.event;
  const isCalendarEvent = item.type === "event";
  const eventRow = isCalendarEvent ? (item.metadata as CalendarEventRow) : null;
  const taskRow = item.type === "task" ? (item.metadata as PlannerTask) : null;

  const handleDelete = async () => {
    if (!eventRow || !onDeleteEvent) return;
    setIsDeleting(true);
    try {
      await onDeleteEvent(eventRow.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl border shadow-2xl",
          style.bg, style.border,
          "animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            {style.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {style.label}
              {item.eventType && ` · ${item.eventType}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Title */}
          <h3
            className={cn(
              "text-base font-extrabold text-foreground leading-snug",
              item.type === "task" && item.completed && "line-through text-muted-foreground"
            )}
          >
            {item.title}
          </h3>

          {/* Status badge for tasks */}
          {item.type === "task" && taskRow && (
            <div className="flex gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  taskRow.priority === "urgent"
                    ? "bg-red-500/15 text-red-300 border-red-500/30"
                    : taskRow.priority === "high"
                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    : "bg-muted/30 text-muted-foreground border-border"
                )}
              >
                {taskRow.priority.toUpperCase()}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  item.completed
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-primary/15 text-primary border-primary/30"
                )}
              >
                {item.completed ? "Completed" : (taskRow.status || "Todo").replace("_", " ")}
              </span>
            </div>
          )}

          {/* Time */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              {item.allDay
                ? formatDate(item.start)
                : `${formatDateTime(item.start)} – ${item.end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
              }
            </span>
          </div>

          {/* Subject */}
          {item.subject && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{item.subject}</span>
            </div>
          )}

          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{item.location}</span>
            </div>
          )}

          {/* Description / Notes */}
          {item.description && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
              Close
            </Button>
            {isCalendarEvent && onDeleteEvent && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="gap-1.5"
              >
                {isDeleting
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
