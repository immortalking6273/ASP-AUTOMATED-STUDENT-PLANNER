"use client";

import * as React from "react";
import { NotificationRow, NotificationPreferencesRow, NotificationCategory } from "../types";
import { toast } from "@/components/ui/toast";

export function useNotifications(workspaceId: string | null = null) {
  const [notifications, setNotifications] = React.useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [preferences, setPreferences] = React.useState<NotificationPreferencesRow | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<NotificationCategory>("all");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `/api/notifications?filter=${categoryFilter}${
        workspaceId ? `&workspaceId=${workspaceId}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("[useNotifications] fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, categoryFilter]);

  const loadPreferences = React.useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/preferences");
      const data = await res.json();
      if (res.ok) setPreferences(data);
    } catch (err) {
      console.error("[useNotifications] preferences error:", err);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    loadPreferences();
  }, [loadData, loadPreferences]);

  const triggerReminders = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_reminders", workspaceId }),
      });
      const data = await res.json();
      if (data.generated && data.generated > 0) {
        toast.info(`Generated ${data.generated} new study reminders!`);
      }
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [workspaceId, loadData]);

  const markAsRead = React.useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_read", notificationId }),
        });
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const markAllAsRead = React.useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error(err);
    }
  }, []);

  const deleteNotification = React.useCallback(
    async (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", notificationId }),
        });
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const clearReadNotifications = React.useCallback(async () => {
    setNotifications((prev) => prev.filter((n) => !n.is_read));

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_read" }),
      });
      toast.success("Cleared read notifications.");
    } catch (err) {
      console.error(err);
    }
  }, []);

  const updatePreferences = React.useCallback(
    async (patch: Partial<NotificationPreferencesRow>) => {
      setPreferences((prev) => (prev ? { ...prev, ...patch } : null));

      try {
        const res = await fetch("/api/notifications/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (res.ok) {
          setPreferences(data);
          toast.success("Notification preferences updated.");
        }
      } catch (err) {
        toast.error("Failed to update preferences.");
      }
    },
    []
  );

  return {
    notifications,
    unreadCount,
    preferences,
    categoryFilter,
    setCategoryFilter,
    isLoading,
    isRefreshing,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    triggerReminders,
    updatePreferences,
    refresh: loadData,
  };
}
