"use client";

import * as React from "react";
import { WorkspaceRow } from "@/types/database";
import { WorkspaceCard } from "./workspace-card";

export interface WorkspaceListProps {
  workspaces: WorkspaceRow[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onEdit: (workspace: WorkspaceRow) => void;
  onDuplicate: (id: string) => void;
  onArchive: (workspace: WorkspaceRow) => void;
  onRestore?: (id: string) => void;
  onDelete: (workspace: WorkspaceRow) => void;
}

export const WorkspaceList: React.FC<WorkspaceListProps> = ({
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
    <div className="space-y-3">
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
          viewMode="list"
        />
      ))}
    </div>
  );
};
