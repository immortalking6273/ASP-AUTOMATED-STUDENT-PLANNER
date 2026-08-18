import { createClient } from "./client";

export interface DatabaseHealthStatus {
  isHealthy: boolean;
  missingTables: string[];
  existingTables: string[];
  errorDetails: string | null;
}

export const REQUIRED_ASP_TABLES = [
  "profiles",
  "workspaces",
  "notebooks",
  "pages",
  "blocks",
  "uploaded_documents",
  "tasks",
  "study_sessions",
  "reminders",
  "notifications",
  "flashcards",
  "quizzes",
  "chat_history",
  "analytics",
] as const;

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const supabase = createClient();
  const missingTables: string[] = [];
  const existingTables: string[] = [];
  let lastError: string | null = null;

  for (const table of REQUIRED_ASP_TABLES) {
    try {
      const { error } = await supabase.from(table).select("*").limit(1);
      if (error) {
        if (error.code === "PGRST205" || error.message.includes("schema cache")) {
          missingTables.push(table);
        } else {
          // Table exists but query returned another error (e.g., empty result or RLS filtering)
          existingTables.push(table);
        }
        lastError = error.message;
      } else {
        existingTables.push(table);
      }
    } catch (err: any) {
      missingTables.push(table);
      lastError = err.message;
    }
  }

  return {
    isHealthy: missingTables.length === 0,
    missingTables,
    existingTables,
    errorDetails: lastError,
  };
}
