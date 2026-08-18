"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageRow } from "@/types/database";
import { CreatePageData } from "@/services/db/pages-service";
import { FileText, FileCode, Book, Layers, Sparkles } from "lucide-react";

export interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePageData) => Promise<any>;
  parentPage?: PageRow | null;
}

const PAGE_ICONS = [
  { name: "FileText", icon: FileText, label: "Document" },
  { name: "FileCode", icon: FileCode, label: "Code Note" },
  { name: "Book", icon: Book, label: "Lecture Note" },
  { name: "Layers", icon: Layers, label: "Concept" },
  { name: "Sparkles", icon: Sparkles, label: "AI Summary" },
];

export const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  parentPage,
}) => {
  const [title, setTitle] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState("FileText");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTitle("");
    setSelectedIcon("FileText");
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Page title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        parent_page_id: parentPage ? parentPage.id : null,
        icon: selectedIcon,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create page");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={parentPage ? `Create Sub-Page under "${parentPage.title}"` : "Create New Page"}
      description={
        parentPage
          ? "Add a nested child page to organize your sub-topics."
          : "Create a root page in this notebook."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Page Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Binary Search Trees"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {/* Icon Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Select Icon</label>
          <div className="flex items-center gap-2">
            {PAGE_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/60 hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Create Page
          </Button>
        </div>
      </form>
    </Modal>
  );
};
