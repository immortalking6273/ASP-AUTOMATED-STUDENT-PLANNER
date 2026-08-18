"use client";

import * as React from "react";
import { NotebookRow } from "@/types/database";
import { NotebookContextMenu } from "./notebook-context-menu";
import { Button } from "@/components/ui/button";
import {
  FileText,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Brain,
  Sparkles,
  Calculator,
  Code,
  Plus,
  Star,
  Pin,
  Clock,
  Layers,
} from "lucide-react";

export interface NotebookHeaderProps {
  notebook: NotebookRow;
  stats?: { pageCount: number; lastUpdated: string | null };
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onCreatePageClick: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Brain,
  Sparkles,
  Calculator,
  Code,
};

export const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  notebook,
  stats,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
  onCreatePageClick,
}) => {
  const IconComp = ICON_MAP[notebook.icon || "FileText"] || FileText;
  const themeColor = notebook.color || "#6366f1";

  return (
    <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-lg overflow-hidden space-y-4">
      {/* Background Accent Blob */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <IconComp className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {notebook.title}
              </h1>

              {notebook.is_pinned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-400/20">
                  <Pin className="h-3 w-3 fill-current" /> Pinned
                </span>
              )}

              {notebook.is_favorite && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <Star className="h-3 w-3 fill-current" /> Favorite
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              {notebook.description || <span className="italic">No description provided</span>}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={onCreatePageClick}
            leftIcon={<Plus className="h-4 w-4" />}
            className="rounded-xl shadow-xs text-xs font-semibold"
          >
            New Page
          </Button>

          <NotebookContextMenu
            onRename={onEdit}
            onDuplicate={onDuplicate}
            onFavorite={onToggleFavorite}
            isFavorite={notebook.is_favorite}
            onPin={onTogglePin}
            isPinned={notebook.is_pinned}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Meta Stats Bar */}
      <div className="flex items-center gap-6 pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Layers className="h-4 w-4 text-primary" />
          <span>{stats?.pageCount || 0} Pages</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            Last updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : new Date(notebook.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};
