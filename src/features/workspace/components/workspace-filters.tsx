"use client";

import * as React from "react";
import { FilterTab, SortOption, ViewMode } from "../hooks/use-workspaces";
import { LayoutGrid, List, ArrowUpDown, Star, Archive, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceFiltersProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalCounts: {
    all: number;
    favorites: number;
    archived: number;
  };
}

export const WorkspaceFilters: React.FC<WorkspaceFiltersProps> = ({
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCounts,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => onTabChange("all")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "all"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>All Workspaces</span>
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {totalCounts.all}
          </span>
        </button>

        <button
          onClick={() => onTabChange("favorites")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "favorites"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
          <span>Favorites</span>
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {totalCounts.favorites}
          </span>
        </button>

        <button
          onClick={() => onTabChange("archived")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "archived"
              ? "bg-card text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Archive className="h-3.5 w-3.5 text-amber-500" />
          <span>Archived</span>
          <span className="ml-1 rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {totalCounts.archived}
          </span>
        </button>
      </div>

      {/* Sorting & Layout View Toggle */}
      <div className="flex items-center gap-3">
        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="title_desc">Title (Z - A)</option>
            <option value="updated_desc">Recently Modified</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5 bg-card">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "rounded-md p-1.5 text-xs transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "rounded-md p-1.5 text-xs transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
