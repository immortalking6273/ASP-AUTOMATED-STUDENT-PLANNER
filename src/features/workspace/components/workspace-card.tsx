"use client";

import * as React from "react";
import Link from "next/link";
import { WorkspaceRow } from "@/types/database";
import { FavoriteButton } from "./favorite-button";
import {
  FolderKanban,
  BookOpen,
  GraduationCap,
  Code,
  Layers,
  FileText,
  Compass,
  Sparkles,
  MoreVertical,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  FolderKanban: <FolderKanban className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  Code: <Code className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Compass: <Compass className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
};

export interface WorkspaceCardProps {
  workspace: WorkspaceRow;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onEdit: (workspace: WorkspaceRow) => void;
  onDuplicate: (id: string) => void;
  onArchive: (workspace: WorkspaceRow) => void;
  onRestore?: (id: string) => void;
  onDelete: (workspace: WorkspaceRow) => void;
  viewMode?: "grid" | "list";
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  isFavorite,
  onToggleFavorite,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  viewMode = "grid",
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const formattedDate = new Date(workspace.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const iconComponent = ICON_MAP[workspace.icon] || <FolderKanban className="h-4 w-4" />;
  const cardColor = workspace.color || "#6366f1";

  if (viewMode === "list") {
    return (
      <div className="group relative flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
            style={{ backgroundColor: cardColor }}
          >
            {iconComponent}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/workspace/${workspace.id}`}
                className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
              >
                {workspace.title}
              </Link>
              {workspace.is_archived && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                  Archived
                </span>
              )}
            </div>
            {workspace.description && (
              <p className="text-xs text-muted-foreground truncate max-w-md">
                {workspace.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>

          <FavoriteButton isFavorite={isFavorite} onToggle={() => onToggleFavorite(workspace.id)} size="sm" />

          {/* Context Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-fadeIn text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(workspace);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Edit Workspace</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(workspace.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Duplicate</span>
                </button>

                {workspace.is_archived ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRestore?.(workspace.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-amber-500 hover:bg-amber-500/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive(workspace);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-amber-500 hover:bg-amber-500/10"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span>Archive</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(workspace);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View Card
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl overflow-hidden">
      {/* Accent Color Bar */}
      <div className="h-2 w-full" style={{ backgroundColor: cardColor }} />

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm shrink-0"
              style={{ backgroundColor: cardColor }}
            >
              {iconComponent}
            </div>
            <div className="flex flex-col">
              <Link
                href={`/workspace/${workspace.id}`}
                className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {workspace.title}
              </Link>
              {workspace.is_archived && (
                <span className="w-fit rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                  Archived
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <FavoriteButton isFavorite={isFavorite} onToggle={() => onToggleFavorite(workspace.id)} size="sm" />

            {/* Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-fadeIn text-xs space-y-0.5">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(workspace);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Edit Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(workspace.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-foreground hover:bg-accent"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Duplicate</span>
                  </button>

                  {workspace.is_archived ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRestore?.(workspace.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-amber-500 hover:bg-amber-500/10"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onArchive(workspace);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-amber-500 hover:bg-amber-500/10"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(workspace);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.25rem]">
          {workspace.description || "No description added."}
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Created {formattedDate}</span>
          </div>

          <Link
            href={`/workspace/${workspace.id}`}
            className="font-semibold text-primary hover:underline text-xs"
          >
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
};
