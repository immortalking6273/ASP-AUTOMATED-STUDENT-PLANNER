"use client";

import * as React from "react";
import { WorkspaceRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Archive, RotateCcw } from "lucide-react";

export interface ArchiveDialogProps {
  isOpen: boolean;
  workspace: WorkspaceRow | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const ArchiveDialog: React.FC<ArchiveDialogProps> = ({
  isOpen,
  workspace,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !workspace) return null;

  const isArchived = workspace.is_archived;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shrink-0">
            {isArchived ? <RotateCcw className="h-6 w-6" /> : <Archive className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {isArchived ? "Restore Workspace?" : "Archive Workspace?"}
            </h3>
            <p className="text-xs text-muted-foreground">
              &quot;{workspace.title}&quot;
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {isArchived
            ? "Restoring this workspace will place it back into your active workspaces list."
            : "Archiving hides this workspace from your active list without deleting any data. You can restore it anytime."}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onConfirm(workspace.id);
              onClose();
            }}
            leftIcon={isArchived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          >
            {isArchived ? "Restore Workspace" : "Archive Workspace"}
          </Button>
        </div>
      </div>
    </div>
  );
};
