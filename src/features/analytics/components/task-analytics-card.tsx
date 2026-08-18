"use client";

import * as React from "react";
import { TaskAnalyticsData } from "../types";
import { CheckSquare, AlertTriangle, ListTodo, Clock } from "lucide-react";

interface TaskAnalyticsCardProps {
  taskData: TaskAnalyticsData | null;
  isLoading?: boolean;
}

export function TaskAnalyticsCard({ taskData, isLoading }: TaskAnalyticsCardProps) {
  if (isLoading || !taskData) {
    return <div className="rounded-3xl border border-border bg-card/60 p-6 h-64 animate-pulse" />;
  }

  const { totalTasks, completedTasks, inProgressTasks, todoTasks, overdueTasks, completionRate } = taskData;

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Task Analytics & Completion
          </h3>
        </div>

        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
          {completionRate}% Completion Rate
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>Overall Completion</span>
          <span>{completedTasks} of {totalTasks} Tasks Done</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/40">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
          <span className="text-xs font-extrabold uppercase">Completed</span>
          <p className="text-xl font-black mt-1">{completedTasks}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
          <span className="text-xs font-extrabold uppercase">In Progress</span>
          <p className="text-xl font-black mt-1">{inProgressTasks}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/60 text-muted-foreground">
          <span className="text-xs font-extrabold uppercase">To Do</span>
          <p className="text-xl font-black mt-1 text-foreground">{todoTasks}</p>
        </div>

        <div
          className={`p-3.5 rounded-2xl border ${
            overdueTasks > 0
              ? "bg-red-500/10 border-red-500/25 text-red-400"
              : "bg-muted/40 border-border/40 text-muted-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase">Overdue</span>
            {overdueTasks > 0 && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
          </div>
          <p className="text-xl font-black mt-1">{overdueTasks}</p>
        </div>
      </div>
    </div>
  );
}
