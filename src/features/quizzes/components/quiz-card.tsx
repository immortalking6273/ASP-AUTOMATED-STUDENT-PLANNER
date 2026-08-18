"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { QuizRow } from "@/services/db/quizzes-service";
import { HelpCircle, Play, MoreVertical, Trash2, Trophy, Clock, CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizCardProps {
  quiz: QuizRow;
  onStart: () => void;
  onDelete: () => void;
}

export function QuizCard({ quiz, onStart, onDelete }: QuizCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const hasScore = quiz.latest_score !== null && quiz.latest_score !== undefined;
  const score = quiz.latest_score || 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card/80 p-4 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md transition-all duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-extrabold tracking-tight text-foreground truncate">
                {quiz.title}
              </h3>
              {quiz.subject && (
                <span className="text-[10px] font-semibold text-violet-300 truncate">
                  {quiz.subject}
                </span>
              )}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-1 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-xl border border-border bg-card shadow-xl p-1 text-xs backdrop-blur-md">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {quiz.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Stats & Footer */}
      <div className="mt-4 pt-3 border-t border-border/40 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>{quiz.total_questions} Questions</span>
          <span className="capitalize text-[11px] bg-muted px-2 py-0.5 rounded-md">
            {quiz.difficulty || "mixed"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs">
          {hasScore ? (
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-extrabold text-foreground">{score}% Score</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Not attempted</span>
            </div>
          )}

          <Button
            size="sm"
            onClick={onStart}
            className="h-7 px-3 text-xs font-bold gap-1 cursor-pointer"
          >
            {hasScore ? <RotateCw className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
            {hasScore ? "Retry" : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
}
