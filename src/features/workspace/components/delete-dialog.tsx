"use client";

import * as React from "react";
import { WorkspaceRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Archive } from "lucide-react";

export interface DeleteDialogProps {
  isOpen: boolean;
  workspace: WorkspaceRow | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
  onConfirmArchive?: (id: string) => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  workspace,
  onClose,
  onConfirmDelete,
  onConfirmArchive,
}) => {
  if (!isOpen || !workspace) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Delete Workspace?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{workspace.title}&quot;</span>?
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">⚠️ Warning:</p>
          <p>
            Deleting this workspace will permanently remove its notebooks, tasks, and documents.
            Consider archiving if you want to restore it later.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          {onConfirmArchive && !workspace.is_archived && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onConfirmArchive(workspace.id);
                onClose();
              }}
              leftIcon={<Archive className="h-4 w-4" />}
            >
              Archive Instead
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirmDelete(workspace.id);
              onClose();
            }}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Permanently Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
