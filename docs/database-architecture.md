# ASP Database Architecture Documentation

> **Module 3: Supabase PostgreSQL Database Architecture**

This document provides a technical overview of the **ASP (Automated Student Planner)** database schema, entity relationships, Row Level Security (RLS) policies, storage bucket configurations, and data access service layer.

---

## 1. Entity Relationship (ER) Diagram Overview

```
[auth.users] (Supabase Auth)
    │
    ▼ (1:1)
[public.profiles] ──┬─────────────────────────────────────────────────────────────┐
    │               │                                                             │
    ▼ (1:N)         ▼ (1:N)                                                       ▼ (1:N)
[workspaces]    [study_sessions]                                            [notifications]
    │
    ├─────────────────────────────┬─────────────────────────────┐
    ▼ (1:N)                       ▼ (1:N)                       ▼ (1:N)
[notebooks]               [uploaded_documents]              [tasks]
    │                                                           │
    ▼ (1:N)                                                     ▼ (1:N)
 [pages] (Self-referencing tree)                             [reminders]
    │
    ▼ (1:N)
 [blocks]
```

### Schema-Only Tables (Prepared for Future Modules):
- `flashcards` (User & Workspace linked)
- `quizzes` (User & Workspace linked)
- `chat_history` (User & Workspace linked RAG logs)
- `analytics` (User metric logs)

---

## 2. Table Specifications

| Table | Description | Primary Key | Key Foreign Keys | Soft Delete Support |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | Student profile info, bio, theme preferences | `id` (UUID) | `user_id -> auth.users.id` | No |
| `workspaces` | Workspace containers for notes, docs, and tasks | `id` (UUID) | `owner_id -> profiles.user_id` | `is_archived` |
| `notebooks` | Folders/Notebooks organizing pages inside workspaces | `id` (UUID) | `workspace_id -> workspaces.id` | No |
| `pages` | Individual note documents inside notebooks | `id` (UUID) | `notebook_id`, `parent_page_id` | `is_archived` |
| `blocks` | Content blocks inside pages (paragraph, heading, code, etc.) | `id` (UUID) | `page_id -> pages.id` | No |
| `uploaded_documents` | File upload metadata (PDF, PPT, DOCX) | `id` (UUID) | `workspace_id`, `uploader_id` | No |
| `tasks` | Assignment tasks and subtasks | `id` (UUID) | `workspace_id -> workspaces.id` | No |
| `study_sessions` | Time tracking study logs | `id` (UUID) | `user_id -> profiles.user_id` | No |
| `reminders` | Due date alerts linked to tasks | `id` (UUID) | `task_id -> tasks.id` | No |
| `notifications` | In-app user notifications | `id` (UUID) | `user_id -> profiles.user_id` | No |

---

## 3. Row Level Security (RLS) Policies

All 14 tables have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

- **Workspaces & Notebooks**: Users can only perform `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations on workspaces where `owner_id = auth.uid()`.
- **Pages & Blocks**: Access is constrained via SQL `EXISTS` subqueries verifying workspace ownership chain.
- **Documents & Tasks**: Constrained to workspace owner or uploader ID.
- **Study Sessions, Notifications, Flashcards, Quizzes, Chat**: Strict `auth.uid() = user_id` access control.

---

## 4. Supabase Storage Buckets Configuration

| Bucket Name | Public Access | Purpose | Path Pattern |
| :--- | :--- | :--- | :--- |
| `avatars` | Yes | Student profile images | `avatars/{user_id}/avatar.png` |
| `documents` | No (Private) | Uploaded PDFs, PPTs, DOCX files | `documents/{user_id}/{workspace_id}/{filename}` |
| `covers` | Yes | Page cover banner images | `covers/{user_id}/{page_id}.png` |
| `attachments` | No (Private) | Inline page images and attachments | `attachments/{user_id}/{filename}` |

---

## 5. How to Run Migrations

1. Open your [Supabase Project Dashboard](https://supabase.com/).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open `supabase/migrations/20260804000000_module3_database_schema.sql` and copy its full contents.
4. Click **Run** to execute the migration.

---

## 6. Service Layer Usage Example

```typescript
import { WorkspacesService, TasksService } from "@/services/db";

// Fetch user workspaces
const result = await WorkspacesService.getWorkspaces(userId, {
  page: 1,
  pageSize: 10,
  sortBy: "created_at",
  sortOrder: "desc",
});

console.log(`Found ${result.count} workspaces`);
```
