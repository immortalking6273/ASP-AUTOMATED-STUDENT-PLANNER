/**
 * Core Type Definitions for ASP (Automated Student Planner)
 */

export type Role = "student" | "educator" | "admin" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NavigationItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  isExternal?: boolean;
  disabled?: boolean;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  isProtected: boolean;
  requiredRole?: Role;
}

/* Feature Placeholder Interfaces for Future Modules */

export interface WorkspaceItem {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: "pdf" | "ppt" | "docx" | "txt";
  fileSize: number;
  uploadDate: string;
  status: "processing" | "ready" | "error";
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed";
}

export interface FlashcardItem {
  id: string;
  deckId: string;
  front: string;
  back: string;
  masteryLevel: number;
}

export interface QuizItem {
  id: string;
  title: string;
  questionCount: number;
  score?: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  content: string;
  timestamp: string;
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  date: string;
}
