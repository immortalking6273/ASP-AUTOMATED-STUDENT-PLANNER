"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { NotebookRow, PageRow } from "@/types/database";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface DeleteNotebookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: NotebookRow | PageRow | null;
  itemType?: "notebook" | "page";
}

export const DeleteNotebookDialog: React.FC<DeleteNotebookDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  itemType = "notebook",
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!item) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${itemType === "notebook" ? "Notebook" : "Page"}`}
      description={`Are you sure you want to permanently delete "${item.title}"?`}
    >
      <div className="space-y-4 pt-2">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Permanent Deletion Warning</div>
            <div>
              This action cannot be undone. All nested sub-pages and study materials inside this {itemType} will be permanently removed.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete {itemType === "notebook" ? "Notebook" : "Page"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
