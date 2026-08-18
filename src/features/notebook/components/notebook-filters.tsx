"use client";

import * as React from "react";
import { NotebookFilterTab, NotebookSortOption, NotebookViewMode } from "../types";
import { Star, Pin, Archive, Layers, ArrowUpDown, LayoutGrid, List } from "lucide-react";

export interface NotebookFiltersProps {
  activeTab: NotebookFilterTab;
  onTabChange: (tab: NotebookFilterTab) => void;
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
  sortBy: NotebookSortOption;
  onSortChange: (sort: NotebookSortOption) => void;
  viewMode: NotebookViewMode;
  onViewModeChange: (mode: NotebookViewMode) => void;
}

const COLOR_FILTERS = [
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ef4444", label: "Rose" },
  { hex: "#8b5cf6", label: "Purple" },
  { hex: "#ec4899", label: "Pink" },
];

export const NotebookFilters: React.FC<NotebookFiltersProps> = ({
  activeTab,
  onTabChange,
  selectedColor,
  onColorChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full border-b border-border/50 pb-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => onTabChange("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>All Notebooks</span>
        </button>

        <button
          onClick={() => onTabChange("favorites")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "favorites"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>Favorites</span>
        </button>

        <button
          onClick={() => onTabChange("pinned")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "pinned"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pin className="h-3.5 w-3.5 fill-current" />
          <span>Pinned</span>
        </button>

        <button
          onClick={() => onTabChange("archived")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "archived"
              ? "bg-slate-700 text-white shadow-sm"
              : "bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          <span>Archived</span>
        </button>
      </div>

      {/* Controls: Color Filter, Sort, View Mode */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Color Palette Filter */}
        <div className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/50">
          <button
            onClick={() => onColorChange(null)}
            className={`h-5 w-5 rounded-lg text-[9px] font-bold flex items-center justify-center transition-all ${
              selectedColor === null ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="All Colors"
          >
            All
          </button>
          {COLOR_FILTERS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onColorChange(selectedColor === c.hex ? null : c.hex)}
              style={{ backgroundColor: c.hex }}
              className={`h-4 w-4 rounded-full transition-transform ${
                selectedColor === c.hex ? "ring-2 ring-offset-1 ring-primary scale-110" : "opacity-70 hover:opacity-100"
              }`}
              title={c.label}
            />
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as NotebookSortOption)}
            className="appearance-none rounded-xl border border-border/60 bg-background px-3 py-1.5 pr-7 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="title_asc">Title (A - Z)</option>
            <option value="title_desc">Title (Z - A)</option>
            <option value="updated_desc">Recently Updated</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
