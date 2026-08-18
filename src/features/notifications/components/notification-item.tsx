"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NotificationRow } from "../types";
import {
  CheckSquare,
  AlertTriangle,
  Calendar,
  HelpCircle,
  Layers,
  Sparkles,
  Info,
  Trash2,
  Check,
} from "lucide-react";

interface NotificationItemProps {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClosePopover?: () => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClosePopover,
}: NotificationItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }

    if (onClosePopover) onClosePopover();

    // Deep link routing based on entity_type
    const type = notification.entity_type || notification.type;
    if (type === "task" || type === "task_due" || type === "task_overdue" || type === "planner") {
      router.push("/planner");
    } else if (type === "study_session" || type === "calendar") {
      router.push("/calendar");
    } else if (type === "quiz" || type === "quiz_reminder") {
      router.push("/quizzes");
    } else if (type === "flashcard" || type === "flashcard_review") {
      router.push("/flashcards");
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "task_overdue":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "task_due":
        return <CheckSquare className="h-4 w-4 text-amber-400" />;
      case "study_session":
        return <Calendar className="h-4 w-4 text-violet-400" />;
      case "quiz_reminder":
        return <HelpCircle className="h-4 w-4 text-indigo-400" />;
      case "flashcard_review":
        return <Layers className="h-4 w-4 text-emerald-400" />;
      case "ai_reminder":
        return <Sparkles className="h-4 w-4 text-violet-300 animate-pulse" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formattedDate = new Date(notification.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
        !notification.is_read
          ? "border-primary/30 bg-primary/10 shadow-xs"
          : "border-border/60 bg-card/60 hover:bg-accent/50"
      }`}
    >
      <div className="flex items-start gap-3 overflow-hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background border border-border shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex flex-col min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className={`text-xs font-bold truncate ${!notification.is_read ? "text-foreground font-black" : "text-foreground/90"}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <span className="text-[10px] text-muted-foreground/70 pt-0.5">
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {!notification.is_read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            title="Mark as read"
            className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          title="Delete notification"
          className="p-1 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
