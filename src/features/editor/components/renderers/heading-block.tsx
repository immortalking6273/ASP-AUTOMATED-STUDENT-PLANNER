"use client";

import * as React from "react";
import { EditorBlock } from "../../types";

interface HeadingBlockProps {
  block: EditorBlock;
  onChange: (text: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

export function HeadingBlock({ block, onChange, onEnter, onBackspaceEmpty }: HeadingBlockProps) {
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

  if (block.block_type === "heading_1") {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Heading 1"
        className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none py-1.5 border-b border-border/20"
      />
    );
  }

  if (block.block_type === "heading_2") {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Heading 2"
        className="w-full bg-transparent text-xl sm:text-2xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none py-1"
      />
    );
  }

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Heading 3"
      className="w-full bg-transparent text-lg sm:text-xl font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none py-1"
    />
  );
}
