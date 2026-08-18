"use client";

import * as React from "react";
import { BlockType, SlashCommandItem } from "../types";

export const SLASH_COMMANDS: SlashCommandItem[] = [
  { id: "paragraph", title: "Text", description: "Just start typing with plain text.", iconName: "Type", category: "Basic" },
  { id: "heading_1", title: "Heading 1", description: "Big section heading.", iconName: "Heading1", category: "Basic" },
  { id: "heading_2", title: "Heading 2", description: "Medium sub-section heading.", iconName: "Heading2", category: "Basic" },
  { id: "heading_3", title: "Heading 3", description: "Small sub-section heading.", iconName: "Heading3", category: "Basic" },
  { id: "bullet_list", title: "Bullet List", description: "Create a simple bulleted list.", iconName: "List", category: "Lists & Tasks" },
  { id: "numbered_list", title: "Numbered List", description: "Create a numbered list.", iconName: "ListOrdered", category: "Lists & Tasks" },
  { id: "checklist", title: "Checklist", description: "Track tasks with interactive checkboxes.", iconName: "CheckSquare", category: "Lists & Tasks" },
  { id: "quote", title: "Quote", description: "Capture a quote or highlight statement.", iconName: "Quote", category: "Structure" },
  { id: "divider", title: "Divider", description: "Visually divide blocks with a horizontal line.", iconName: "Minus", category: "Structure" },
  { id: "code", title: "Code Block", description: "Capture code snippets with syntax highlighting.", iconName: "Code", category: "Structure" },
  { id: "callout", title: "Callout", description: "Make key information stand out.", iconName: "Info", category: "Structure" },
  { id: "toggle", title: "Toggle List", description: "Create collapsible accordion sections.", iconName: "ChevronRight", category: "Structure" },
  { id: "table", title: "Table", description: "Add a simple 2D matrix data table.", iconName: "Table", category: "Advanced" },
  { id: "image_placeholder", title: "Image", description: "Upload or link an image.", iconName: "Image", category: "Media & Placeholders" },
  { id: "video_placeholder", title: "Video", description: "Embed a video link.", iconName: "Video", category: "Media & Placeholders" },
  { id: "file_placeholder", title: "File Attachment", description: "Attach a study document.", iconName: "File", category: "Media & Placeholders" },
  { id: "bookmark_placeholder", title: "Web Bookmark", description: "Save a web reference card.", iconName: "Bookmark", category: "Media & Placeholders" },
  { id: "equation_placeholder", title: "Math Equation", description: "Write mathematical TeX formulas.", iconName: "Calculator", category: "Advanced" },
  { id: "table_of_contents", title: "Table of Contents", description: "Auto-generate heading links.", iconName: "ListTree", category: "Advanced" },
  { id: "page_link", title: "Page Link", description: "Link to another workspace page.", iconName: "FileText", category: "Advanced" },
];

export function useSlashCommand(onSelectCommand: (type: BlockType) => void) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(null);

  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return SLASH_COMMANDS;
    const q = query.toLowerCase().trim();
    return SLASH_COMMANDS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    );
  }, [query]);

  // Keep index within bounds when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const openSlashMenu = (blockId: string) => {
    setActiveBlockId(blockId);
    setQuery("");
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const closeSlashMenu = () => {
    setIsOpen(false);
    setActiveBlockId(null);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return false;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      return true;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      return true;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        onSelectCommand(filteredCommands[selectedIndex].id);
        closeSlashMenu();
      }
      return true;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeSlashMenu();
      return true;
    }

    return false;
  };

  return {
    isOpen,
    query,
    selectedIndex,
    activeBlockId,
    filteredCommands,
    setQuery,
    setSelectedIndex,
    openSlashMenu,
    closeSlashMenu,
    handleKeyDown,
  };
}
