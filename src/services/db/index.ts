/**
 * Central Export Point for Database Access Services
 *
 * NOTE: knowledge-base-service is intentionally NOT exported from this barrel.
 * It must be imported directly in server-only contexts:
 *   import { KnowledgeBaseService } from "@/services/db/knowledge-base-service";
 * This prevents client components from transitively pulling in server-only modules
 * (pdf-parse → fs) through this shared barrel file.
 */

export * from "./base-service";
export * from "./profiles-service";
export * from "./workspaces-service";
export * from "./notebooks-service";
export * from "./pages-service";
export * from "./blocks-service";
export * from "./tasks-service";
export * from "./documents-service";
export * from "./study-service";
export * from "./chat-service";
export * from "./study-planner-service";
export * from "./calendar-events-service";
export * from "./flashcards-service";
export * from "./quizzes-service";
export * from "./analytics-service";
export * from "./notifications-service";
export * from "./settings-service";
export * from "./help-faq-service";
