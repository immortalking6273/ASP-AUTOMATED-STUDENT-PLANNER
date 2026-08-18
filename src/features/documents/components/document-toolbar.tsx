"use client";

import * as React from "react";
import { DocumentCategoryTab, DocumentSortOption, DocumentViewMode } from "../types";
import { Search, Plus, LayoutGrid, List, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: DocumentCategoryTab;
  onTabChange: (tab: DocumentCategoryTab) => void;
  sortBy: DocumentSortOption;
  onSortChange: (sort: DocumentSortOption) => void;
  viewMode: DocumentViewMode;
  onViewModeChange: (mode: DocumentViewMode) => void;
  onUploadClick: () => void;
}

const CATEGORY_TABS: { id: DocumentCategoryTab; label: string }[] = [
  { id: "all", label: "All Files" },
  { id: "pdf", label: "PDF" },
  { id: "word", label: "Word" },
  { id: "powerpoint", label: "PowerPoint" },
  { id: "text", label: "Text / MD" },
  { id: "image", label: "Images" },
  { id: "favorites", label: "Favorites" },
  { id: "archived", label: "Archived" },
];

export function DocumentToolbar({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
}: DocumentToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Top Bar: Search, Sort, View Mode, Upload Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents by name or tag..."
            className="w-full rounded-2xl border border-border bg-card/60 pl-10 pr-4 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none backdrop-blur-md"
          />
        </div>

        {/* Sort & View Mode controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-card/60 border border-border rounded-2xl px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as DocumentSortOption)}
              className="bg-transparent focus:outline-none text-xs cursor-pointer"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
              <option value="size_desc">Largest Size</option>
              <option value="size_asc">Smallest Size</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-2xl border border-border bg-card/60 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === "grid" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === "list" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onUploadClick}
            leftIcon={<Plus className="h-4 w-4" />}
            className="rounded-2xl text-xs font-semibold shadow-xs"
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/40">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-accent/30 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
