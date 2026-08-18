"use client";

import * as React from "react";
import { CheckCircle2, Clock, AlertTriangle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
}

export function ProgressCard({
  completedCount,
  totalCount,
  completionPercentage,
  overdueCount,
  todayCount,
  upcomingCount,
}: ProgressCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Overall Progress */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Overall Completion</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{completionPercentage}%</span>
          <span className="text-xs text-muted-foreground font-medium">
            ({completedCount}/{totalCount} tasks)
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>
      </div>

      {/* 2. Today's Tasks */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Today's Focus</span>
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{todayCount}</span>
          <span className="text-xs text-muted-foreground font-medium">tasks due today</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Stay focused on high-priority items</p>
      </div>

      {/* 3. Overdue Warning */}
      <div className={cn(
        "rounded-2xl border p-4 space-y-2 shadow-2xs transition-colors",
        overdueCount > 0
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-card text-foreground"
      )}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Overdue Tasks</span>
          <AlertTriangle className={cn("h-4 w-4", overdueCount > 0 ? "text-destructive" : "text-muted-foreground")} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{overdueCount}</span>
          <span className="text-xs text-muted-foreground font-medium">require attention</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {overdueCount > 0 ? "Reschedule or complete overdue items" : "All deadlines on track!"}
        </p>
      </div>

      {/* 4. Upcoming Deadlines */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Upcoming Deadlines</span>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">{upcomingCount}</span>
          <span className="text-xs text-muted-foreground font-medium">scheduled ahead</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Plan study sessions early</p>
      </div>
    </div>
  );
}
