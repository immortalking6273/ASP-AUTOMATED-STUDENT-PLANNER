export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface PlannerTask {
  id: string;
  workspaceId: string;
  userId?: string | null;
  title: string;
  description?: string | null;
  subject?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudySessionItem {
  id: string;
  workspaceId?: string | null;
  userId: string;
  title: string;
  subject?: string | null;
  startTime: string;
  endTime: string;
  durationMinutes?: number | null;
  notes?: string | null;
  createdAt?: string;
}

export type TaskFilterTab = "all" | "today" | "upcoming" | "overdue" | "completed";

export interface PlannerFilterState {
  tab: TaskFilterTab;
  priority?: TaskPriority | "all";
  subject?: string | "all";
  status?: TaskStatus | "all";
  searchQuery: string;
  sortBy: "dueDate" | "priority" | "createdAt" | "status";
  sortOrder: "asc" | "desc";
}

export interface AIStudySessionBlock {
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  reasoning?: string;
  taskId?: string;
}

export interface AIStudyPlanResponse {
  summary: string;
  totalStudyMinutes: number;
  sessions: AIStudySessionBlock[];
}
