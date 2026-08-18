"use client";

import * as React from "react";
import { Sparkles, Flame, Target, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface GreetingSectionProps {
  userName?: string;
  streakCount?: number;
  /** Actual minutes studied today */
  todayStudyMinutes?: number;
  /** Daily goal minutes from user_preferences (0 = not set) */
  dailyGoalMinutes?: number;
}

const MOTIVATIONS = [
  "Success is the sum of small efforts repeated day in and day out.",
  "Focus on progress, not perfection. Every study session counts!",
  "The secret of getting ahead is getting started.",
  "Your future self will thank you for the work you do today.",
];

function formatHours(minutes: number): string {
  if (minutes <= 0) return "0 hrs";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hrs`;
  return `${h}h ${m}m`;
}

export const GreetingSection: React.FC<GreetingSectionProps> = ({
  userName = "Student",
  streakCount = 0,
  todayStudyMinutes = 0,
  dailyGoalMinutes = 0,
}) => {
  const [greeting, setGreeting] = React.useState("Welcome");
  const [motivation, setMotivation] = React.useState(MOTIVATIONS[0]);

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const randomQuote = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
    setMotivation(randomQuote);
  }, []);

  // Compute today's goal progress
  const hasGoal = dailyGoalMinutes > 0;
  const goalPct = hasGoal
    ? Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100))
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 py-0.5 px-2 text-[11px] bg-background/50">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <span>Academic Workspace</span>
            </Badge>
            <Badge variant="secondary" className="gap-1 py-0.5 px-2 text-[11px]">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span>{streakCount} Day Streak</span>
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              {userName}
            </span>
          </h1>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground italic">
            <Quote className="h-3.5 w-3.5 shrink-0 text-primary/60 mt-0.5" />
            <span>&ldquo;{motivation}&rdquo;</span>
          </p>
        </div>

        {/* Daily Goal Meter */}
        <div className="flex items-center gap-4 rounded-xl border bg-background/80 p-4 shadow-xs shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Today&apos;s Goal</span>
              {hasGoal ? (
                <span className="text-primary">{goalPct}%</span>
              ) : (
                <Link href="/settings" className="text-primary hover:underline text-[10px]">
                  Set Goal
                </Link>
              )}
            </div>
            {hasGoal ? (
              <>
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${goalPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatHours(todayStudyMinutes)} / {formatHours(dailyGoalMinutes)} studied
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-0 bg-primary rounded-full" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Configure in Settings
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

