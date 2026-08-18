"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { NotebookRow, PageRow } from "@/types/database";
import { Archive } from "lucide-react";

export interface ArchiveNotebookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: NotebookRow | PageRow | null;
  itemType?: "notebook" | "page";
}

export const ArchiveNotebookDialog: React.FC<ArchiveNotebookDialogProps> = ({
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
      title={`Archive ${itemType === "notebook" ? "Notebook" : "Page"}`}
      description={`Archive "${item.title}"?`}
    >
      <div className="space-y-4 pt-2 text-xs text-muted-foreground">
        <p>
          Archiving moves this {itemType} out of your primary active list. You can view or restore archived items anytime from the <strong>Archived</strong> tab.
        </p>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<Archive className="h-4 w-4" />}
          >
            Archive {itemType === "notebook" ? "Notebook" : "Page"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
