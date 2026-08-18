"use client";

import * as React from "react";
import { DailyStudyActivity, WeeklyStudyTrend } from "../types";
import { Clock, TrendingUp, Calendar, Zap } from "lucide-react";

interface StudyTimeChartProps {
  studyTimeData: {
    totalMinutes: number;
    dailyActivity: DailyStudyActivity[];
    weeklyTrends: WeeklyStudyTrend[];
    peakStudyTimeFormatted: string;
    bestStudyDayFormatted: string;
  } | null;
  isLoading?: boolean;
}

export function StudyTimeChart({ studyTimeData, isLoading }: StudyTimeChartProps) {
  if (isLoading || !studyTimeData) {
    return <div className="rounded-3xl border border-border bg-card/60 p-6 h-64 animate-pulse" />;
  }

  const { dailyActivity, weeklyTrends, peakStudyTimeFormatted, bestStudyDayFormatted } = studyTimeData;
  const hasData = dailyActivity.some((d) => d.minutes > 0);

  // Scale max value for bars
  const maxMinutes = Math.max(...dailyActivity.map((d) => d.minutes), 60);

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              Study Time Analytics
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged study hours across the selected period
          </p>
        </div>

        {/* Peak & Best Day Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1 rounded-xl text-xs font-semibold">
            <Zap className="h-3.5 w-3.5" />
            <span>Peak Time: {peakStudyTimeFormatted}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-xl text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5" />
            <span>Best Day: {bestStudyDayFormatted}</span>
          </div>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-6">
          {/* Daily Study Time Bar Chart */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Daily Hours Breakdown
            </span>

            <div className="h-44 flex items-end justify-between gap-1.5 pt-6 pb-2 px-2 rounded-2xl bg-background/50 border border-border/40 overflow-x-auto">
              {dailyActivity.slice(-14).map((item, idx) => {
                const heightPct = Math.max(8, Math.round((item.minutes / maxMinutes) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 min-w-[24px] group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-popover border border-border px-2 py-1 rounded-lg text-[10px] font-bold text-popover-foreground whitespace-nowrap shadow-md pointer-events-none">
                      {item.date}: {item.hoursFormatted}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-full flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          item.minutes > 0
                            ? "bg-gradient-to-t from-violet-600 to-indigo-500 group-hover:from-violet-500 group-hover:to-indigo-400"
                            : "bg-muted/40"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>

                    {/* Day Label */}
                    <span className="text-[10px] font-bold text-muted-foreground truncate">
                      {item.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Trends Breakdown */}
          {weeklyTrends.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-border/40">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                Weekly Study Progress
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weeklyTrends.map((wt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-border/60 bg-card/60 space-y-1"
                  >
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {wt.weekLabel}
                    </span>
                    <p className="text-sm font-extrabold text-foreground">
                      {wt.hoursFormatted}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center space-y-2 rounded-2xl border border-dashed border-border/60 bg-background/30">
          <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto" />
          <p className="text-xs font-bold text-muted-foreground">No study-time data available yet.</p>
          <p className="text-[11px] text-muted-foreground/70">
            Log study sessions in the Study Planner or Calendar to start tracking study hours.
          </p>
        </div>
      )}
    </div>
  );
}
