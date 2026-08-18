"use client";

import * as React from "react";
import { QuizAnalyticsData, FlashcardAnalyticsData } from "../types";
import { HelpCircle, Layers, Trophy, CheckCircle2, RotateCw } from "lucide-react";

interface QuizFlashcardCardProps {
  quizData: QuizAnalyticsData | null;
  flashcardData: FlashcardAnalyticsData | null;
  isLoading?: boolean;
}

export function QuizFlashcardCard({ quizData, flashcardData, isLoading }: QuizFlashcardCardProps) {
  if (isLoading || !quizData || !flashcardData) {
    return <div className="rounded-3xl border border-border bg-card/60 p-6 h-64 animate-pulse" />;
  }

  const { quizzesCompleted, avgScore, bestScore, scoreImprovementPct } = quizData;
  const { cardsReviewed, cardsMastered, accuracyPct, ratingsDistribution } = flashcardData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Quiz Analytics Card */}
      <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-4 shadow-sm flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Quiz Performance
              </h3>
            </div>
            <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {avgScore}% Avg
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-background/60 border border-border/50 text-center">
              <span className="text-lg font-black text-foreground">{quizzesCompleted}</span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Completed</p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-center text-amber-400">
              <span className="text-lg font-black">{bestScore}%</span>
              <p className="text-[10px] font-bold uppercase mt-0.5">Best Score</p>
            </div>

            <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-center text-violet-300">
              <span className="text-lg font-black">{avgScore}%</span>
              <p className="text-[10px] font-bold uppercase mt-0.5">Average</p>
            </div>
          </div>
        </div>

        {scoreImprovementPct !== null && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0" />
            <span>
              Your quiz performance {scoreImprovementPct >= 0 ? `improved by ${scoreImprovementPct}%` : `changed by ${scoreImprovementPct}%`} over recent attempts.
            </span>
          </div>
        )}
      </div>

      {/* Flashcard Analytics Card */}
      <div className="rounded-3xl border border-border bg-card/80 p-6 space-y-4 shadow-sm flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Flashcard Retention
              </h3>
            </div>
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {accuracyPct}% Accuracy
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-background/60 border border-border/50 text-center">
              <span className="text-lg font-black text-foreground">{cardsReviewed}</span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Cards Reviewed</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center text-emerald-400">
              <span className="text-lg font-black">{cardsMastered}</span>
              <p className="text-[10px] font-bold uppercase mt-0.5">Cards Mastered</p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Review Quality Distribution</span>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25">
              Again {ratingsDistribution.againPct}%
            </div>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Hard {ratingsDistribution.hardPct}%
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Good {ratingsDistribution.goodPct}%
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              Easy {ratingsDistribution.easyPct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
