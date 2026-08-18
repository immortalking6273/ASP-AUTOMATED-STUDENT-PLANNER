"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban } from "lucide-react";
import { WorkspaceSearch } from "./workspace-search";

export interface WorkspaceHeaderProps {
  totalWorkspaces: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateOpen: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  totalWorkspaces,
  searchQuery,
  onSearchChange,
  onCreateOpen,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderKanban className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Workspace Hub
          </h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {totalWorkspaces} {totalWorkspaces === 1 ? "Workspace" : "Workspaces"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your subject workspaces, course notes, deadlines, and study materials.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <WorkspaceSearch value={searchQuery} onChange={onSearchChange} />
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateOpen}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shrink-0"
        >
          New Workspace
        </Button>
      </div>
    </div>
  );
};
