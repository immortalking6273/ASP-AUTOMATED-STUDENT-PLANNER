"use client";

import * as React from "react";
import { EditorBlock } from "../../types";

interface ListBlockProps {
  block: EditorBlock;
  indexInGroup?: number;
  onChange: (text: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

export function ListBlock({ block, indexInGroup = 1, onChange, onEnter, onBackspaceEmpty }: ListBlockProps) {
  const text = block.content?.text || "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  const isNumbered = block.block_type === "numbered_list";

  return (
    <div className="flex items-center gap-2 py-0.5 w-full">
      <span className="text-xs sm:text-sm font-bold text-muted-foreground select-none shrink-0 w-5 text-right">
        {isNumbered ? `${indexInGroup}.` : "•"}
      </span>
      <input
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="List item..."
        className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
      />
    </div>
  );
}
