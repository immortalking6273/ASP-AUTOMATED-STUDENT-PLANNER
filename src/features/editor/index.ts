/**
 * Block-Based Note System Feature Exports
 */

export * from "./components/block-editor";
export * from "./components/block-item";
export * from "./components/page-meta-bar";
export * from "./components/slash-command-menu";
export * from "./components/formatting-toolbar";
export * from "./components/in-page-search";

export * from "./hooks/use-block-editor";
export * from "./hooks/use-auto-save";
export * from "./hooks/use-slash-command";
export * from "./hooks/use-formatting-toolbar";
export * from "./hooks/use-editor-shortcuts";
export * from "./hooks/use-in-page-search";

export * from "./types";
export * from "@/services/db/blocks-service";

export const EDITOR_MODULE_STATUS = "module_7_block_based_note_system_active";
