"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useNotebookDetail } from "@/features/notebook/hooks/use-notebook-detail";
import { usePageTree } from "@/features/notebook/hooks/use-page-tree";
import { useNotebooks } from "@/features/notebook/hooks/use-notebooks";
import {
  NotebookHeader,
  PageBreadcrumb,
  PageTree,
  NotebookSidebar,
  CreateNotebookModal,
  CreatePageModal,
  MovePageModal,
  DeleteNotebookDialog,
  ArchiveNotebookDialog,
} from "@/features/notebook";
import { PageRow, NotebookRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Sparkles, Layers, ArrowRight, Plus } from "lucide-react";

export default function NotebookDetailPage() {
  const params = useParams();
  const notebookId = params.id as string;

  const { notebook, stats, recentPages, isLoading, error, refresh } = useNotebookDetail(notebookId);

  const {
    pageTree,
    flatPages,
    expandedIds,
    isCreateOpen: isPageCreateOpen,
    createParentId,
    editingPage,
    movingPage,
    deletingPage,
    setIsCreateOpen: setIsPageCreateOpen,
    setEditingPage,
    setMovingPage,
    setDeletingPage,
    toggleExpand,
    expandAll,
    collapseAll,
    openCreateForParent,
    handleCreate: handleCreatePage,
    handleUpdate: handleUpdatePage,
    handleMove: handleMovePage,
    handleToggleFavorite: handleToggleFavoritePage,
    handleArchive: handleArchivePage,
    handleDelete: handleDeletePage,
    handleDuplicate: handleDuplicatePage,
  } = usePageTree(notebookId);

  const {
    notebooks,
    handleUpdate: handleUpdateNotebook,
    handleToggleFavorite: handleToggleFavoriteNotebook,
    handleTogglePin: handleTogglePinNotebook,
    handleArchive: handleArchiveNotebook,
    handleDelete: handleDeleteNotebook,
    handleDuplicate: handleDuplicateNotebook,
  } = useNotebooks(notebook?.workspace_id);

  const [isEditNotebookOpen, setIsEditNotebookOpen] = React.useState(false);
  const [isDeleteNotebookOpen, setIsDeleteNotebookOpen] = React.useState(false);
  const [isArchiveNotebookOpen, setIsArchiveNotebookOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const parentPageForCreate = createParentId ? flatPages.find((p) => p.id === createParentId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !notebook) {
    return (
      <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-center max-w-md mx-auto my-12 space-y-3">
        <h3 className="text-lg font-bold text-destructive">Notebook Not Found</h3>
        <p className="text-xs text-muted-foreground">{error || "This notebook may have been deleted or archived."}</p>
        <Link href="/notes">
          <Button variant="outline" size="sm" className="mt-2 text-xs rounded-xl">
            Return to Notes Hub
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 sm:-m-6 lg:-m-8 overflow-hidden bg-background">
      {/* Left Sidebar */}
      <NotebookSidebar
        notebooks={notebooks}
        activeNotebookId={notebookId}
        recentPages={recentPages}
        onCreateNotebookClick={() => {}}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Breadcrumb Path */}
        <PageBreadcrumb notebook={notebook} />

        {/* Notebook Header Banner */}
        <NotebookHeader
          notebook={notebook}
          stats={stats}
          onEdit={() => setIsEditNotebookOpen(true)}
          onDelete={() => setIsDeleteNotebookOpen(true)}
          onArchive={() => setIsArchiveNotebookOpen(true)}
          onDuplicate={() => handleDuplicateNotebook(notebook.id)}
          onToggleFavorite={() => handleToggleFavoriteNotebook(notebook.id, notebook.is_favorite)}
          onTogglePin={() => handleTogglePinNotebook(notebook.id, notebook.is_pinned)}
          onCreatePageClick={() => openCreateForParent(null)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Hierarchical Page Tree */}
          <div className="col-span-1 lg:col-span-8">
            <PageTree
              tree={pageTree}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
              onCreateRootPage={() => openCreateForParent(null)}
              onAddChild={(parentId) => openCreateForParent(parentId)}
              onRename={(page) => setEditingPage(page)}
              onDuplicate={(page) => handleDuplicatePage(page.id)}
              onFavorite={(id, cur) => handleToggleFavoritePage(id, cur)}
              onMove={(page) => setMovingPage(page)}
              onArchive={(page) => handleArchivePage(page.id)}
              onDelete={(page) => setDeletingPage(page)}
            />
          </div>

          {/* Right Column: Recently Opened & Quick Actions */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            {/* Quick Create Card */}
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-indigo-500/10 via-card to-blue-500/10 backdrop-blur-md p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Quick Actions</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a new sub-topic page or structure your course units.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openCreateForParent(null)}
                leftIcon={<Plus className="h-4 w-4" />}
                className="w-full rounded-2xl text-xs font-semibold shadow-xs"
              >
                Add Root Page
              </Button>
            </div>

            {/* Recently Updated Pages List */}
            {recentPages.length > 0 && (
              <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-md p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Recent Pages</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{recentPages.length} pages</span>
                </div>

                <div className="space-y-1">
                  {recentPages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/notebook/${notebookId}/page/${page.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-accent/60 text-xs font-medium transition-colors group"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="h-4 w-4 text-cyan-500 shrink-0" />
                        <span className="truncate text-foreground group-hover:text-primary">{page.title}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <CreateNotebookModal
        isOpen={isEditNotebookOpen}
        onClose={() => setIsEditNotebookOpen(false)}
        onSubmit={async (data) => {
          await handleUpdateNotebook(notebook.id, data);
          refresh();
        }}
        initialData={notebook}
        isEditing={true}
      />

      <CreatePageModal
        isOpen={isPageCreateOpen}
        onClose={() => setIsPageCreateOpen(false)}
        onSubmit={handleCreatePage}
        parentPage={parentPageForCreate}
      />

      <MovePageModal
        isOpen={!!movingPage}
        onClose={() => setMovingPage(null)}
        onMove={handleMovePage}
        page={movingPage}
        allPages={flatPages}
      />

      <DeleteNotebookDialog
        isOpen={isDeleteNotebookOpen}
        onClose={() => setIsDeleteNotebookOpen(false)}
        onConfirm={async () => {
          await handleDeleteNotebook(notebook.id);
        }}
        item={notebook}
        itemType="notebook"
      />

      <DeleteNotebookDialog
        isOpen={!!deletingPage}
        onClose={() => setDeletingPage(null)}
        onConfirm={async () => {
          if (deletingPage) await handleDeletePage(deletingPage.id);
        }}
        item={deletingPage}
        itemType="page"
      />

      <ArchiveNotebookDialog
        isOpen={isArchiveNotebookOpen}
        onClose={() => setIsArchiveNotebookOpen(false)}
        onConfirm={async () => {
          await handleArchiveNotebook(notebook.id);
        }}
        item={notebook}
        itemType="notebook"
      />
    </div>
  );
}
