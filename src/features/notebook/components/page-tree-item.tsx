"use client";

import * as React from "react";
import Link from "next/link";
import { PageTreeNode } from "@/services/db/pages-service";
import { PageRow } from "@/types/database";
import { NotebookContextMenu } from "./notebook-context-menu";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  Star,
  GripVertical,
  Layers,
} from "lucide-react";

export interface PageTreeItemProps {
  node: PageTreeNode;
  activePageId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRename: (page: PageRow) => void;
  onDuplicate: (page: PageRow) => void;
  onFavorite: (id: string, current: boolean) => void;
  onMove: (page: PageRow) => void;
  onArchive: (page: PageRow) => void;
  onDelete: (page: PageRow) => void;
  level?: number;
}

export const PageTreeItem: React.FC<PageTreeItemProps> = ({
  node,
  activePageId,
  expandedIds,
  onToggleExpand,
  onAddChild,
  onRename,
  onDuplicate,
  onFavorite,
  onMove,
  onArchive,
  onDelete,
  level = 0,
}) => {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = activePageId === node.id;

  const indentStyle = { paddingLeft: `${level * 16 + 12}px` };

  return (
    <div className="space-y-0.5 select-none">
      <div
        style={indentStyle}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-xl text-xs font-medium transition-all ${
          isActive
            ? "bg-primary/10 text-primary font-bold shadow-xs border-l-2 border-primary"
            : "hover:bg-accent/60 text-foreground"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
          {/* Expand/Collapse Chevron */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.id);
              }}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 cursor-grab shrink-0" />

          <Link
            href={`/notebook/${node.notebook_id}/page/${node.id}`}
            className="flex items-center gap-2 min-w-0 flex-1 truncate py-0.5"
          >
            <FileText className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-indigo-500"}`} />
            <span className="truncate">{node.title}</span>
          </Link>

          {node.is_favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
        </div>

        {/* Quick Hover Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            title="Add Sub-Page"
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          <NotebookContextMenu
            onRename={() => onRename(node)}
            onDuplicate={() => onDuplicate(node)}
            onFavorite={() => onFavorite(node.id, node.is_favorite)}
            isFavorite={node.is_favorite}
            onMove={() => onMove(node)}
            onArchive={() => onArchive(node)}
            onDelete={() => onDelete(node)}
          />
        </div>
      </div>

      {/* Recursive Children Branch */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
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
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
