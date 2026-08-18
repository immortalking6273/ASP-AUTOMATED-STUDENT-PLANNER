"use client";

import * as React from "react";
import { SubjectAnalyticsData } from "../types";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectAnalyticsCardProps {
  subjects: SubjectAnalyticsData[];
  isLoading?: boolean;
}

export function SubjectAnalyticsCard({ subjects, isLoading }: SubjectAnalyticsCardProps) {
  const [showAll, setShowAll] = React.useState(false);

  if (isLoading) {
    return <div className="rounded-3xl border border-border bg-card/60 p-6 h-64 animate-pulse" />;
  }

  const maxMinutes = Math.max(...subjects.map((s) => s.studyMinutes), 60);
  const visibleSubjects = showAll ? subjects : subjects.slice(0, 6);

  return (
    <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            Subject Performance & Time
          </h3>
        </div>

        <span className="text-xs font-bold text-muted-foreground">
          {subjects.length} Subjects Tracked
        </span>
      </div>

      {subjects.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {visibleSubjects.map((subj, idx) => {
              const widthPct = Math.max(5, Math.round((subj.studyMinutes / maxMinutes) * 100));

              return (
                <div key={idx} className="rounded-2xl border border-border/50 bg-background/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-extrabold text-foreground">{subj.subject}</span>
                    <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                      <span>⏱ {subj.studyHoursFormatted}</span>
                      <span>✓ {subj.completedTasks}/{subj.totalTasks} Tasks</span>
                      {subj.quizAverageScore !== null && (
                        <span className="font-bold text-emerald-400">
                          🎯 {subj.quizAverageScore}% Quiz
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {subjects.length > 6 && (
            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll((prev) => !prev)}
                className="text-xs font-bold gap-1"
              >
                {showAll ? (
                  <>
                    Show Less <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    View All ({subjects.length - 6} more) <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground">
          No subject activity recorded for this period. Assign subjects to tasks or study sessions.
        </div>
      )}
    </div>
  );
}
