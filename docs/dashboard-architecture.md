# ASP Dashboard Architecture Documentation

> **Module 4: Dashboard & User Home**

This document describes the architectural layout, component hierarchy, state flow, responsive design strategy, and future AI integration points for the **Automated Student Planner (ASP)** Dashboard.

---

## 1. Component Hierarchy

```
DashboardPage (src/app/(dashboard)/dashboard/page.tsx)
├── GreetingSection (Time-aware greeting, motivation quote, daily goal meter, streak)
├── QuickActionsGrid (New Note, Upload Doc, New Task, Open Calendar, AI Assistant, Create Workspace)
├── Primary Statistics Grid (4 StatCards: Workspaces, Deadlines, Study Hours, Documents/Notes)
└── Responsive 3-Column Grid Layout
    ├── Left Section (2 Columns)
    │   ├── UpcomingDeadlines (Priority-badged tasks & status toggles)
    │   ├── FavoriteWorkspaces (Recent subject containers & quick open)
    │   └── RecentActivity (Timeline of notes, docs, tasks, study sessions)
    └── Right Section (1 Column)
        ├── ProfileSummaryWidget (Avatar, student info, workspace count, joined date)
        ├── StudyProgressCard (Weekly study hours bar chart visual)
        ├── CalendarPreview (Compact monthly calendar with today highlighter)
        └── AIInsightsCard (Futuristic AI Assistant recommendation teaser)
```

---

## 2. State & Data Flow (`useDashboardData`)

- **Authentication Hydration**: Extracts `user` and `profile` from `useAuth()`.
- **Database Fetching**:
  - `WorkspacesService.getWorkspaces(userId)` -> Retrieves active workspaces.
  - `TasksService.getTasksByWorkspace(workspaceId)` -> Retrieves upcoming deadlines and assignment status.
  - `DocumentsService.getDocumentsByWorkspace(workspaceId)` -> Retrieves uploaded document counts.
- **States Handled**:
  - `Loading`: Displays `LoadingDashboard` full-page skeleton.
  - `Error`: Displays user-friendly error retry UI.
  - `Empty`: Displays `EmptyDashboard` onboarding screen when a user has 0 workspaces.
  - `Ready`: Renders full dashboard dashboard layout.

---

## 3. Responsive Strategy

- **Desktop (≥ 1024px)**: 3-column layout (2-column main feed + 1-column right info panel).
- **Tablet (768px - 1023px)**: 2-column layout.
- **Mobile (< 768px)**: 1-column vertical layout with fixed `MobileBottomNav` for quick navigation between Home, Workspace, Notes, Calendar, and Profile.

---

## 4. Future Integration Hooks (Module 5+)

- **Module 5 (Workspace Management)**: Quick action "Create Workspace" and "Recent Workspaces" cards will open modal handlers to create workspaces and link directly to active subject views.
- **Module 6 (Rich Text Notes)**: "New Note" quick action will open the rich text editor.
- **Module 7 (Document Management & Storage)**: "Upload Document" quick action will trigger file dropzone modal.
- **Module 8 (AI Engine & Chat)**: `AIInsightsCard` will query live Groq AI models to suggest personalized daily revision topics based on document RAG index.
