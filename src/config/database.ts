/**
 * Future Database Configuration (Placeholder for Supabase PostgreSQL in Future Module)
 */

export const databaseConfig = {
  provider: "supabase" as const,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  tables: {
    users: "users",
    profiles: "profiles",
    workspaces: "workspaces",
    notes: "notes",
    documents: "documents",
    tasks: "tasks",
    flashcards: "flashcards",
    quizzes: "quizzes",
    chatHistory: "chat_history",
  },
  maxConnectionPool: 20,
  status: "configured_placeholder",
};
