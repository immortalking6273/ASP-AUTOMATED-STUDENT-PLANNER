"use client";

import * as React from "react";
import { FolderKanban, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyWorkspaceProps {
  isSearch?: boolean;
  searchQuery?: string;
  onCreateOpen?: () => void;
  onClearSearch?: () => void;
}

export const EmptyWorkspace: React.FC<EmptyWorkspaceProps> = ({
  isSearch = false,
  searchQuery,
  onCreateOpen,
  onClearSearch,
}) => {
  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Search className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No Workspaces Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No workspaces match &quot;{searchQuery}&quot;. Try adjusting your search query or clear filters.
        </p>
        {onClearSearch && (
          <Button variant="outline" size="sm" onClick={onClearSearch}>
            Clear Search
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[380px] p-8 text-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <FolderKanban className="h-7 w-7" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-lg font-bold text-foreground">Create Your First Workspace</h3>
        <p className="text-xs text-muted-foreground">
          Workspaces organize your courses, notes, assignments, and study materials into dedicated subject hubs.
        </p>
      </div>
      {onCreateOpen && (
        <Button variant="primary" size="md" onClick={onCreateOpen} leftIcon={<Plus className="h-4 w-4" />}>
          Create Workspace
        </Button>
      )}
    </div>
  );
};
