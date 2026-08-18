"use client";

import * as React from "react";
import { PlannerTask, TaskPriority } from "../types";
import { Check, Clock, Calendar, MoreVertical, Edit2, Trash2, Tag, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: PlannerTask;
  onToggleCompletion: (taskId: string, completed: boolean) => void;
  onEdit: (task: PlannerTask) => void;
  onDelete: (task: PlannerTask) => void;
}

export function TaskCard({ task, onToggleCompletion, onEdit, onDelete }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const priorityStyles: Record<TaskPriority, { label: string; badge: string }> = {
    urgent: { label: "Urgent", badge: "bg-destructive/15 text-destructive border-destructive/30" },
    high: { label: "High", badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
    medium: { label: "Medium", badge: "bg-primary/15 text-primary border-primary/30" },
    low: { label: "Low", badge: "bg-muted text-muted-foreground border-border" },
  };

  const isCompleted = task.completed || task.status === "completed";

  // Check Overdue status
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  let isOverdue = false;
  let dueText = "";

  if (task.dueDate) {
    const due = new Date(task.dueDate);
    const dueStr = due.toISOString().split("T")[0];

    if (!isCompleted && due < now && dueStr !== todayStr) {
      isOverdue = true;
    }

    if (dueStr === todayStr) {
      dueText = "Due Today";
    } else {
      dueText = due.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-4 rounded-2xl border bg-card transition-all duration-200 shadow-2xs hover:shadow-md",
        isCompleted ? "opacity-60 border-border bg-card/60" : "border-border hover:border-primary/40",
        isOverdue && !isCompleted && "border-destructive/40 bg-destructive/5"
      )}
    >
      {/* Interactive Checkbox */}
      <button
        type="button"
        onClick={() => onToggleCompletion(task.id, !isCompleted)}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer",
          isCompleted
            ? "bg-primary border-primary text-primary-foreground scale-95"
            : "border-muted-foreground/40 hover:border-primary bg-background"
        )}
      >
        {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4
            onClick={() => onEdit(task)}
            className={cn(
              "text-xs sm:text-sm font-bold tracking-tight text-foreground cursor-pointer hover:text-primary transition-colors break-words",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h4>

          {/* Action Menu Button */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-6 z-30 w-36 rounded-xl border border-border bg-popover shadow-xl py-1 text-xs text-popover-foreground animate-in fade-in-0 scale-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent cursor-pointer transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5 text-primary" />
                  <span>Edit Task</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-destructive/15 text-destructive cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Badges & Metadata Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-semibold">
          {/* Priority Badge */}
          <span
            className={cn(
              "px-2 py-0.5 rounded-full border",
              priorityStyles[task.priority]?.badge || priorityStyles.medium.badge
            )}
          >
            {priorityStyles[task.priority]?.label || "Medium"}
          </span>

          {/* Subject Badge */}
          {task.subject && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border bg-secondary text-secondary-foreground">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span>{task.subject}</span>
            </span>
          )}

          {/* Due Date */}
          {dueText && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border",
                isOverdue
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              <span>{dueText}</span>
            </span>
          )}

          {/* Estimated Time */}
          {task.estimatedMinutes && (
            <span className="inline-flex items-center gap-1 text-muted-foreground font-normal">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedMinutes} mins</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
