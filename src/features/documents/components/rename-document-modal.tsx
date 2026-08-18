"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface RenameDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, newName: string) => void;
  document: UploadedDocumentRow | null;
}

export function RenameDocumentModal({ isOpen, onClose, onSubmit, document: doc }: RenameDocumentModalProps) {
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (doc) setName(doc.display_name || doc.original_name || doc.file_name);
  }, [doc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doc && name.trim()) {
      onSubmit(doc.id, name.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Document">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Document Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-2xl text-xs">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="rounded-2xl text-xs">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
