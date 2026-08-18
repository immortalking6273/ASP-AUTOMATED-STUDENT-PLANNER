"use client";

import * as React from "react";
import { EditorBlock } from "../../types";
import { FileText, ExternalLink } from "lucide-react";

interface PageLinkBlockProps {
  block: EditorBlock;
  onChange: (linkedPageTitle: string) => void;
  onBackspaceEmpty: () => void;
}

export function PageLinkBlock({ block, onChange, onBackspaceEmpty }: PageLinkBlockProps) {
  const linkedTitle = block.content?.linkedPageTitle || "Linked Sub-Page";

  return (
    <div className="inline-flex items-center gap-2 p-2.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs sm:text-sm my-1 cursor-pointer transition-colors">
      <FileText className="h-4 w-4 shrink-0" />
      <input
        type="text"
        value={linkedTitle}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Link page name..."
        className="bg-transparent focus:outline-none text-foreground"
      />
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
    </div>
  );
}
