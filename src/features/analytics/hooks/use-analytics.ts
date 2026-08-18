"use client";

import * as React from "react";
import { AnalyticsService, TimeRangeOption } from "@/services/db/analytics-service";
import { AIInsightResult } from "../types";
import { toast } from "@/components/ui/toast";

export function useAnalytics(workspaceId: string | null) {
  const [timeRange, setTimeRange] = React.useState<TimeRangeOption>("7d");
  const [data, setData] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [aiInsights, setAiInsights] = React.useState<AIInsightResult | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!workspaceId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await AnalyticsService.getFullAnalytics(workspaceId, timeRange);
      setData(res);
    } catch (err: any) {
      console.error("[useAnalytics] Load error:", err);
      setError("Unable to load analytics right now.");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, timeRange]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const fetchAIInsights = React.useCallback(async () => {
    if (!workspaceId || !data) return;

    setIsAiLoading(true);
    try {
      const topSubject = data.subjectAnalytics?.[0]?.subject || "General Studies";

      const res = await fetch("/api/analytics/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          timeRange,
          metrics: {
            studyTimeFormatted: data.overview?.studyTimeFormatted,
            tasksCompleted: data.overview?.tasksCompleted,
            totalTasks: data.overview?.totalTasks,
            completionRate: data.overview?.completionRate,
            overdueTasks: data.taskAnalytics?.overdueTasks,
            currentStreakDays: data.overview?.currentStreakDays,
            avgQuizScore: data.quizAnalytics?.avgScore,
            cardsMastered: data.flashcardAnalytics?.cardsMastered,
            totalCards: data.flashcardAnalytics?.totalCards,
            productivityScore: data.productivityScore?.score,
            topSubject,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate AI insights.");

      setAiInsights(json);
    } catch (err: any) {
      toast.error(err.message || "Unable to generate AI insights.");
    } finally {
      setIsAiLoading(false);
    }
  }, [workspaceId, timeRange, data]);

  const exportCsvReport = React.useCallback(() => {
    if (!data) return;

    try {
      const rows = [
        ["ASP Academic Analytics Report"],
        ["Generated Date", new Date().toLocaleString()],
        ["Selected Time Range", timeRange],
        ["Workspace ID", workspaceId || "N/A"],
        [""],
        ["OVERVIEW METRICS"],
        ["Total Study Time", data.overview?.studyTimeFormatted || "0h"],
        ["Tasks Completed", `${data.overview?.tasksCompleted || 0} / ${data.overview?.totalTasks || 0}`],
        ["Completion Rate", `${data.overview?.completionRate || 0}%`],
        ["Current Study Streak", `${data.overview?.currentStreakDays || 0} days`],
        ["Productivity Score", `${data.productivityScore?.score || 0} / 100 (${data.productivityScore?.level})`],
        [""],
        ["TASK BREAKDOWN"],
        ["Total Tasks", data.taskAnalytics?.totalTasks || 0],
        ["Completed Tasks", data.taskAnalytics?.completedTasks || 0],
        ["In Progress Tasks", data.taskAnalytics?.inProgressTasks || 0],
        ["To Do Tasks", data.taskAnalytics?.todoTasks || 0],
        ["Overdue Tasks", data.taskAnalytics?.overdueTasks || 0],
        [""],
        ["QUIZ METRICS"],
        ["Quizzes Completed", data.quizAnalytics?.quizzesCompleted || 0],
        ["Average Score", `${data.quizAnalytics?.avgScore || 0}%`],
        ["Best Score", `${data.quizAnalytics?.bestScore || 0}%`],
        [""],
        ["FLASHCARD METRICS"],
        ["Cards Reviewed", data.flashcardAnalytics?.cardsReviewed || 0],
        ["Cards Mastered", data.flashcardAnalytics?.cardsMastered || 0],
        ["Review Accuracy", `${data.flashcardAnalytics?.accuracyPct || 0}%`],
        [""],
        ["SUBJECT BREAKDOWN"],
        ["Subject", "Study Time", "Tasks Completed", "Quiz Avg"],
        ...((data.subjectAnalytics || []).map((s: any) => [
          s.subject,
          s.studyHoursFormatted,
          `${s.completedTasks} / ${s.totalTasks}`,
          s.quizAverageScore !== null ? `${s.quizAverageScore}%` : "N/A",
        ])),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ASP_Analytics_Report_${timeRange}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Analytics Report downloaded!");
    } catch (err: any) {
      toast.error("Failed to export CSV report.");
    }
  }, [data, timeRange, workspaceId]);

  return {
    timeRange,
    setTimeRange,
    data,
    isLoading,
    error,
    aiInsights,
    isAiLoading,
    fetchAIInsights,
    exportCsvReport,
    refresh: loadData,
  };
}
