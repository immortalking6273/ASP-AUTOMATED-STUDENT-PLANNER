import { RouteMeta } from "@/types";

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  WORKSPACE: "/workspace",
  NOTES: "/notes",
  DOCUMENTS: "/documents",
  KNOWLEDGE_BASE: "/knowledge-base",
  PLANNER: "/planner",
  CALENDAR: "/calendar",
  TASKS: "/tasks",
  FLASHCARDS: "/flashcards",
  QUIZZES: "/quizzes",
  CHAT: "/chat",
  ANALYTICS: "/analytics",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  HELP: "/help",

  // Status & Error Pages
  MAINTENANCE: "/maintenance",
  OFFLINE: "/offline",
  UNAUTHORIZED: "/unauthorized",
  FORBIDDEN: "/forbidden",
} as const;

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    title: "Automated Student Planner",
    description: "Your AI-powered study workspace for notes, documents, planning, and active recall.",
    isProtected: false,
  },
  [ROUTES.DASHBOARD]: {
    path: ROUTES.DASHBOARD,
    title: "Dashboard",
    description: "Overview of your recent study activities, upcoming deadlines, and study stats.",
    isProtected: true,
  },
  [ROUTES.WORKSPACE]: {
    path: ROUTES.WORKSPACE,
    title: "Workspace",
    description: "Centralized workspace to organize notebooks, subjects, and study materials.",
    isProtected: true,
  },
  [ROUTES.NOTES]: {
    path: ROUTES.NOTES,
    title: "Notes",
    description: "Rich markdown and rich-text note taking engine integrated with AI synthesis.",
    isProtected: true,
  },
  [ROUTES.DOCUMENTS]: {
    path: ROUTES.DOCUMENTS,
    title: "Documents",
    description: "Upload and manage PDFs, PPTs, DOCX files for document AI analysis.",
    isProtected: true,
  },
  [ROUTES.PLANNER]: {
    path: ROUTES.PLANNER,
    title: "Planner",
    description: "Automated assignment planner, study scheduler, and milestone tracking.",
    isProtected: true,
  },
  [ROUTES.CALENDAR]: {
    path: ROUTES.CALENDAR,
    title: "Calendar",
    description: "Visual study schedule, exam timetable, and submission reminders.",
    isProtected: true,
  },
  [ROUTES.TASKS]: {
    path: ROUTES.TASKS,
    title: "Tasks",
    description: "Prioritized study task manager with subtasks and time estimations.",
    isProtected: true,
  },
  [ROUTES.FLASHCARDS]: {
    path: ROUTES.FLASHCARDS,
    title: "Flashcards",
    description: "AI-generated spaced repetition flashcards for rapid concept mastery.",
    isProtected: true,
  },
  [ROUTES.QUIZZES]: {
    path: ROUTES.QUIZZES,
    title: "Quizzes",
    description: "Interactive practice quizzes generated directly from your uploaded materials.",
    isProtected: true,
  },
  [ROUTES.CHAT]: {
    path: ROUTES.CHAT,
    title: "AI Chat Assistant",
    description: "Context-aware AI study assistant powered by Groq and RAG architecture.",
    isProtected: true,
  },
  [ROUTES.ANALYTICS]: {
    path: ROUTES.ANALYTICS,
    title: "Analytics",
    description: "Study performance insights, time tracking, and learning progress analytics.",
    isProtected: true,
  },
  [ROUTES.NOTIFICATIONS]: {
    path: ROUTES.NOTIFICATIONS,
    title: "Notifications & Reminders",
    description: "Notifications, deadline alerts, study reminders, and system events.",
    isProtected: true,
  },
  [ROUTES.SETTINGS]: {
    path: ROUTES.SETTINGS,
    title: "Settings",
    description: "Manage account preferences, notification thresholds, and AI parameters.",
    isProtected: true,
  },
  [ROUTES.PROFILE]: {
    path: ROUTES.PROFILE,
    title: "Profile",
    description: "Manage student profile, academic level, goals, and security preferences.",
    isProtected: true,
  },
  [ROUTES.HELP]: {
    path: ROUTES.HELP,
    title: "Help & Support",
    description: "User guides, keyboard shortcuts, FAQ, and technical support assistance.",
    isProtected: false,
  },
};
