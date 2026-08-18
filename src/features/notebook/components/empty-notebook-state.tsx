"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { BookPlus, Sparkles, Layers } from "lucide-react";

export interface EmptyNotebookStateProps {
  onCreateClick?: () => void;
  title?: string;
  description?: string;
}

export const EmptyNotebookState: React.FC<EmptyNotebookStateProps> = ({
  onCreateClick,
  title = "No Notebooks Found",
  description = "Get started by creating your first notebook to organize course notes, lectures, and sub-pages.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/50 backdrop-blur-md p-10 text-center my-6 space-y-4 max-w-lg mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 text-primary shadow-inner">
        <BookPlus className="h-8 w-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {onCreateClick && (
        <Button
          variant="primary"
          onClick={onCreateClick}
          leftIcon={<Sparkles className="h-4 w-4 text-amber-300" />}
          className="rounded-2xl shadow-md text-xs font-semibold"
        >
          Create First Notebook
        </Button>
      )}
    </div>
  );
};
