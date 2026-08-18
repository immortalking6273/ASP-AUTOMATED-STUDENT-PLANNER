"use client";

import * as React from "react";
import { WorkspaceRow } from "@/types/database";
import { WorkspaceCard } from "./workspace-card";

export interface WorkspaceGridProps {
  workspaces: WorkspaceRow[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onEdit: (workspace: WorkspaceRow) => void;
  onDuplicate: (id: string) => void;
  onArchive: (workspace: WorkspaceRow) => void;
  onRestore?: (id: string) => void;
  onDelete: (workspace: WorkspaceRow) => void;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  workspaces,
  favorites,
  onToggleFavorite,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {workspaces.map((ws) => (
        <WorkspaceCard
          key={ws.id}
          workspace={ws}
          isFavorite={favorites.has(ws.id)}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
          viewMode="grid"
        />
      ))}
    </div>
  );
};
