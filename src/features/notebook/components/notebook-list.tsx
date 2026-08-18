"use client";

import * as React from "react";
import Link from "next/link";
import { NotebookRow } from "@/types/database";
import { NotebookContextMenu } from "./notebook-context-menu";
import { HighlightText } from "./notebook-search";
import { FileText, Star, Pin, Calendar, Tag } from "lucide-react";

export interface NotebookListProps {
  notebooks: NotebookRow[];
  searchQuery?: string;
  onEdit: (nb: NotebookRow) => void;
  onDelete: (nb: NotebookRow) => void;
  onArchive: (nb: NotebookRow) => void;
  onRestore?: (nb: NotebookRow) => void;
  onDuplicate: (nb: NotebookRow) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTogglePin: (id: string, current: boolean) => void;
}

export const NotebookList: React.FC<NotebookListProps> = ({
  notebooks,
  searchQuery = "",
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md shadow-sm">
      <div className="divide-y divide-border/40">
        {notebooks.map((nb) => {
          const themeColor = nb.color || "#6366f1";
          return (
            <div
              key={nb.id}
              className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/notebook/${nb.id}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                    >
                      <HighlightText text={nb.title} query={searchQuery} />
                    </Link>

                    {nb.is_pinned && <Pin className="h-3.5 w-3.5 fill-purple-500 text-purple-500 shrink-0" />}
                    {nb.is_favorite && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                  </div>

                  <p className="text-xs text-muted-foreground truncate max-w-md">
                    {nb.description ? (
                      <HighlightText text={nb.description} query={searchQuery} />
                    ) : (
                      <span className="italic text-muted-foreground/60">No description</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                <div className="hidden sm:flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(nb.updated_at).toLocaleDateString()}</span>
                </div>

                <NotebookContextMenu
                  onRename={() => onEdit(nb)}
                  onDuplicate={() => onDuplicate(nb)}
                  onFavorite={() => onToggleFavorite(nb.id, nb.is_favorite)}
                  isFavorite={nb.is_favorite}
                  onPin={() => onTogglePin(nb.id, nb.is_pinned)}
                  isPinned={nb.is_pinned}
                  onArchive={() => onArchive(nb)}
                  onRestore={onRestore ? () => onRestore(nb) : undefined}
                  isArchived={nb.is_archived}
                  onDelete={() => onDelete(nb)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
