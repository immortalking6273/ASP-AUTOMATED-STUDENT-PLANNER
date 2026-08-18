"use client";

import * as React from "react";
import { EditorBlock } from "../../types";

interface QuoteBlockProps {
  block: EditorBlock;
  onChange: (text: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

export function QuoteBlock({ block, onChange, onEnter, onBackspaceEmpty }: QuoteBlockProps) {
  const text = block.content?.text || "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  return (
    <div className="border-l-4 border-primary/80 pl-4 py-1.5 my-1 bg-primary/5 rounded-r-xl w-full">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Empty quote..."
        rows={1}
        className="w-full bg-transparent text-sm sm:text-base italic text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none"
      />
    </div>
  );
}
