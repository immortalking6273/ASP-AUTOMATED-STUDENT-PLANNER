"use client";

import * as React from "react";
import { EditorBlock } from "../../types";
import { ChevronRight } from "lucide-react";

interface ToggleBlockProps {
  block: EditorBlock;
  onChange: (text: string, isCollapsed: boolean) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

export function ToggleBlock({ block, onChange, onEnter, onBackspaceEmpty }: ToggleBlockProps) {
  const text = block.content?.text || "";
  const isCollapsed = !!block.content?.isCollapsed;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  return (
    <div className="space-y-1 w-full my-0.5">
      <div className="flex items-center gap-2 py-1">
        <button
          type="button"
          onClick={() => onChange(text, !isCollapsed)}
          className="p-1 rounded-lg hover:bg-accent/60 text-muted-foreground transition-transform shrink-0"
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? "" : "rotate-90"}`} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => onChange(e.target.value, isCollapsed)}
          onKeyDown={handleKeyDown}
          placeholder="Toggle header..."
          className="w-full bg-transparent text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
      </div>

      {!isCollapsed && (
        <div className="pl-6 border-l border-border/40 text-xs text-muted-foreground py-1 italic">
          Collapsible toggle content section
        </div>
      )}
    </div>
  );
}
