"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PageRow } from "@/types/database";
import { FolderTree, FileText, CornerDownRight, Home } from "lucide-react";

export interface MovePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (pageId: string, targetParentId: string | null) => Promise<void>;
  page: PageRow | null;
  allPages: PageRow[];
}

export const MovePageModal: React.FC<MovePageModalProps> = ({
  isOpen,
  onClose,
  onMove,
  page,
  allPages,
}) => {
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (page) {
      setSelectedParentId(page.parent_page_id);
    } else {
      setSelectedParentId(null);
    }
  }, [page, isOpen]);

  if (!page) return null;

  // Filter valid candidate parent pages (cannot move page into itself or its direct descendants)
  const validParents = allPages.filter((p) => p.id !== page.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onMove(page.id, selectedParentId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Move "${page.title}"`}
      description="Select a parent page to nest this page under, or choose Root Level."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {/* Root Level Option */}
          <button
            type="button"
            onClick={() => setSelectedParentId(null)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
              selectedParentId === null
                ? "border-primary bg-primary/10 text-primary shadow-xs"
                : "border-border/60 hover:bg-accent text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span>Root Level (Top Level Page)</span>
            </div>
            {selectedParentId === null && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Selected</span>}
          </button>

          {/* List of Other Pages */}
          {validParents.map((p) => {
            const isSelected = selectedParentId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedParentId(p.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                    : "border-border/60 hover:bg-accent text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <CornerDownRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{p.title}</span>
                </div>
                {isSelected && <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">Selected</span>}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Move Page
          </Button>
        </div>
      </form>
    </Modal>
  );
};
