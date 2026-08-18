"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { CalendarEventType, CreateEventFormValues } from "../types";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateEventFormValues) => Promise<void>;
  defaultDate?: Date;
  defaultHour?: number;
  title?: string;
}

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: "study",      label: "Study" },
  { value: "academic",   label: "Academic" },
  { value: "exam",       label: "Exam" },
  { value: "assignment", label: "Assignment" },
  { value: "meeting",    label: "Meeting" },
  { value: "personal",   label: "Personal" },
  { value: "other",      label: "Other" },
];

function pad2(n: number): string { return String(n).padStart(2, "0"); }

function dateToInputDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function dateToInputTime(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function EventDialog({
  open,
  onClose,
  onSubmit,
  defaultDate,
  defaultHour,
  title = "Add Event",
}: EventDialogProps) {
  const base = defaultDate ?? new Date();
  const hour = defaultHour ?? base.getHours();
  const end = new Date(base);
  end.setHours(hour + 1);

  const [form, setForm] = React.useState<CreateEventFormValues>({
    title: "",
    description: "",
    startDate: dateToInputDate(base),
    startTime: `${pad2(hour)}:00`,
    endDate: dateToInputDate(end),
    endTime: `${pad2(hour + 1)}:00`,
    allDay: false,
    location: "",
    eventType: "other",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens with new defaults
  React.useEffect(() => {
    if (open) {
      const newBase = defaultDate ?? new Date();
      const newHour = defaultHour ?? newBase.getHours();
      const newEnd = new Date(newBase);
      newEnd.setHours(newHour + 1);
      setForm({
        title: "",
        description: "",
        startDate: dateToInputDate(newBase),
        startTime: `${pad2(newHour)}:00`,
        endDate: dateToInputDate(newEnd),
        endTime: `${pad2(newHour + 1)}:00`,
        allDay: false,
        location: "",
        eventType: "other",
      });
      setError(null);
    }
  }, [open, defaultDate, defaultHour]);

  const set = (key: keyof CreateEventFormValues, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-extrabold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Calculus Exam Prep"
              autoFocus
            />
          </div>

          {/* Event type */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {EVENT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("eventType", value)}
                  className={cn(
                    "rounded-lg border px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all",
                    form.eventType === value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent/70"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={form.allDay}
              onClick={() => set("allDay", !form.allDay)}
              className={cn(
                "relative h-5 w-9 rounded-full border transition-colors cursor-pointer",
                form.allDay ? "bg-primary border-primary" : "bg-muted border-border"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  form.allDay ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
            <span className="text-xs font-medium text-muted-foreground">All day</span>
          </div>

          {/* Dates */}
          {!form.allDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Start</label>
                <Input type="datetime-local"
                  value={`${form.startDate}T${form.startTime}`}
                  onChange={(e) => {
                    const [d, t] = e.target.value.split("T");
                    set("startDate", d); set("startTime", t || "00:00");
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">End</label>
                <Input type="datetime-local"
                  value={`${form.endDate}T${form.endTime}`}
                  onChange={(e) => {
                    const [d, t] = e.target.value.split("T");
                    set("endDate", d); set("endTime", t || "00:00");
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date</label>
                <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Location <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Library Room 2"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Notes <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Any extra details…"
              rows={2}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
