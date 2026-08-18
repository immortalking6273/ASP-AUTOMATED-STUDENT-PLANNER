"use client";

import * as React from "react";
import { UserPreferencesRow } from "../types";
import { GraduationCap, Clock, Calendar, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface StudySettingsCardProps {
  preferences: UserPreferencesRow | null;
  onUpdatePreferences: (patch: Partial<UserPreferencesRow>) => Promise<void>;
}

export function StudySettingsCard({
  preferences,
  onUpdatePreferences,
}: StudySettingsCardProps) {
  const [dailyMins, setDailyMins] = React.useState(preferences?.daily_study_goal_minutes || 120);
  const [weeklyMins, setWeeklyMins] = React.useState(preferences?.weekly_study_goal_minutes || 600);
  const [startTime, setStartTime] = React.useState(preferences?.preferred_start_time || "09:00");
  const [endTime, setEndTime] = React.useState(preferences?.preferred_end_time || "18:00");

  React.useEffect(() => {
    if (preferences) {
      setDailyMins(preferences.daily_study_goal_minutes || 120);
      setWeeklyMins(preferences.weekly_study_goal_minutes || 600);
      setStartTime(preferences.preferred_start_time || "09:00");
      setEndTime(preferences.preferred_end_time || "18:00");
    }
  }, [preferences]);

  const sessionOptions = [25, 45, 60, 90];
  const breakOptions = [5, 10, 15, 20];

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      daily_study_goal_minutes: Number(dailyMins),
      weekly_study_goal_minutes: Number(weeklyMins),
      preferred_start_time: startTime,
      preferred_end_time: endTime,
    });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-border pb-4">
        <h2 className="text-lg font-black tracking-tight text-foreground">Study & Planner Preferences</h2>
        <p className="text-xs text-muted-foreground">
          Set your daily study targets, preferred study hours, and default session lengths.
        </p>
      </div>

      <form onSubmit={handleSaveGoals} className="space-y-6">
        {/* DAILY & WEEKLY TARGETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Daily Study Goal (Minutes)</label>
            <Input
              type="number"
              min={10}
              max={720}
              value={dailyMins}
              onChange={(e) => setDailyMins(Number(e.target.value))}
              className="text-xs"
            />
            <span className="text-[10px] text-muted-foreground">
              Equivalent to {(dailyMins / 60).toFixed(1)} hours per day.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Weekly Study Goal (Minutes)</label>
            <Input
              type="number"
              min={60}
              max={4200}
              value={weeklyMins}
              onChange={(e) => setWeeklyMins(Number(e.target.value))}
              className="text-xs"
            />
            <span className="text-[10px] text-muted-foreground">
              Equivalent to {(weeklyMins / 60).toFixed(1)} hours per week.
            </span>
          </div>
        </div>

        {/* PREFERRED HOURS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Preferred Start Time</label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Preferred End Time</label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <Button type="submit" size="sm" className="gap-1.5 font-bold cursor-pointer">
          <Save className="h-3.5 w-3.5" /> Save Goals & Hours
        </Button>
      </form>

      {/* SESSION & BREAK DEFAULTS */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Default Session Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {sessionOptions.map((mins) => {
              const isSelected = (preferences?.default_session_minutes || 60) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdatePreferences({ default_session_minutes: mins })}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-center",
                    isSelected
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/80 bg-card/60 text-muted-foreground hover:bg-accent/40"
                  )}
                >
                  {mins} mins
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Default Break Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {breakOptions.map((mins) => {
              const isSelected = (preferences?.default_break_minutes || 10) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdatePreferences({ default_break_minutes: mins })}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer text-center",
                    isSelected
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/80 bg-card/60 text-muted-foreground hover:bg-accent/40"
                  )}
                >
                  {mins} mins
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
