"use client";

import * as React from "react";
import { NotificationPreferencesRow } from "../types";
import { X, Sliders, Check, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPreferencesDialogProps {
  open: boolean;
  preferences: NotificationPreferencesRow | null;
  onClose: () => void;
  onUpdate: (patch: Partial<NotificationPreferencesRow>) => Promise<void>;
}

export function NotificationPreferencesDialog({
  open,
  preferences,
  onClose,
  onUpdate,
}: NotificationPreferencesDialogProps) {
  if (!open || !preferences) return null;

  const toggles = [
    { key: "task_reminders", title: "Task Reminders", desc: "Notify when tasks are due or updated" },
    { key: "deadline_reminders", title: "Deadline Reminders", desc: "Notify 1 day and same day before deadlines" },
    { key: "overdue_alerts", title: "Overdue Task Alerts", desc: "Alert when tasks pass their due date" },
    { key: "study_session_reminders", title: "Study Session Reminders", desc: "Notify 30 mins before scheduled sessions" },
    { key: "quiz_reminders", title: "Quiz Practice Alerts", desc: "Notify when new quizzes are ready for practice" },
    { key: "flashcard_reminders", title: "Flashcard Review Alerts", desc: "Alert when cards are due for spaced repetition" },
    { key: "planner_notifications", title: "Planner Updates", desc: "Notify on schedule optimizations or planner changes" },
    { key: "ai_reminders", title: "AI Smart Reminders", desc: "Allow NVIDIA NIM engine to analyze workload clusters" },
  ] as const;

  const handleToggle = (key: keyof NotificationPreferencesRow) => {
    const currentVal = Boolean(preferences[key]);
    onUpdate({ [key]: !currentVal } as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-violet-500/10 via-card to-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">Notification Preferences</h2>
              <p className="text-[11px] text-muted-foreground">
                Control which alerts and reminders you receive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-3">
            {toggles.map((item) => {
              const isEnabled = Boolean(preferences[item.key as keyof NotificationPreferencesRow]);

              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key as keyof NotificationPreferencesRow)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/70 bg-card/60 hover:bg-accent/40 cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{item.desc}</p>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      isEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-card/60 flex justify-end">
          <Button onClick={onClose} className="font-extrabold cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
