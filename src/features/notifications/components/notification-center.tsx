"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Check, RefreshCw, X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationItem } from "./notification-item";
import { Button } from "@/components/ui/button";

interface NotificationCenterProps {
  workspaceId?: string | null;
}

export function NotificationCenter({ workspaceId = null }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerReminders,
  } = useNotifications(workspaceId);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const badgeDisplay = unreadCount > 9 ? "9+" : unreadCount;

  // Group notifications into Today, Yesterday, Earlier
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const todayItems: typeof notifications = [];
  const yesterdayItems: typeof notifications = [];
  const earlierItems: typeof notifications = [];

  notifications.forEach((n) => {
    const nDate = new Date(n.created_at).toISOString().split("T")[0];
    if (nDate === todayStr) todayItems.push(n);
    else if (nDate === yesterdayStr) yesterdayItems.push(n);
    else earlierItems.push(n);
  });

  return (
    <div className="relative" ref={popoverRef}>
      {/* BELL BUTTON */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm ring-2 ring-card animate-in zoom-in-75">
            {badgeDisplay}
          </span>
        )}
      </button>

      {/* POPOVER DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Popover Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/90">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={triggerReminders}
                disabled={isRefreshing}
                title="Check for new reminders"
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {/* TODAY */}
                {todayItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Today
                    </span>
                    <div className="space-y-2">
                      {todayItems.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          onClosePopover={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* YESTERDAY */}
                {yesterdayItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Yesterday
                    </span>
                    <div className="space-y-2">
                      {yesterdayItems.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          onClosePopover={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* EARLIER */}
                {earlierItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      Earlier
                    </span>
                    <div className="space-y-2">
                      {earlierItems.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          onClosePopover={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 my-auto">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
                  <Bell className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <h4 className="text-xs font-bold text-foreground">You're all caught up</h4>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Important updates and study reminders will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Footer Link to Notifications Page */}
          <div className="p-3 border-t border-border bg-card/60">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-primary hover:text-primary/80 transition-colors py-1 cursor-pointer"
            >
              View All Notifications
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
