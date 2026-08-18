"use client";

import * as React from "react";
import { EditorBlock } from "../../types";

interface ParagraphBlockProps {
  block: EditorBlock;
  onChange: (text: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onSlashTrigger: () => void;
}

export function ParagraphBlock({ block, onChange, onEnter, onBackspaceEmpty, onSlashTrigger }: ParagraphBlockProps) {
  const text = block.content?.text || "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      onBackspaceEmpty();
    } else if (e.key === "/" && text === "") {
      onSlashTrigger();
    }
  };

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type '/' for commands..."
      className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none py-1"
    />
  );
}
