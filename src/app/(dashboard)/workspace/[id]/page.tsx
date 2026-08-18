"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useWorkspaceDetail,
  WorkspaceSettings,
  DeleteDialog,
  ArchiveDialog,
} from "@/features/workspace";
import {
  FolderKanban,
  BookOpen,
  GraduationCap,
  Code,
  Layers,
  FileText,
  Compass,
  Sparkles,
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Check,
  CheckSquare,
  Files,
  Settings,
  Share2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/feedback/skeleton";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ReactNode> = {
  FolderKanban: <FolderKanban className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  GraduationCap: <GraduationCap className="h-6 w-6" />,
  Code: <Code className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
  Compass: <Compass className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
};

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.id as string;

  const {
    workspace,
    stats,
    isLoading,
    error,
    refresh,
    handleRename,
    handleUpdateDescription,
    handleUpdateAppearance,
  } = useWorkspaceDetail(workspaceId);

  const [activeTab, setActiveTab] = React.useState<"overview" | "settings">("overview");
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState("");

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);

  React.useEffect(() => {
    if (workspace) {
      setTitleInput(workspace.title);
    }
  }, [workspace]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 rounded-md" />
        <div className="rounded-2xl border p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-64 rounded-md" />
              <Skeleton className="h-4 w-96 rounded-md" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="text-base font-bold text-foreground">Workspace Not Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          {error || "The requested workspace could not be found or you do not have permission to view it."}
        </p>
        <Link href="/workspace">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Workspaces
          </Button>
        </Link>
      </div>
    );
  }

  const iconComponent = ICON_MAP[workspace.icon] || <FolderKanban className="h-6 w-6" />;
  const cardColor = workspace.color || "#6366f1";

  const formattedCreated = new Date(workspace.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedUpdated = new Date(workspace.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const saveTitle = async () => {
    if (titleInput.trim() && titleInput !== workspace.title) {
      await handleRename(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      {/* Back Button Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Workspaces</span>
        </Link>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-all",
              activeTab === "overview"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all",
              activeTab === "settings"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Workspace Header Banner */}
      <div className="relative rounded-2xl border border-border bg-card p-6 shadow-md overflow-hidden space-y-4">
        {/* Color Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-3" style={{ backgroundColor: cardColor }} />

        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shrink-0"
              style={{ backgroundColor: cardColor }}
            >
              {iconComponent}
            </div>

            <div className="space-y-1.5">
              {/* Title with Inline Editing */}
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitle();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      autoFocus
                      className="rounded-lg border border-primary bg-background px-3 py-1 text-xl font-bold text-foreground focus:outline-none"
                    />
                    <button
                      onClick={saveTitle}
                      className="rounded-lg bg-primary p-1.5 text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {workspace.title}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                      title="Rename Workspace"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {workspace.is_archived && (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-500">
                    Archived
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground max-w-xl">
                {workspace.description || "No workspace description provided."}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {formattedCreated}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Last Modified {formattedUpdated}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" disabled leftIcon={<Share2 className="h-4 w-4" />}>
              Share (Placeholder)
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* Workspace Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Notebooks</span>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.notebookCount}</div>
              <p className="text-[10px] text-muted-foreground">Notebooks in this workspace</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Pages</span>
                <BookOpen className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.pageCount}</div>
              <p className="text-[10px] text-muted-foreground">Page documents (Placeholder)</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Documents</span>
                <Files className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.documentCount}</div>
              <p className="text-[10px] text-muted-foreground">Uploaded PDFs & Slides</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Active Tasks</span>
                <CheckSquare className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.taskCount}</div>
              <p className="text-[10px] text-muted-foreground">Assignments & To-Dos</p>
            </div>
          </div>

          {/* Activity Placeholder Notice */}
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-foreground">Notebook & Page Management Ready</h3>
              <p className="text-xs text-muted-foreground">
                This workspace container is ready for Module 6 (Notebook Management) integration.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <WorkspaceSettings
          workspace={workspace}
          onRename={handleRename}
          onUpdateDescription={handleUpdateDescription}
          onUpdateAppearance={handleUpdateAppearance}
          onArchive={() => setArchiveOpen(true)}
          onDelete={() => setDeleteOpen(true)}
        />
      )}

      {/* Dialogs */}
      <DeleteDialog
        isOpen={deleteOpen}
        workspace={workspace}
        onClose={() => setDeleteOpen(false)}
        onConfirmDelete={async (id) => {
          router.push("/workspace");
        }}
      />

      <ArchiveDialog
        isOpen={archiveOpen}
        workspace={workspace}
        onClose={() => setArchiveOpen(false)}
        onConfirm={async (id) => {
          refresh();
        }}
      />
    </div>
  );
}
