"use client";

import * as React from "react";
import Link from "next/link";
import { NotebookRow, WorkspaceRow, PageRow } from "@/types/database";
import { NotebookTreeItem } from "./notebook-tree";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  BookOpen,
  Plus,
  Star,
  Clock,
  Archive,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
} from "lucide-react";

export interface NotebookSidebarProps {
  workspace?: WorkspaceRow | null;
  notebooks: NotebookRow[];
  activeNotebookId?: string;
  recentPages?: PageRow[];
  onCreateNotebookClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NotebookSidebar: React.FC<NotebookSidebarProps> = ({
  workspace,
  notebooks,
  activeNotebookId,
  recentPages = [],
  onCreateNotebookClick,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchFilter, setSearchFilter] = React.useState("");

  const favoriteNotebooks = notebooks.filter((n) => n.is_favorite && !n.is_archived);
  const activeNotebooks = notebooks.filter((n) => !n.is_archived);
  const filteredNotebooks = activeNotebooks.filter((n) =>
    n.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <aside className="w-14 border-r border-border bg-card/80 backdrop-blur-md flex flex-col items-center py-4 space-y-4 shrink-0 transition-all">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="w-8 border-b border-border" />

        <button
          onClick={onCreateNotebookClick}
          className="p-2 rounded-xl bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-all cursor-pointer"
          title="Create Notebook"
        >
          <Plus className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 md:w-72 border-r border-border bg-card/80 backdrop-blur-md flex flex-col justify-between h-full p-4 shrink-0 transition-all space-y-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Workspace & Collapse Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs tracking-tight text-foreground truncate">
                {workspace?.title || "Workspace"}
              </h2>
              <span className="text-[10px] text-muted-foreground font-medium">Knowledge Base</span>
            </div>
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Button & Quick Search */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNotebookClick}
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full rounded-2xl text-xs font-semibold shadow-xs py-2"
          >
            New Notebook
          </Button>

          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Quick filter..."
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Favorite Notebooks Section */}
        {favoriteNotebooks.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              <Star className="h-3 w-3 fill-current" />
              <span>Favorites</span>
            </div>
            <div className="space-y-0.5">
              {favoriteNotebooks.map((nb) => (
                <NotebookTreeItem key={nb.id} notebook={nb} activeNotebookId={activeNotebookId} />
              ))}
            </div>
          </div>
        )}

        {/* All Active Notebooks Tree */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <Layers className="h-3 w-3 text-primary" />
            <span>Notebooks ({filteredNotebooks.length})</span>
          </div>
          <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
            {filteredNotebooks.map((nb) => (
              <NotebookTreeItem key={nb.id} notebook={nb} activeNotebookId={activeNotebookId} />
            ))}
          </div>
        </div>

        {/* Recent Pages Section */}
        {recentPages.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3 w-3 text-primary" />
              <span>Recent Pages</span>
            </div>
            <div className="space-y-0.5">
              {recentPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/notebook/${page.notebook_id}/page/${page.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 truncate transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{page.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Archived Link */}
      <div className="pt-2 border-t border-border">
        <Link
          href="/notes?filter=archived"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Archive className="h-4 w-4" />
          <span>Archived Items</span>
        </Link>
      </div>
    </aside>
  );
};
