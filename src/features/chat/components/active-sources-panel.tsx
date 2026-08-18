"use client";

import * as React from "react";
import { SourceScope } from "../types";
import { Globe, Layers, FileText, Check, X, Search } from "lucide-react";
import { UploadedDocumentRow, NotebookRow } from "@/types/database";
import { DocumentsService, NotebooksService } from "@/services/db";
import { cn } from "@/lib/utils";

interface ActiveSourcesPanelProps {
  isOpen: boolean;
  workspaceId: string | null;
  currentScope: SourceScope;
  onClose: () => void;
  onApplyScope: (scope: SourceScope) => void;
}

export function ActiveSourcesPanel({
  isOpen,
  workspaceId,
  currentScope,
  onClose,
  onApplyScope,
}: ActiveSourcesPanelProps) {
  const [activeTab, setActiveTab] = React.useState<"workspace" | "notebook" | "documents">(
    currentScope.type
  );

  const [notebooks, setNotebooks] = React.useState<NotebookRow[]>([]);
  const [documents, setDocuments] = React.useState<UploadedDocumentRow[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = React.useState<string | null>(
    currentScope.notebookId || null
  );
  const [selectedDocIds, setSelectedDocIds] = React.useState<string[]>(
    currentScope.documentIds || []
  );
  const [searchDocQuery, setSearchDocQuery] = React.useState("");

  React.useEffect(() => {
    if (workspaceId && isOpen) {
      NotebooksService.getNotebooks(workspaceId).then((res) => setNotebooks(res.data));
      DocumentsService.getDocuments(workspaceId).then((docs) => setDocuments(docs));
    }
  }, [workspaceId, isOpen]);

  if (!isOpen) return null;

  const toggleDocSelect = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleApply = () => {
    if (activeTab === "workspace") {
      onApplyScope({ type: "workspace" });
    } else if (activeTab === "notebook" && selectedNotebookId) {
      const nb = notebooks.find((n) => n.id === selectedNotebookId);
      onApplyScope({
        type: "notebook",
        notebookId: selectedNotebookId,
        notebookTitle: nb?.title || "Notebook",
      });
    } else if (activeTab === "documents" && selectedDocIds.length > 0) {
      const selectedDocs = documents.filter((d) => selectedDocIds.includes(d.id));
      onApplyScope({
        type: "documents",
        documentIds: selectedDocIds,
        documentTitles: selectedDocs.map((d) => d.display_name || d.original_name),
      });
    } else {
      onApplyScope({ type: "workspace" });
    }
    onClose();
  };

  const filteredDocs = documents.filter((d) =>
    (d.display_name || d.original_name).toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in-0">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-foreground">Select Active AI Sources</h3>
            <p className="text-xs text-muted-foreground">
              Choose which knowledge materials ASP AI should retrieve facts from.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scope Tabs */}
        <div className="flex rounded-2xl bg-muted/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("workspace")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all",
              activeTab === "workspace"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-500" />
            <span>Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notebook")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all",
              activeTab === "notebook"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>Notebook</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all",
              activeTab === "documents"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5 text-indigo-500" />
            <span>Documents ({selectedDocIds.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="min-h-[220px] max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {activeTab === "workspace" && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center space-y-2">
              <Globe className="h-8 w-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-foreground">All Workspace Documents</h4>
              <p className="text-xs text-muted-foreground">
                ASP AI will retrieve knowledge across all processed course materials, PDFs, and notes in this workspace.
              </p>
            </div>
          )}

          {activeTab === "notebook" && (
            <div className="space-y-1.5">
              {notebooks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No notebooks found in workspace.</p>
              ) : (
                notebooks.map((nb) => (
                  <div
                    key={nb.id}
                    onClick={() => setSelectedNotebookId(nb.id)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border p-3 cursor-pointer text-xs transition-all",
                      selectedNotebookId === nb.id
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border/60 bg-card hover:bg-accent text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span>{nb.title}</span>
                    </div>
                    {selectedNotebookId === nb.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  placeholder="Filter documents..."
                  className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {filteredDocs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No documents found.</p>
              ) : (
                filteredDocs.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocSelect(doc.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-2.5 cursor-pointer text-xs transition-all",
                        isChecked
                          ? "border-indigo-500 bg-indigo-500/10 font-bold text-foreground"
                          : "border-border/60 bg-card hover:bg-accent text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{doc.display_name || doc.original_name}</span>
                      </div>
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-all",
                        isChecked ? "bg-indigo-500 border-indigo-500 text-white" : "border-border"
                      )}>
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            Apply Active Sources
          </button>
        </div>
      </div>
    </div>
  );
}
