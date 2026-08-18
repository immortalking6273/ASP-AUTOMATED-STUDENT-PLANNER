"use client";

import * as React from "react";
import { UploadedDocumentRow, WorkspaceRow } from "@/types/database";
import { WorkspacesService } from "@/services/db";
import { useAuth } from "@/hooks/use-auth";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface MoveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (id: string, targetWorkspaceId: string) => void;
  document: UploadedDocumentRow | null;
}

export function MoveDocumentModal({ isOpen, onClose, onMove, document: doc }: MoveDocumentModalProps) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = React.useState<WorkspaceRow[]>([]);
  const [targetWorkspaceId, setTargetWorkspaceId] = React.useState("");

  React.useEffect(() => {
    if (user) {
      WorkspacesService.getWorkspaces(user.id).then((res) => {
        setWorkspaces(res.data);
        if (res.data.length > 0) setTargetWorkspaceId(res.data[0].id);
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (doc && targetWorkspaceId) {
      onMove(doc.id, targetWorkspaceId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move Document to Workspace">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Select Target Workspace</label>
          <select
            value={targetWorkspaceId}
            onChange={(e) => setTargetWorkspaceId(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-2xl text-xs">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="rounded-2xl text-xs">
            Move Document
          </Button>
        </div>
      </form>
    </Modal>
  );
}
