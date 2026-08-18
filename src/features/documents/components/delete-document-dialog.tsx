"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: UploadedDocumentRow | null;
}

export function DeleteDocumentDialog({ isOpen, onClose, onConfirm, document: doc }: DeleteDocumentDialogProps) {
  if (!doc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Document">
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            Are you sure you want to delete <strong>{doc.display_name || doc.original_name}</strong>? This action will remove the file from your library.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-2xl text-xs">
            Cancel
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl text-xs">
            Delete Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
