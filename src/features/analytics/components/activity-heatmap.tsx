"use client";

import * as React from "react";
import { DailyStudyActivity } from "../types";
import { CalendarDays } from "lucide-react";

interface ActivityHeatmapProps {
  dailyActivity: DailyStudyActivity[];
  isLoading?: boolean;
}

export function ActivityHeatmap({ dailyActivity, isLoading }: ActivityHeatmapProps) {
  if (isLoading) {
    return <div className="rounded-3xl border border-border bg-card/60 p-6 h-48 animate-pulse" />;
  }

  // Display grid cells for daily activity
  const items = dailyActivity.slice(-28); // last 28 days (4 weeks grid)

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Daily Activity Grid
          </h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-md bg-muted/40 border border-border/50" />
            <div className="h-3 w-3 rounded-md bg-violet-900/60 border border-violet-700/40" />
            <div className="h-3 w-3 rounded-md bg-violet-600 border border-violet-500/50" />
            <div className="h-3 w-3 rounded-md bg-violet-400 border border-violet-300" />
          </div>
          <span>More</span>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-7 gap-2 p-2 rounded-2xl bg-background/50 border border-border/40">
          {items.map((item, idx) => {
            let bgClass = "bg-muted/40 border-border/40";
            if (item.level === 1) bgClass = "bg-violet-900/60 border-violet-700/50 text-violet-300";
            else if (item.level === 2) bgClass = "bg-violet-600 border-violet-500/60 text-white";
            else if (item.level === 3) bgClass = "bg-violet-400 border-violet-300 text-slate-950 font-black shadow-sm ring-1 ring-violet-400/50";

            return (
              <div
                key={idx}
                className="group relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer hover:scale-105"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-popover border border-border px-2 py-1 rounded-lg text-[10px] font-bold text-popover-foreground whitespace-nowrap shadow-md pointer-events-none">
                  {item.date}: {item.hoursFormatted}
                </div>

                <div className={`w-full h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${bgClass}`}>
                  {item.dayLabel}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No daily activity recorded for this period.
        </div>
      )}
    </div>
  );
}
