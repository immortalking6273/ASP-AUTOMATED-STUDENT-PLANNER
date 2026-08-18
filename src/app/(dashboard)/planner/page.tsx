"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { WorkspacesService } from "@/services/db";
import { WorkspaceRow } from "@/types/database";
import {
  useStudyPlanner,
  PlannerHeader,
  ProgressCard,
  TaskCard,
  TaskDialog,
  StudySessionDialog,
  WeeklySchedule,
  AIPlanPreviewModal,
  PlannerTask,
  StudySessionItem,
} from "@/features/planner";
import { Plus, CheckSquare, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudyPlannerPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);

  // Modal Dialog States
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<PlannerTask | null>(null);

  const [isSessionDialogOpen, setIsSessionDialogOpen] = React.useState(false);
  const [editingSession, setEditingSession] = React.useState<StudySessionItem | null>(null);

  const [deletingTask, setDeletingTask] = React.useState<PlannerTask | null>(null);

  // Fetch workspaces for current user
  React.useEffect(() => {
    if (user) {
      WorkspacesService.getWorkspaces(user.id).then((res) => {
        setWorkspaces(res.data);
        if (res.data.length > 0) {
          setSelectedWorkspaceId(res.data[0].id);
        }
      });
    }
  }, [user]);

  const {
    tasks,
    allTasks,
    studySessions,
    subjects,
    isLoading,
    totalCount,
    completedCount,
    completionPercentage,
    todayTasks,
    overdueTasks,
    upcomingTasks,
    completedTasks,
    filters,
    setFilters,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    createStudySession,
    updateStudySession,
    deleteStudySession,
    isGeneratingPlan,
    aiPlan,
    isPreviewOpen,
    setIsPreviewOpen,
    generateAIPlan,
    acceptAIPlan,
    currentWeekStart,
    prevWeek,
    nextWeek,
    resetWeek,
  } = useStudyPlanner(selectedWorkspaceId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-12">
      {/* Top Bar with Workspace Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {workspaces.length > 1 && (
          <div className="flex items-center gap-2 self-end">
            <span className="text-xs font-semibold text-muted-foreground">Workspace:</span>
            <select
              value={selectedWorkspaceId || ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header & Filter Controls */}
      <PlannerHeader
        filters={filters}
        onFilterChange={setFilters}
        subjects={subjects}
        onOpenAddTask={() => {
          setEditingTask(null);
          setIsTaskDialogOpen(true);
        }}
        onOpenAddSession={() => {
          setEditingSession(null);
          setIsSessionDialogOpen(true);
        }}
        onGenerateAIPlan={generateAIPlan}
        isGeneratingPlan={isGeneratingPlan}
        overdueCount={overdueTasks.length}
      />

      {/* Progress Cards Overview */}
      <ProgressCard
        completedCount={completedCount}
        totalCount={totalCount}
        completionPercentage={completionPercentage}
        overdueCount={overdueTasks.length}
        todayCount={todayTasks.length}
        upcomingCount={upcomingTasks.length}
      />

      {/* Weekly Schedule Planner */}
      <WeeklySchedule
        currentWeekStart={currentWeekStart}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
        onResetWeek={resetWeek}
        tasks={allTasks}
        studySessions={studySessions}
        onEditTask={(t) => {
          setEditingTask(t);
          setIsTaskDialogOpen(true);
        }}
        onEditSession={(s) => {
          setEditingSession(s);
          setIsSessionDialogOpen(true);
        }}
        onDeleteSession={deleteStudySession}
      />

      {/* Task List Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold text-base text-foreground">
              {filters.tab === "all" && "All Tasks"}
              {filters.tab === "today" && "Today's Tasks"}
              {filters.tab === "upcoming" && "Upcoming Deadlines"}
              {filters.tab === "overdue" && "Overdue Tasks"}
              {filters.tab === "completed" && "Completed Tasks"}
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">({tasks.length})</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setIsTaskDialogOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
            className="rounded-xl text-xs font-semibold"
          >
            Add Task
          </Button>
        </div>

        {/* Task Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl border border-border bg-card/60 animate-pulse p-4 space-y-2">
                <div className="h-4 w-2/3 bg-muted rounded-md" />
                <div className="h-3 w-1/2 bg-muted/60 rounded-md" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-extrabold text-base text-foreground">No tasks found</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {filters.searchQuery
                  ? "No tasks match your current search criteria."
                  : filters.tab === "overdue"
                  ? "No overdue tasks! You are all caught up."
                  : "Add your first task to start planning your study schedule."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsTaskDialogOpen(true);
                }}
                leftIcon={<Plus className="h-4 w-4" />}
                className="rounded-xl text-xs font-semibold"
              >
                Add Task
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIPlan}
                disabled={isGeneratingPlan}
                leftIcon={<Sparkles className="h-4 w-4 text-primary" />}
                className="rounded-xl text-xs font-semibold"
              >
                AI Study Plan
              </Button>
            </div>
          </div>
        ) : (
          /* Task Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleCompletion={toggleTaskCompletion}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsTaskDialogOpen(true);
                }}
                onDelete={(t) => setDeletingTask(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        subjects={subjects}
        onSave={async (payload) => {
          if (editingTask) {
            await updateTask(editingTask.id, payload);
          } else {
            await createTask(payload);
          }
        }}
      />

      {/* Study Session Modal */}
      <StudySessionDialog
        isOpen={isSessionDialogOpen}
        onClose={() => {
          setIsSessionDialogOpen(false);
          setEditingSession(null);
        }}
        session={editingSession}
        subjects={subjects}
        onSave={async (payload) => {
          if (editingSession) {
            await updateStudySession(editingSession.id, payload);
          } else {
            await createStudySession(payload);
          }
        }}
      />

      {/* Delete Task Confirmation Modal */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0">
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xl text-card-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-foreground">Delete Task?</h4>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs font-semibold text-foreground bg-secondary/50 p-3 rounded-xl border border-border">
              &ldquo;{deletingTask.title}&rdquo;
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingTask(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (deletingTask) {
                    await deleteTask(deletingTask.id);
                    setDeletingTask(null);
                  }
                }}
                className="rounded-xl text-xs font-semibold"
              >
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Plan Preview Modal */}
      <AIPlanPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        plan={aiPlan}
        onAccept={acceptAIPlan}
        onRegenerate={generateAIPlan}
        isGenerating={isGeneratingPlan}
      />
    </div>
  );
}
