"use client";

import * as React from "react";
import {
  PlannerTask,
  StudySessionItem,
  PlannerFilterState,
  TaskStatus,
  TaskPriority,
  AIStudyPlanResponse,
} from "../types";
import { StudyPlannerService } from "@/services/db/study-planner-service";
import { toast } from "@/components/ui/toast";

export function useStudyPlanner(workspaceId: string | null) {
  const [tasks, setTasks] = React.useState<PlannerTask[]>([]);
  const [studySessions, setStudySessions] = React.useState<StudySessionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters State
  const [filters, setFilters] = React.useState<PlannerFilterState>({
    tab: "all",
    priority: "all",
    subject: "all",
    status: "all",
    searchQuery: "",
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  // Week Navigation State
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(() => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff));
  });

  // AI Study Plan State
  const [isGeneratingPlan, setIsGeneratingPlan] = React.useState(false);
  const [aiPlan, setAiPlan] = React.useState<AIStudyPlanResponse | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Fetch Tasks & Study Sessions
  const loadPlannerData = React.useCallback(async () => {
    if (!workspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [fetchedTasks, fetchedSessions] = await Promise.all([
        StudyPlannerService.getTasks(workspaceId),
        StudyPlannerService.getStudySessions(workspaceId),
      ]);
      setTasks(fetchedTasks);
      setStudySessions(fetchedSessions);
    } catch (err: any) {
      console.error("Error loading planner data:", err);
      toast.error("Could not load planner tasks or sessions");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  React.useEffect(() => {
    loadPlannerData();
  }, [workspaceId, loadPlannerData]);

  // Derived Unique Subjects
  const subjects = React.useMemo(() => {
    const list = new Set<string>();
    tasks.forEach((t) => {
      if (t.subject) list.add(t.subject);
    });
    studySessions.forEach((s) => {
      if (s.subject) list.add(s.subject);
    });
    return Array.from(list).sort();
  }, [tasks, studySessions]);

  // Helper date calculations
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Derived Task Categories
  const todayTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed) return false;
      if (!t.dueDate) return true; // Include unscheduled active tasks
      const dueStr = new Date(t.dueDate).toISOString().split("T")[0];
      return dueStr === todayStr;
    });
  }, [tasks, todayStr]);

  const overdueTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (t.completed || t.status === "completed") return false;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due < now && due.toISOString().split("T")[0] !== todayStr;
    });
  }, [tasks, now, todayStr]);

  const upcomingTasks = React.useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.completed || t.status === "completed") return false;
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due >= now;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks, now]);

  const completedTasks = React.useMemo(() => {
    return tasks.filter((t) => t.completed || t.status === "completed");
  }, [tasks]);

  // Master Filtered & Sorted Tasks List
  const filteredTasks = React.useMemo(() => {
    return tasks
      .filter((task) => {
        // Tab Filter
        if (filters.tab === "today") {
          if (task.completed) return false;
          if (task.dueDate) {
            const dueStr = new Date(task.dueDate).toISOString().split("T")[0];
            if (dueStr !== todayStr) return false;
          }
        } else if (filters.tab === "upcoming") {
          if (task.completed) return false;
          if (!task.dueDate) return false;
          if (new Date(task.dueDate) < now) return false;
        } else if (filters.tab === "overdue") {
          if (task.completed) return false;
          if (!task.dueDate) return false;
          const due = new Date(task.dueDate);
          if (due >= now || due.toISOString().split("T")[0] === todayStr) return false;
        } else if (filters.tab === "completed") {
          if (!task.completed && task.status !== "completed") return false;
        }

        // Priority Filter
        if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
          return false;
        }

        // Subject Filter
        if (filters.subject && filters.subject !== "all" && task.subject !== filters.subject) {
          return false;
        }

        // Status Filter
        if (filters.status && filters.status !== "all" && task.status !== filters.status) {
          return false;
        }

        // Search Query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const titleMatch = task.title.toLowerCase().includes(q);
          const descMatch = task.description ? task.description.toLowerCase().includes(q) : false;
          const subjMatch = task.subject ? task.subject.toLowerCase().includes(q) : false;
          if (!titleMatch && !descMatch && !subjMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return (
            (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) *
            (filters.sortOrder === "asc" ? 1 : -1)
          );
        }
        if (filters.sortBy === "priority") {
          const map: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (map[b.priority] - map[a.priority]) * (filters.sortOrder === "asc" ? 1 : -1);
        }
        if (filters.sortBy === "createdAt") {
          return (
            (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) *
            (filters.sortOrder === "asc" ? 1 : -1)
          );
        }
        return 0;
      });
  }, [tasks, filters, todayStr, now]);

  // Progress Metrics
  const totalCount = tasks.length;
  const completedCount = completedTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Task Actions
  const createTask = async (payload: {
    title: string;
    description?: string;
    subject?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string | null;
    estimatedMinutes?: number;
  }) => {
    if (!workspaceId) return;
    try {
      const newTask = await StudyPlannerService.createTask({
        workspaceId,
        ...payload,
      });
      setTasks((prev) => [newTask, ...prev]);
      toast.success("Task created");
    } catch (err: any) {
      toast.error("Failed to create task", err.message);
    }
  };

  const updateTask = async (
    taskId: string,
    payload: {
      title?: string;
      description?: string | null;
      subject?: string | null;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: string | null;
      estimatedMinutes?: number;
    }
  ) => {
    try {
      const updated = await StudyPlannerService.updateTask(taskId, payload);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      toast.success("Task updated");
    } catch (err: any) {
      toast.error("Failed to update task", err.message);
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, completed, status: completed ? "completed" : "todo", completedAt: completed ? new Date().toISOString() : null }
            : t
        )
      );
      await StudyPlannerService.toggleTaskCompletion(taskId, completed);
    } catch (err: any) {
      loadPlannerData(); // Rollback on failure
      toast.error("Failed to update task status", err.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await StudyPlannerService.deleteTask(taskId);
      toast.success("Task deleted");
    } catch (err: any) {
      loadPlannerData();
      toast.error("Failed to delete task", err.message);
    }
  };

  // Study Session Actions
  const createStudySession = async (payload: {
    title: string;
    subject?: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    if (!workspaceId) return;
    try {
      const newSession = await StudyPlannerService.createStudySession({
        workspaceId,
        ...payload,
      });
      setStudySessions((prev) => [...prev, newSession]);
      toast.success("Study session scheduled");
    } catch (err: any) {
      toast.error("Failed to schedule session", err.message);
    }
  };

  const updateStudySession = async (
    sessionId: string,
    payload: {
      title?: string;
      subject?: string | null;
      startTime?: string;
      endTime?: string;
      notes?: string | null;
    }
  ) => {
    try {
      const updated = await StudyPlannerService.updateStudySession(sessionId, payload);
      setStudySessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
      toast.success("Study session updated");
    } catch (err: any) {
      toast.error("Failed to update session", err.message);
    }
  };

  const deleteStudySession = async (sessionId: string) => {
    try {
      setStudySessions((prev) => prev.filter((s) => s.id !== sessionId));
      await StudyPlannerService.deleteStudySession(sessionId);
      toast.success("Study session removed");
    } catch (err: any) {
      loadPlannerData();
      toast.error("Failed to delete session", err.message);
    }
  };

  // AI Study Plan Generator
  const generateAIPlan = async () => {
    if (!workspaceId) return;
    setIsGeneratingPlan(true);
    try {
      const startDateStr = currentWeekStart.toISOString().split("T")[0];
      const res = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          tasks,
          startDate: startDateStr,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "AI generation failed");
      }

      const planData: AIStudyPlanResponse = await res.json();
      setAiPlan(planData);
      setIsPreviewOpen(true);
    } catch (err: any) {
      toast.error("AI Study Plan Generation Error", err.message);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const acceptAIPlan = async () => {
    if (!workspaceId || !aiPlan || !aiPlan.sessions) return;
    try {
      const sessionsToCreate = aiPlan.sessions.map((s) => ({
        title: s.title,
        subject: s.subject,
        startTime: `${s.date}T${s.startTime}:00.000Z`,
        endTime: `${s.date}T${s.endTime}:00.000Z`,
        notes: s.reasoning || "AI Generated Study Session",
      }));

      const newSessions = await StudyPlannerService.batchCreateStudySessions(workspaceId, sessionsToCreate);
      setStudySessions((prev) => [...prev, ...newSessions]);
      setIsPreviewOpen(false);
      setAiPlan(null);
      toast.success(`Accepted AI Plan! Added ${newSessions.length} study sessions.`);
    } catch (err: any) {
      toast.error("Failed to save AI study sessions", err.message);
    }
  };

  // Week Navigation
  const prevWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const nextWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const resetWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(d.setDate(diff)));
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    studySessions,
    subjects,
    isLoading,

    // Task Metrics
    totalCount,
    completedCount,
    completionPercentage,
    todayTasks,
    overdueTasks,
    upcomingTasks,
    completedTasks,

    // Filter state & setters
    filters,
    setFilters,

    // Actions
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,

    // Study Sessions
    createStudySession,
    updateStudySession,
    deleteStudySession,

    // AI Study Plan
    isGeneratingPlan,
    aiPlan,
    isPreviewOpen,
    setIsPreviewOpen,
    generateAIPlan,
    acceptAIPlan,

    // Week Navigation
    currentWeekStart,
    prevWeek,
    nextWeek,
    resetWeek,
  };
}
