"use client";

import * as React from "react";
import { EditorBlock } from "../../types";
import { ListTree } from "lucide-react";

interface TableOfContentsBlockProps {
  allBlocks: EditorBlock[];
}

export function TableOfContentsBlock({ allBlocks }: TableOfContentsBlockProps) {
  const headings = allBlocks.filter((b) =>
    ["heading_1", "heading_2", "heading_3"].includes(b.block_type)
  );

  return (
    <div className="rounded-2xl border border-border/80 bg-accent/20 p-4 my-2 text-xs sm:text-sm space-y-2 w-full">
      <div className="flex items-center gap-2 font-bold text-foreground border-b border-border/40 pb-2">
        <ListTree className="h-4 w-4 text-primary" />
        <span>Table of Contents</span>
      </div>

      {headings.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Add Heading 1, 2, or 3 blocks to generate Table of Contents.</p>
      ) : (
        <div className="space-y-1.5 pt-1">
          {headings.map((h) => {
            const indent =
              h.block_type === "heading_1" ? "pl-0 font-semibold" : h.block_type === "heading_2" ? "pl-4 text-muted-foreground" : "pl-8 text-muted-foreground/80";
            return (
              <div key={h.id} className={`text-xs hover:text-primary transition-colors cursor-pointer ${indent}`}>
                • {h.content?.text || "Untitled Heading"}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
