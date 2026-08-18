"use client";

import * as React from "react";
import Link from "next/link";
import { WorkspaceRow } from "@/types/database";
import { FolderKanban, Plus, Star, Archive, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceSidebarProps {
  workspaces: WorkspaceRow[];
  favorites: Set<string>;
  activeWorkspaceId?: string;
  onCreateOpen: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  workspaces,
  favorites,
  activeWorkspaceId,
  onCreateOpen,
}) => {
  const [search, setSearch] = React.useState("");

  const activeWorkspaces = workspaces.filter((w) => !w.is_archived);
  const favoriteWorkspaces = activeWorkspaces.filter((w) => favorites.has(w.id));
  const archivedWorkspaces = workspaces.filter((w) => w.is_archived);

  const filteredWorkspaces = activeWorkspaces.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-64 border-r border-border bg-card/60 p-4 space-y-5 text-xs">
      {/* Search & Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <button
          onClick={onCreateOpen}
          className="rounded-lg bg-primary p-1.5 text-primary-foreground hover:opacity-90 transition-opacity"
          title="New Workspace"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Favorites Section */}
      {favoriteWorkspaces.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-amber-500">
            <Star className="h-3 w-3 fill-amber-400" />
            <span>Favorites</span>
          </div>
          <div className="space-y-0.5 pt-1">
            {favoriteWorkspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspace/${ws.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
                  activeWorkspaceId === ws.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ws.color || "#6366f1" }}
                />
                <span className="truncate flex-1">{ws.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Active Workspaces Section */}
      <div className="space-y-1 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="h-3 w-3" />
            <span>All Workspaces ({filteredWorkspaces.length})</span>
          </div>
        </div>

        <div className="space-y-0.5 pt-1">
          {filteredWorkspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspace/${ws.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors group",
                activeWorkspaceId === ws.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: ws.color || "#6366f1" }}
              />
              <span className="truncate flex-1">{ws.title}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Archived Count Section */}
      {archivedWorkspaces.length > 0 && (
        <div className="pt-3 border-t border-border">
          <Link
            href="/workspace?tab=archived"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-2 py-1 text-xs"
          >
            <Archive className="h-3.5 w-3.5 text-amber-500" />
            <span>Archived ({archivedWorkspaces.length})</span>
          </Link>
        </div>
      )}
    </div>
  );
};
