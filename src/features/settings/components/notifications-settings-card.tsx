"use client";

import * as React from "react";
import { NotificationPreferencesDialog } from "@/features/notifications";
import { useNotifications } from "@/features/notifications";
import { Bell, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationsSettingsCard() {
  const { preferences, updatePreferences } = useNotifications();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const items = [
    { label: "Task Reminders", status: preferences?.task_reminders },
    { label: "Deadline Reminders", status: preferences?.deadline_reminders },
    { label: "Overdue Alerts", status: preferences?.overdue_alerts },
    { label: "Study Session Reminders", status: preferences?.study_session_reminders },
    { label: "Quiz Practice Alerts", status: preferences?.quiz_reminders },
    { label: "Flashcard Review Alerts", status: preferences?.flashcard_reminders },
    { label: "Planner Notifications", status: preferences?.planner_notifications },
    { label: "AI Workload Reminders", status: preferences?.ai_reminders },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-foreground">Notification Preferences</h2>
          <p className="text-xs text-muted-foreground">
            Manage in-app notification triggers and deadline reminders.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 text-xs font-bold cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5" />
          Edit Alerts
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setDialogOpen(true)}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-border/80 bg-card/60 hover:bg-accent/40 cursor-pointer transition-colors"
          >
            <span className="text-xs font-bold text-foreground">{item.label}</span>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                item.status ?? true
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {item.status ?? true ? "ENABLED" : "DISABLED"}
            </span>
          </div>
        ))}
      </div>

      <NotificationPreferencesDialog
        open={dialogOpen}
        preferences={preferences}
        onClose={() => setDialogOpen(false)}
        onUpdate={updatePreferences}
      />
    </div>
  );
}
