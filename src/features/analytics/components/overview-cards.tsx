"use client";

import * as React from "react";
import { AnalyticsOverviewData } from "../types";
import { Clock, CheckSquare, Percent, Flame } from "lucide-react";

interface OverviewCardsProps {
  overview: AnalyticsOverviewData | null;
  isLoading?: boolean;
}

export function OverviewCards({ overview, isLoading }: OverviewCardsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/60 p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "STUDY TIME",
      value: overview.studyTimeFormatted || "0h 0m",
      subtitle: "Total logged study hours",
      icon: Clock,
      iconBg: "bg-violet-500/15 border-violet-500/30 text-violet-400",
    },
    {
      title: "TASKS COMPLETED",
      value: `${overview.tasksCompleted} / ${overview.totalTasks}`,
      subtitle: `${overview.totalTasks - overview.tasksCompleted} remaining`,
      icon: CheckSquare,
      iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "COMPLETION RATE",
      value: `${overview.completionRate}%`,
      subtitle: "Task finish ratio",
      icon: Percent,
      iconBg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
    },
    {
      title: "CURRENT STREAK",
      value: `${overview.currentStreakDays} ${overview.currentStreakDays === 1 ? "day" : "days"}`,
      subtitle: `Longest: ${overview.longestStreakDays} days`,
      icon: Flame,
      iconBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card/80 p-4 hover:border-primary/40 hover:bg-accent/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border ${card.iconBg} transition-transform group-hover:scale-105`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-2xl font-black tracking-tight text-foreground">
                {card.value}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
