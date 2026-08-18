"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Award, BookOpen } from "lucide-react";

export interface StudyProgressCardProps {
  hoursThisWeek?: number;
  /** Real per-day study hours from the hook (last 7 days) */
  weeklyDayData?: { day: string; hours: number }[];
}

const FALLBACK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const StudyProgressCard: React.FC<StudyProgressCardProps> = ({
  hoursThisWeek = 0,
  weeklyDayData,
}) => {
  // Use real data from hook; fallback to all-zero placeholder days
  const chartData =
    weeklyDayData && weeklyDayData.length > 0
      ? weeklyDayData
      : FALLBACK_DAYS.map((day) => ({ day, hours: 0 }));

  const maxBar = Math.max(...chartData.map((d) => d.hours), 0.1); // prevent /0
  const displayHours = Math.round(hoursThisWeek * 10) / 10;
  const hasData = hoursThisWeek > 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Study Hours This Week</span>
        </CardTitle>
        {hasData ? (
          <div className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Award className="h-3.5 w-3.5" />
            <span>{displayHours} hrs</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>No sessions yet</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats header */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-foreground">
            {displayHours} hrs
          </span>
          <span className="text-xs text-muted-foreground">this week</span>
        </div>

        {/* Bar Chart */}
        <div className="grid grid-cols-7 gap-1.5 pt-2 items-end h-24 border-b pb-2">
          {chartData.map((item, idx) => {
            const heightPercent = maxBar > 0 ? (item.hours / maxBar) * 100 : 0;
            const isToday =
              idx === chartData.length - 1; // last item = most recent day
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 h-full justify-end group"
              >
                <span className="text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.hours > 0 ? `${item.hours}h` : "—"}
                </span>
                <div
                  className={`w-full rounded-t-md transition-colors relative overflow-hidden ${
                    item.hours > 0
                      ? isToday
                        ? "bg-primary"
                        : "bg-primary/60 group-hover:bg-primary"
                      : "bg-muted/40"
                  }`}
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>

        {!hasData && (
          <p className="text-center text-xs text-muted-foreground py-1">
            Log a study session in the{" "}
            <a href="/planner" className="text-primary hover:underline">
              Study Planner
            </a>{" "}
            to track your progress.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

