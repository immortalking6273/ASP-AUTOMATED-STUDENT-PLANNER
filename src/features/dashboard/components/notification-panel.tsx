"use client";

import * as React from "react";
import { Bell, CheckCircle2, AlertCircle, Info, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "assignment" | "reminder" | "system" | "ai";
  timestamp: string;
  isRead: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Assignment Due Tomorrow",
    message: "Database Design Schema Submission is due in 24 hours.",
    type: "assignment",
    timestamp: "10 mins ago",
    isRead: false,
  },
  {
    id: "2",
    title: "AI Study Assistant Active",
    message: "New RAG document summaries generated for your uploaded lecture PDF.",
    type: "ai",
    timestamp: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    title: "System Update",
    message: "Module 3 Supabase PostgreSQL migrations deployed successfully.",
    type: "system",
    timestamp: "3 hours ago",
    isRead: true,
  },
];

export interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = React.useState(SAMPLE_NOTIFICATIONS);

  if (!isOpen) return null;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "assignment":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      case "ai":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case "reminder":
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="absolute right-4 top-16 z-50 w-80 sm:w-96 rounded-2xl border bg-popover p-4 shadow-xl text-popover-foreground animate-fadeIn">
      <div className="flex items-center justify-between border-b pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">Notifications</h3>
          <Badge variant="secondary" className="text-[10px] py-0 px-2">
            {items.filter((i) => !i.isRead).length} new
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-accent text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-xl p-3 text-xs transition-colors border",
              item.isRead ? "bg-card/40 border-transparent" : "bg-accent/40 border-primary/20"
            )}
          >
            <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{item.title}</span>
                <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
