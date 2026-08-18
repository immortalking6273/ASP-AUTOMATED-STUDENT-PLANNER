"use client";

import * as React from "react";
import { ProductivityScoreData } from "../types";
import { Award, Info } from "lucide-react";

interface ProductivityScoreCardProps {
  scoreData: ProductivityScoreData | null;
  isLoading?: boolean;
}

export function ProductivityScoreCard({ scoreData, isLoading }: ProductivityScoreCardProps) {
  if (isLoading || !scoreData) {
    return <div className="rounded-3xl border border-border bg-card/60 p-6 h-64 animate-pulse" />;
  }

  const { score, level, breakdown } = scoreData;

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-violet-500/10 via-card to-card p-6 space-y-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-violet-400" />
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
            ASP Productivity Score
          </h3>
        </div>

        <span className="text-xs font-black text-violet-300 bg-violet-500/20 px-3 py-1 rounded-full border border-violet-500/30">
          {level}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Big Score Meter */}
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-violet-500/30 bg-card shadow-inner">
          <div className="text-center">
            <span className="text-3xl font-black text-foreground">{score}</span>
            <span className="block text-[10px] font-bold text-muted-foreground uppercase">/ 100</span>
          </div>
        </div>

        {/* Formula Breakdown Progress Bars */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Task Completion (max 40)</span>
              <span className="text-foreground">{breakdown.taskCompletionScore} pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.taskCompletionScore / 40) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Study Consistency (max 25)</span>
              <span className="text-foreground">{breakdown.consistencyScore} pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.consistencyScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Quiz Mastery (max 20)</span>
              <span className="text-foreground">{breakdown.quizScore} pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.quizScore / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Study Hours Target (max 15)</span>
              <span className="text-foreground">{breakdown.studyTimeScore} pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full bg-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${(breakdown.studyTimeScore / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-2xl bg-card/60 border border-border/50 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-violet-400 shrink-0" />
        <span>Based on your study consistency, task completion rate, quiz performance, and study time.</span>
      </div>
    </div>
  );
}
