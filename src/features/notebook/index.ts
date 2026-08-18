/**
 * Notebook & Page Management Feature Exports
 */

export * from "./components/notebook-sidebar";
export * from "./components/notebook-tree";
export * from "./components/notebook-card";
export * from "./components/notebook-grid";
export * from "./components/notebook-list";
export * from "./components/notebook-header";
export * from "./components/notebook-toolbar";
export * from "./components/page-tree";
export * from "./components/page-tree-item";
export * from "./components/page-breadcrumb";
export * from "./components/notebook-search";
export * from "./components/notebook-filters";
export * from "./components/notebook-context-menu";
export * from "./components/create-notebook-modal";
export * from "./components/create-page-modal";
export * from "./components/move-page-modal";
export * from "./components/delete-notebook-dialog";
export * from "./components/archive-notebook-dialog";
export * from "./components/empty-notebook-state";
export * from "./components/loading-notebook-state";

export * from "./hooks/use-notebooks";
export * from "./hooks/use-notebook-detail";
export * from "./hooks/use-page-tree";

export * from "./types";
export * from "@/services/db/notebooks-service";
export * from "@/services/db/pages-service";

export const NOTEBOOK_MODULE_STATUS = "module_6_notebook_page_management_active";
