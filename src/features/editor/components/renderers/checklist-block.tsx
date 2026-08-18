"use client";

import * as React from "react";
import { EditorBlock } from "../../types";

interface ChecklistBlockProps {
  block: EditorBlock;
  onChange: (text: string, checked: boolean) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

export function ChecklistBlock({ block, onChange, onEnter, onBackspaceEmpty }: ChecklistBlockProps) {
  const text = block.content?.text || "";
  const checked = !!block.content?.checked;

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
    <div className="flex items-center gap-2.5 py-1 w-full">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(text, e.target.checked)}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0 cursor-pointer"
      />
      <input
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value, checked)}
        onKeyDown={handleKeyDown}
        placeholder="To-do item..."
        className={`w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none ${
          checked ? "line-through text-muted-foreground" : ""
        }`}
      />
    </div>
  );
}
