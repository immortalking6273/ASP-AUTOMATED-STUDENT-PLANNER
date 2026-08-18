/**
 * Document Upload & Processing Pipeline Feature Exports
 */

export * from "./components/upload-area";
export * from "./components/upload-queue";
export * from "./components/document-card";
export * from "./components/document-grid";
export * from "./components/document-list";
export * from "./components/document-toolbar";
export * from "./components/document-details-panel";
export * from "./components/rename-document-modal";
export * from "./components/move-document-modal";
export * from "./components/delete-document-dialog";
export * from "./components/empty-document-state";
export * from "./components/loading-document-state";
export * from "./components/document-status-badge";
export * from "./components/ai-processing-status";
export * from "./components/chunk-progress";
export * from "./components/knowledge-summary";
export * from "./components/processing-timeline";
export * from "./components/ai-readiness-card";
export * from "./components/retry-processing-dialog";
export * from "./components/error-recovery-panel";
export * from "./components/processing-queue";

export * from "./hooks/use-documents";
export * from "./hooks/use-document-upload";
export * from "./hooks/use-document-details";
export * from "./hooks/use-pipeline-status";


export * from "./types";
export * from "./utils/validation";
export * from "@/services/db/documents-service";

export const DOCUMENTS_MODULE_STATUS = "module_9_ai_knowledge_processing_pipeline_active";
