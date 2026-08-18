"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotebookRow } from "@/types/database";
import { CreateNotebookData, UpdateNotebookData } from "@/services/db/notebooks-service";
import {
  FileText,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Brain,
  Sparkles,
  Calculator,
  Code,
  Check,
  Tag,
} from "lucide-react";

export interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNotebookData) => Promise<void>;
  initialData?: NotebookRow | null;
  isEditing?: boolean;
}

const AVAILABLE_ICONS = [
  { name: "FileText", icon: FileText, label: "Document" },
  { name: "BookOpen", icon: BookOpen, label: "Course Book" },
  { name: "GraduationCap", icon: GraduationCap, label: "Academic" },
  { name: "Brain", icon: Brain, label: "Research" },
  { name: "Sparkles", icon: Sparkles, label: "AI Study" },
  { name: "Calculator", icon: Calculator, label: "Math & Physics" },
  { name: "Code", icon: Code, label: "Computer Science" },
  { name: "FolderKanban", icon: FolderKanban, label: "Projects" },
];

const COLOR_PALETTE = [
  { hex: "#6366f1", label: "Indigo" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#10b981", label: "Emerald" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ef4444", label: "Rose" },
  { hex: "#8b5cf6", label: "Purple" },
  { hex: "#ec4899", label: "Pink" },
];

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState("FileText");
  const [selectedColor, setSelectedColor] = React.useState("#6366f1");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialData && isEditing) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setSelectedIcon(initialData.icon || "FileText");
      setSelectedColor(initialData.color || "#6366f1");
    } else {
      setTitle("");
      setDescription("");
      setSelectedIcon("FileText");
      setSelectedColor("#6366f1");
    }
    setError(null);
  }, [initialData, isEditing, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Notebook title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        color: selectedColor,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save notebook");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Notebook" : "Create New Notebook"}
      description={
        isEditing
          ? "Update notebook title, description, icon, and theme color."
          : "Create a new notebook to organize your course notes, lectures, and research."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Notebook Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CS101 Data Structures"
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of what this notebook covers..."
            disabled={isSubmitting}
            rows={2}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>

        {/* Icon Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">Select Icon</label>
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = selectedIcon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/60 hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <IconComp className="h-5 w-5" />
                  <span className="text-[10px] truncate max-w-full">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette Picker */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            <span>Theme Color</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COLOR_PALETTE.map((c) => {
              const isSelected = selectedColor === c.hex;
              return (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-105 ${
                    isSelected ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-md" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  {isSelected && <Check className="h-4 w-4 drop-shadow-sm" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Notebook"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
