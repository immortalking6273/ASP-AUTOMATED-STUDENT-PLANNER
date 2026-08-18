"use client";

import * as React from "react";
import { X, Check, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudySessionItem } from "../types";

interface StudySessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session?: StudySessionItem | null;
  subjects: string[];
  onSave: (payload: {
    title: string;
    subject?: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => Promise<void>;
}

export function StudySessionDialog({
  isOpen,
  onClose,
  session,
  subjects,
  onSave,
}: StudySessionDialogProps) {
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [date, setDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = React.useState("18:00");
  const [endTime, setEndTime] = React.useState("19:00");
  const [notes, setNotes] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (session) {
      setTitle(session.title || "");
      setSubject(session.subject || "");
      setNotes(session.notes || "");

      if (session.startTime) {
        const s = new Date(session.startTime);
        setDate(s.toISOString().split("T")[0]);
        setStartTime(s.toTimeString().slice(0, 5));
      }
      if (session.endTime) {
        const e = new Date(session.endTime);
        setEndTime(e.toTimeString().slice(0, 5));
      }
    } else {
      setTitle("");
      setSubject("");
      setDate(new Date().toISOString().split("T")[0]);
      setStartTime("18:00");
      setEndTime("19:00");
      setNotes("");
    }
    setErrorMsg(null);
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Session title is required.");
      return;
    }

    const startIso = `${date}T${startTime}:00.000Z`;
    const endIso = `${date}T${endTime}:00.000Z`;

    if (new Date(endIso) <= new Date(startIso)) {
      setErrorMsg("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        subject: subject.trim() || undefined,
        startTime: startIso,
        endTime: endIso,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save study session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="font-extrabold text-base text-foreground">
              {session ? "Edit Study Session" : "Schedule Study Session"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-muted-foreground font-semibold">Session Title *</label>
            <input
              type="text"
              placeholder="e.g. Java Revision & Practice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-muted-foreground font-semibold">Subject</label>
            <input
              type="text"
              placeholder="e.g. Java, Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              list="session-subjects"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
            <datalist id="session-subjects">
              {subjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-muted-foreground font-semibold">Session Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="What do you plan to cover in this session?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={<Check className="h-4 w-4" />}
              className="rounded-xl text-xs font-semibold shadow-xs"
            >
              {isSubmitting ? "Saving..." : session ? "Save Changes" : "Schedule Session"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
