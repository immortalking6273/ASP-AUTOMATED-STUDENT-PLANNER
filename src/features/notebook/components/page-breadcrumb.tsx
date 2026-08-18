"use client";

import * as React from "react";
import Link from "next/link";
import { PageRow, NotebookRow, WorkspaceRow } from "@/types/database";
import { ChevronRight, FolderKanban, BookOpen, FileText } from "lucide-react";

export interface PageBreadcrumbProps {
  workspace?: WorkspaceRow | null;
  notebook?: NotebookRow | null;
  breadcrumbs?: PageRow[];
  activePageTitle?: string;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  workspace,
  notebook,
  breadcrumbs = [],
  activePageTitle,
}) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto no-scrollbar py-1">
      {workspace && (
        <>
          <Link
            href={`/workspace/${workspace.id}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 font-medium"
          >
            <FolderKanban className="h-3.5 w-3.5 text-primary" />
            <span className="truncate max-w-[120px]">{workspace.title}</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
        </>
      )}

      {notebook && (
        <>
          <Link
            href={`/notebook/${notebook.id}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 font-medium"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            <span className="truncate max-w-[140px]">{notebook.title}</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
        </>
      )}

      {breadcrumbs.map((page, idx) => {
        const isLast = idx === breadcrumbs.length - 1 && !activePageTitle;
        return (
          <React.Fragment key={page.id}>
            {isLast ? (
              <span className="font-bold text-foreground truncate max-w-[160px] flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                {page.title}
              </span>
            ) : (
              <Link
                href={`/notebook/${page.notebook_id}/page/${page.id}`}
                className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0 font-medium"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate max-w-[140px]">{page.title}</span>
              </Link>
            )}

            {(!isLast || activePageTitle) && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            )}
          </React.Fragment>
        );
      })}

      {activePageTitle && (
        <span className="font-bold text-foreground truncate max-w-[180px] flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
          {activePageTitle}
        </span>
      )}
    </nav>
  );
};
