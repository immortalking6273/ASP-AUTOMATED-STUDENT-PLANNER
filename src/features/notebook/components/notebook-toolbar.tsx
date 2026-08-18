"use client";

import * as React from "react";
import { NotebookSearch } from "./notebook-search";
import { NotebookFilters } from "./notebook-filters";
import { Button } from "@/components/ui/button";
import { NotebookFilterTab, NotebookSortOption, NotebookViewMode } from "../types";
import { Plus, BookPlus } from "lucide-react";

export interface NotebookToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeTab: NotebookFilterTab;
  onTabChange: (tab: NotebookFilterTab) => void;
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
  sortBy: NotebookSortOption;
  onSortChange: (sort: NotebookSortOption) => void;
  viewMode: NotebookViewMode;
  onViewModeChange: (mode: NotebookViewMode) => void;
  onCreateClick: () => void;
}

export const NotebookToolbar: React.FC<NotebookToolbarProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  selectedColor,
  onColorChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreateClick,
}) => {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        <NotebookSearch value={searchQuery} onChange={onSearchChange} />

        <Button
          variant="primary"
          onClick={onCreateClick}
          leftIcon={<Plus className="h-4 w-4" />}
          className="rounded-2xl shadow-md text-xs font-semibold shrink-0"
        >
          New Notebook
        </Button>
      </div>

      <NotebookFilters
        activeTab={activeTab}
        onTabChange={onTabChange}
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
};
