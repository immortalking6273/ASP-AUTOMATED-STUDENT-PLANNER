"use client";

import * as React from "react";
import { WorkspaceRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Archive, Lock, Users, Share2 } from "lucide-react";

export interface WorkspaceSettingsProps {
  workspace: WorkspaceRow;
  onRename: (title: string) => Promise<void>;
  onUpdateDescription: (desc: string) => Promise<void>;
  onUpdateAppearance: (icon: string, color: string) => Promise<void>;
  onArchive: () => void;
  onDelete: () => void;
}

export const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({
  workspace,
  onRename,
  onUpdateDescription,
  onUpdateAppearance,
  onArchive,
  onDelete,
}) => {
  const [title, setTitle] = React.useState(workspace.title);
  const [description, setDescription] = React.useState(workspace.description || "");
  const [color, setColor] = React.useState(workspace.color || "#6366f1");
  const [icon, setIcon] = React.useState(workspace.icon || "FolderKanban");
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (title !== workspace.title) await onRename(title);
      if (description !== (workspace.description || "")) await onUpdateDescription(description);
      if (color !== workspace.color || icon !== workspace.icon) await onUpdateAppearance(icon, color);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* General Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
          General Workspace Settings
        </h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Workspace Name</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Members & Sharing (Prepared place-holders) */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Members & Access (Coming Soon)</h3>
            <p className="text-xs text-muted-foreground">Collaborate with study partners and classmates.</p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            Module 6+
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 text-xs">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <span className="font-semibold text-foreground">Workspace Owner</span>
              <p className="text-[10px] text-muted-foreground">Only you have access to this workspace.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled leftIcon={<Share2 className="h-3.5 w-3.5" />}>
            Share Workspace
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
        <h3 className="text-sm font-bold text-destructive flex items-center gap-2">
          <Lock className="h-4 w-4" /> Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/20 bg-card">
          <div>
            <h4 className="text-xs font-bold text-foreground">Archive Workspace</h4>
            <p className="text-[11px] text-muted-foreground">Hide workspace from active lists without losing data.</p>
          </div>
          <Button variant="outline" size="sm" onClick={onArchive} leftIcon={<Archive className="h-4 w-4 text-amber-500" />}>
            Archive
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-destructive/20 bg-card">
          <div>
            <h4 className="text-xs font-bold text-destructive">Delete Workspace</h4>
            <p className="text-[11px] text-muted-foreground">Permanently delete workspace and associated data.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete} leftIcon={<Trash2 className="h-4 w-4" />}>
            Delete Workspace
          </Button>
        </div>
      </div>
    </div>
  );
};
