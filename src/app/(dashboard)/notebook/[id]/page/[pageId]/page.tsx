"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePageTree } from "@/features/notebook/hooks/use-page-tree";
import { useNotebookDetail } from "@/features/notebook/hooks/use-notebook-detail";
import { PageBreadcrumb, NotebookSidebar } from "@/features/notebook";
import { BlockEditor } from "@/features/editor";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Layers, Plus, ArrowLeft } from "lucide-react";

export default function PageDetailPage() {
  const params = useParams();
  const notebookId = params.id as string;
  const pageId = params.pageId as string;

  const { notebook, recentPages } = useNotebookDetail(notebookId);
  const { flatPages, getBreadcrumbs, openCreateForParent } = usePageTree(notebookId);

  const currentPage = flatPages.find((p) => p.id === pageId);
  const breadcrumbs = getBreadcrumbs(pageId);
  const childPages = flatPages.filter((p) => p.parent_page_id === pageId);

  if (!currentPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-background">
      {/* Notebook Sidebar */}
      <NotebookSidebar
        notebooks={[]}
        activeNotebookId={notebookId}
        recentPages={recentPages}
        onCreateNotebookClick={() => {}}
      />

      {/* Main Page Editor Viewer */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Breadcrumb Navigation Path */}
        <PageBreadcrumb notebook={notebook} breadcrumbs={breadcrumbs} />

        {/* Page Title & Meta Header */}
        <div className="space-y-3 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/notebook/${notebookId}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Notebook</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Updated {new Date(currentPage.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {currentPage.title}
            </h1>
          </div>
        </div>

        {/* Sub-Pages Section */}
        {childPages.length > 0 && (
          <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span>Sub-Pages ({childPages.length})</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCreateForParent(pageId)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                className="text-[11px] h-7 rounded-xl"
              >
                Add Sub-Page
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {childPages.map((cp) => (
                <Link
                  key={cp.id}
                  href={`/notebook/${notebookId}/page/${cp.id}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-border/60 bg-background/50 hover:bg-accent/60 transition-colors group"
                >
                  <FileText className="h-4 w-4 text-cyan-500 shrink-0" />
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary truncate">
                    {cp.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Module 7 Block Editor Engine */}
        <BlockEditor page={currentPage} workspaceId={notebook?.workspace_id} />
      </div>
    </div>
  );
}
