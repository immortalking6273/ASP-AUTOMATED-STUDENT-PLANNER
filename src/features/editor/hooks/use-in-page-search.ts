"use client";

import * as React from "react";
import { EditorBlock, SearchMatch } from "../types";

export function useInPageSearch(blocks: EditorBlock[]) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeMatchIndex, setActiveMatchIndex] = React.useState(0);

  const matches = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const result: SearchMatch[] = [];

    blocks.forEach((b) => {
      const text = b.content?.text || "";
      if (text.toLowerCase().includes(q)) {
        result.push({
          blockId: b.id,
          matchIndex: result.length,
          textSnippet: text,
        });
      }
    });

    return result;
  }, [blocks, query]);

  const activeMatch = matches[activeMatchIndex] || null;

  const nextMatch = () => {
    if (matches.length === 0) return;
    setActiveMatchIndex((prev) => (prev + 1) % matches.length);
  };

  const prevMatch = () => {
    if (matches.length === 0) return;
    setActiveMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const openSearch = () => {
    setIsOpen(true);
    setQuery("");
    setActiveMatchIndex(0);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
    setActiveMatchIndex(0);
  };

  return {
    isOpen,
    query,
    matches,
    activeMatchIndex,
    activeMatch,
    setQuery,
    nextMatch,
    prevMatch,
    openSearch,
    closeSearch,
  };
}
