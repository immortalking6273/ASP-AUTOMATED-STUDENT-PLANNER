"use client";

import * as React from "react";
import { NotebookRow } from "@/types/database";
import { NotebookCard } from "./notebook-card";

export interface NotebookGridProps {
  notebooks: NotebookRow[];
  searchQuery?: string;
  onEdit: (nb: NotebookRow) => void;
  onDelete: (nb: NotebookRow) => void;
  onArchive: (nb: NotebookRow) => void;
  onRestore?: (nb: NotebookRow) => void;
  onDuplicate: (nb: NotebookRow) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTogglePin: (id: string, current: boolean) => void;
}

export const NotebookGrid: React.FC<NotebookGridProps> = ({
  notebooks,
  searchQuery,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {notebooks.map((nb) => (
        <NotebookCard
          key={nb.id}
          notebook={nb}
          searchQuery={searchQuery}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onRestore={onRestore}
          onDuplicate={onDuplicate}
          onToggleFavorite={onToggleFavorite}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  );
};
