import { NavigationSection } from "@/types";
import { ROUTES } from "./routes";

export const SIDEBAR_NAVIGATION: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: ROUTES.DASHBOARD, iconName: "LayoutDashboard" },
      { title: "Workspace", href: ROUTES.WORKSPACE, iconName: "FolderKanban" },
    ],
  },
  {
    title: "Content & AI Workspace",
    items: [
      { title: "Notes", href: ROUTES.NOTES, iconName: "FileText" },
      { title: "Documents", href: ROUTES.DOCUMENTS, iconName: "Files" },
      { title: "AI Chat", href: ROUTES.CHAT, iconName: "Bot" },
      { title: "Flashcards", href: ROUTES.FLASHCARDS, iconName: "Layers" },
      { title: "Quizzes", href: ROUTES.QUIZZES, iconName: "HelpCircle" },
    ],
  },
  {
    title: "Planning & Productivity",
    items: [
      { title: "Study Planner", href: ROUTES.PLANNER, iconName: "CalendarDays" },
      { title: "Calendar", href: ROUTES.CALENDAR, iconName: "Calendar" },
      { title: "Analytics", href: ROUTES.ANALYTICS, iconName: "BarChart3" },
    ],
  },
  {
    title: "Account & System",
    items: [
      { title: "Settings", href: ROUTES.SETTINGS, iconName: "Settings" },
      { title: "Profile", href: ROUTES.PROFILE, iconName: "User" },
      { title: "Help & FAQ", href: ROUTES.HELP, iconName: "HelpCircle" },
    ],
  },
];
