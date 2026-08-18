"use client";

import * as React from "react";
import Link from "next/link";
import { NotebookRow } from "@/types/database";
import { FileText, Star, Pin, ChevronRight } from "lucide-react";

export interface NotebookTreeProps {
  notebook: NotebookRow;
  activeNotebookId?: string;
}

export const NotebookTreeItem: React.FC<NotebookTreeProps> = ({
  notebook,
  activeNotebookId,
}) => {
  const isActive = activeNotebookId === notebook.id;
  const themeColor = notebook.color || "#6366f1";

  return (
    <Link
      href={`/notebook/${notebook.id}`}
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive
          ? "bg-primary/10 text-primary shadow-xs border-l-2 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: themeColor }}
        />
        <span className="truncate">{notebook.title}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {notebook.is_pinned && <Pin className="h-3 w-3 fill-purple-500 text-purple-500" />}
        {notebook.is_favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
      </div>
    </Link>
  );
};
