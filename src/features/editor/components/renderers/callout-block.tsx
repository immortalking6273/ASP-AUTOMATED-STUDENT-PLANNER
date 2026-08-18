"use client";

import * as React from "react";
import { EditorBlock } from "../../types";

interface CalloutBlockProps {
  block: EditorBlock;
  onChange: (text: string, icon: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}

const CALLOUT_ICONS = ["💡", "📌", "⚠️", "🚀", "🎯", "📝", "✅", "🔥"];

export function CalloutBlock({ block, onChange, onEnter, onBackspaceEmpty }: CalloutBlockProps) {
  const text = block.content?.text || "";
  const icon = block.content?.calloutIcon || "💡";

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
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur-xs my-1 w-full shadow-xs">
      <select
        value={icon}
        onChange={(e) => onChange(text, e.target.value)}
        className="bg-transparent text-lg focus:outline-none cursor-pointer select-none"
      >
        {CALLOUT_ICONS.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value, icon)}
        onKeyDown={handleKeyDown}
        placeholder="Callout information..."
        className="w-full bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
      />
    </div>
  );
}
