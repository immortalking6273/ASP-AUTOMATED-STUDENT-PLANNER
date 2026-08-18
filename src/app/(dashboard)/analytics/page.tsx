"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import {
  useAnalytics,
  TimeRangeOption,
  OverviewCards,
  StudyTimeChart,
  ActivityHeatmap,
  TaskAnalyticsCard,
  SubjectAnalyticsCard,
  QuizFlashcardCard,
  ProductivityScoreCard,
  AiInsightsModal,
} from "@/features/analytics";
import { BarChart3, Download, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    WorkspacesService.getWorkspaces(user.id)
      .then((res) => {
        const list = res.data || [];
        setWorkspaces(list);
        if (list.length > 0) {
          setSelectedWorkspaceId(list[0].id);
        }
      })
      .catch(console.error);
  }, [user]);

  const analytics = useAnalytics(selectedWorkspaceId);

  const rangeOptions: Array<{ id: TimeRangeOption; label: string }> = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
    { id: "semester", label: "This Semester" },
    { id: "all", label: "All Time" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Analytics</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Understand your study habits, progress, and performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Workspace Selector */}
          {workspaces.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
              <select
                value={selectedWorkspaceId || ""}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-2xl">
            {rangeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => analytics.setTimeRange(opt.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  analytics.timeRange === opt.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={analytics.exportCsvReport}
            className="gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={analytics.refresh}
            className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Refresh analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <OverviewCards
        overview={analytics.data?.overview || null}
        isLoading={analytics.isLoading}
      />

      {/* GRID ROW 1: STUDY TIME & PRODUCTIVITY SCORE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StudyTimeChart
            studyTimeData={analytics.data?.studyTime || null}
            isLoading={analytics.isLoading}
          />
        </div>

        <div>
          <ProductivityScoreCard
            scoreData={analytics.data?.productivityScore || null}
            isLoading={analytics.isLoading}
          />
        </div>
      </div>

      {/* GRID ROW 2: DAILY HEATMAP & TASK ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityHeatmap
          dailyActivity={analytics.data?.studyTime?.dailyActivity || []}
          isLoading={analytics.isLoading}
        />

        <TaskAnalyticsCard
          taskData={analytics.data?.taskAnalytics || null}
          isLoading={analytics.isLoading}
        />
      </div>

      {/* GRID ROW 3: SUBJECT PERFORMANCE & QUIZ/FLASHCARD ANALYTICS */}
      <div className="space-y-4">
        <SubjectAnalyticsCard
          subjects={analytics.data?.subjectAnalytics || []}
          isLoading={analytics.isLoading}
        />

        <QuizFlashcardCard
          quizData={analytics.data?.quizAnalytics || null}
          flashcardData={analytics.data?.flashcardAnalytics || null}
          isLoading={analytics.isLoading}
        />
      </div>

      {/* SECTION 4: AI & DETERMINISTIC INSIGHTS */}
      <AiInsightsModal
        insights={analytics.data?.insights || []}
        aiInsights={analytics.aiInsights}
        isAiLoading={analytics.isAiLoading}
        onFetchAi={analytics.fetchAIInsights}
      />
    </div>
  );
}
