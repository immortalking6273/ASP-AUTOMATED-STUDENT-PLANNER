"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { WorkspaceRow } from "@/types/database";
import { CreateWorkspaceData } from "@/services/db/workspaces-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderKanban,
  BookOpen,
  GraduationCap,
  Code,
  Layers,
  FileText,
  Compass,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const workspaceSchema = z.object({
  title: z.string().min(2, "Workspace title must be at least 2 characters").max(50, "Title is too long"),
  description: z.string().max(200, "Description must be under 200 characters").optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

const PRESET_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Pink", hex: "#ec4899" },
];

const PRESET_ICONS = [
  { name: "FolderKanban", icon: <FolderKanban className="h-4 w-4" /> },
  { name: "BookOpen", icon: <BookOpen className="h-4 w-4" /> },
  { name: "GraduationCap", icon: <GraduationCap className="h-4 w-4" /> },
  { name: "Code", icon: <Code className="h-4 w-4" /> },
  { name: "Layers", icon: <Layers className="h-4 w-4" /> },
  { name: "FileText", icon: <FileText className="h-4 w-4" /> },
  { name: "Compass", icon: <Compass className="h-4 w-4" /> },
  { name: "Sparkles", icon: <Sparkles className="h-4 w-4" /> },
];

export interface WorkspaceModalProps {
  isOpen: boolean;
  workspace?: WorkspaceRow | null;
  onClose: () => void;
  onSubmit: (data: CreateWorkspaceData) => Promise<void>;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  workspace,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(workspace);
  const [selectedColor, setSelectedColor] = React.useState<string>(workspace?.color || "#6366f1");
  const [selectedIcon, setSelectedIcon] = React.useState<string>(workspace?.icon || "FolderKanban");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      title: workspace?.title || "",
      description: workspace?.description || "",
    },
  });

  React.useEffect(() => {
    if (workspace) {
      reset({
        title: workspace.title,
        description: workspace.description || "",
      });
      setSelectedColor(workspace.color || "#6366f1");
      setSelectedIcon(workspace.icon || "FolderKanban");
    } else {
      reset({ title: "", description: "" });
      setSelectedColor("#6366f1");
      setSelectedIcon("FolderKanban");
    }
  }, [workspace, reset]);

  if (!isOpen) return null;

  const onFormSubmit = async (values: WorkspaceFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        title: values.title,
        description: values.description,
        color: selectedColor,
        icon: selectedIcon,
      });
      reset();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {isEditing ? "Edit Workspace" : "Create New Workspace"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "Update your subject workspace details and theme"
                : "Set up a subject container to organize notes, deadlines, and files"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
            <span>⚠️ {submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Workspace Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Workspace Name *</label>
            <Input
              {...register("title")}
              placeholder="e.g. Computer Science CS101"
              error={errors.title?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* Workspace Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="e.g. Algorithms, Data Structures, and Lab Notes"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
            {errors.description && (
              <span className="text-[10px] text-destructive">{errors.description.message}</span>
            )}
          </div>

          {/* Color Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Workspace Theme Color</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-95",
                    selectedColor === c.hex
                      ? "ring-2 ring-offset-2 ring-primary scale-110"
                      : "opacity-80 hover:opacity-100"
                  )}
                  title={c.name}
                >
                  {selectedColor === c.hex && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Icon</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedIcon(item.name)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    selectedIcon === item.name
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {isEditing ? "Save Changes" : "Create Workspace"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
