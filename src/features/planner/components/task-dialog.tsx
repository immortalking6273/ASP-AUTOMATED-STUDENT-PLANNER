"use client";

import * as React from "react";
import { X, Check, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlannerTask, TaskPriority, TaskStatus } from "../types";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task?: PlannerTask | null;
  subjects: string[];
  onSave: (payload: {
    title: string;
    description?: string;
    subject?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
    estimatedMinutes?: number;
  }) => Promise<void>;
}

export function TaskDialog({ isOpen, onClose, task, subjects, onSave }: TaskDialogProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = React.useState("");
  const [estimatedMinutes, setEstimatedMinutes] = React.useState(30);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Sync state when dialog opens
  React.useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setSubject(task.subject || "");
      setPriority(task.priority || "medium");
      setStatus(task.status || "todo");
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
      setEstimatedMinutes(task.estimatedMinutes || 30);
    } else {
      setTitle("");
      setDescription("");
      setSubject("");
      setPriority("medium");
      setStatus("todo");
      setDueDate("");
      setEstimatedMinutes(30);
    }
    setErrorMsg(null);
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Task title is required.");
      return;
    }

    if (estimatedMinutes < 0) {
      setErrorMsg("Estimated study time cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        subject: subject.trim() || undefined,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        estimatedMinutes: Number(estimatedMinutes) || 30,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5 text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-extrabold text-base text-foreground">
            {task ? "Edit Study Task" : "Create New Task"}
          </h3>
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
            <label className="text-muted-foreground font-semibold">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete Java Inheritance Assignment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-muted-foreground font-semibold">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Add task notes or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Subject & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subject */}
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Subject</label>
              <input
                type="text"
                placeholder="e.g. Java, DPCO, Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                list="subject-suggestions"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <datalist id="subject-suggestions">
                {subjects.map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status, Due Date & Estimated Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status */}
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Est Minutes */}
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold">Est Time (Mins)</label>
              <input
                type="number"
                min={0}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
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
              {isSubmitting ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
