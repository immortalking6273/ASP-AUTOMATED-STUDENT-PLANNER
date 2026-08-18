"use client";

import * as React from "react";
import { PageTreeNode } from "@/services/db/pages-service";
import { PageRow } from "@/types/database";
import { PageTreeItem } from "./page-tree-item";
import { Button } from "@/components/ui/button";
import { Plus, Maximize2, Minimize2, Layers, FilePlus } from "lucide-react";

export interface PageTreeProps {
  tree: PageTreeNode[];
  activePageId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCreateRootPage: () => void;
  onAddChild: (parentId: string) => void;
  onRename: (page: PageRow) => void;
  onDuplicate: (page: PageRow) => void;
  onFavorite: (id: string, current: boolean) => void;
  onMove: (page: PageRow) => void;
  onArchive: (page: PageRow) => void;
  onDelete: (page: PageRow) => void;
}

export const PageTree: React.FC<PageTreeProps> = ({
  tree,
  activePageId,
  expandedIds,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onCreateRootPage,
  onAddChild,
  onRename,
  onDuplicate,
  onFavorite,
  onMove,
  onArchive,
  onDelete,
}) => {
  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-4 shadow-sm space-y-3">
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          <span>Notebook Hierarchy</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onExpandAll}
            title="Expand All"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-xs font-medium transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onCollapseAll}
            title="Collapse All"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent text-xs font-medium transition-colors"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={onCreateRootPage}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            className="text-[11px] h-7 px-2.5 rounded-xl ml-1"
          >
            Add Page
          </Button>
        </div>
      </div>

      {/* Tree Content */}
      {tree.length === 0 ? (
        <div className="text-center py-8 space-y-2 text-xs text-muted-foreground">
          <FilePlus className="h-8 w-8 mx-auto text-muted-foreground/40" />
          <p className="font-medium">No pages created yet.</p>
          <Button variant="outline" size="sm" onClick={onCreateRootPage} className="text-xs rounded-xl">
            Create First Page
          </Button>
        </div>
      ) : (
        <div className="space-y-0.5 max-h-[600px] overflow-y-auto pr-1">
          {tree.map((node) => (
            <PageTreeItem
              key={node.id}
              node={node}
              activePageId={activePageId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onFavorite={onFavorite}
              onMove={onMove}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
