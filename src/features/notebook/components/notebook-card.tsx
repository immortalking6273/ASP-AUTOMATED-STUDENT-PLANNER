"use client";

import * as React from "react";
import Link from "next/link";
import { NotebookRow } from "@/types/database";
import { NotebookContextMenu } from "./notebook-context-menu";
import { HighlightText } from "./notebook-search";
import {
  FileText,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Brain,
  Sparkles,
  Calculator,
  Code,
  Star,
  Pin,
  Clock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotebookCardProps {
  notebook: NotebookRow;
  searchQuery?: string;
  onEdit: (nb: NotebookRow) => void;
  onDelete: (nb: NotebookRow) => void;
  onArchive: (nb: NotebookRow) => void;
  onRestore?: (nb: NotebookRow) => void;
  onDuplicate: (nb: NotebookRow) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTogglePin: (id: string, current: boolean) => void;
  pageCount?: number;
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

export const NotebookCard: React.FC<NotebookCardProps> = ({
  notebook,
  searchQuery = "",
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
  pageCount = 0,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const IconComp = ICON_MAP[notebook.icon || "FileText"] || FileText;
  const themeColor = notebook.color || "#7C3AED";

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        isMenuOpen ? "z-30 border-primary/40 shadow-xl" : "z-10 hover:z-20"
      )}
    >
      {/* Top Accent Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl transition-all group-hover:h-2"
        style={{ backgroundColor: themeColor }}
      />

      <div className="space-y-3">
        {/* Card Header Bar */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: themeColor }}
          >
            <IconComp className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1">
            {notebook.is_pinned && (
              <span className="p-1 rounded-lg bg-primary/10 text-primary" title="Pinned">
                <Pin className="h-3.5 w-3.5 fill-current" />
              </span>
            )}

            {notebook.is_favorite && (
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-500" title="Favorite">
                <Star className="h-3.5 w-3.5 fill-current" />
              </span>
            )}

            <NotebookContextMenu
              onOpenChange={setIsMenuOpen}
              onRename={() => onEdit(notebook)}
              onDuplicate={() => onDuplicate(notebook)}
              onFavorite={() => onToggleFavorite(notebook.id, notebook.is_favorite)}
              isFavorite={notebook.is_favorite}
              onPin={() => onTogglePin(notebook.id, notebook.is_pinned)}
              isPinned={notebook.is_pinned}
              onArchive={() => onArchive(notebook)}
              onRestore={onRestore ? () => onRestore(notebook) : undefined}
              isArchived={notebook.is_archived}
              onDelete={() => onDelete(notebook)}
            />
          </div>
        </div>

        {/* Title & Description Link */}
        <Link href={`/notebook/${notebook.id}`} className="block space-y-1 group-hover:text-primary transition-colors">
          <h3 className="font-bold text-base tracking-tight text-foreground line-clamp-1">
            <HighlightText text={notebook.title} query={searchQuery} />
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
            {notebook.description ? (
              <HighlightText text={notebook.description} query={searchQuery} />
            ) : (
              <span className="italic text-muted-foreground/60">No description provided</span>
            )}
          </p>
        </Link>
      </div>

      {/* Footer Info Bar */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>{pageCount} {pageCount === 1 ? "Page" : "Pages"}</span>
        </div>

        <div className="flex items-center gap-1 font-medium text-muted-foreground/80">
          <Clock className="h-3 w-3" />
          <span>{new Date(notebook.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
