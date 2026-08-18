"use client";

import * as React from "react";
import { Bold, Italic, Underline, Strikethrough, Code, Highlighter, Link as LinkIcon, Palette, X } from "lucide-react";

interface FormattingToolbarProps {
  isVisible: boolean;
  position: { top: number; left: number };
  onApplyFormat: (format: string, value?: any) => void;
  onClose: () => void;
}

export function FormattingToolbar({ isVisible, position, onApplyFormat, onClose }: FormattingToolbarProps) {
  if (!isVisible) return null;

  return (
    <div
      style={{ top: `${position.top}px`, left: `${position.left}px`, transform: "translateX(-50%)" }}
      className="fixed z-50 flex items-center gap-0.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 text-foreground"
    >
      <button
        type="button"
        onClick={() => onApplyFormat("bold")}
        className="p-1.5 rounded-xl hover:bg-accent text-foreground hover:text-primary transition-colors"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("italic")}
        className="p-1.5 rounded-xl hover:bg-accent text-foreground hover:text-primary transition-colors"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("underline")}
        className="p-1.5 rounded-xl hover:bg-accent text-foreground hover:text-primary transition-colors"
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("strikethrough")}
        className="p-1.5 rounded-xl hover:bg-accent text-foreground hover:text-primary transition-colors"
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-border/60 mx-1" />

      <button
        type="button"
        onClick={() => onApplyFormat("code")}
        className="p-1.5 rounded-xl hover:bg-accent text-foreground hover:text-primary transition-colors"
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("highlight", "yellow")}
        className="p-1.5 rounded-xl hover:bg-accent text-amber-500 hover:text-amber-600 transition-colors"
        title="Highlight text"
      >
        <Highlighter className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onApplyFormat("link")}
        className="p-1.5 rounded-xl hover:bg-accent text-foreground hover:text-primary transition-colors"
        title="Insert Hyperlink (Ctrl+K)"
      >
        <LinkIcon className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-border/60 mx-1" />

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
        title="Close toolbar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
