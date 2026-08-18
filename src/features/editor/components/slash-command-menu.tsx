"use client";

import * as React from "react";
import { BlockType, SlashCommandItem } from "../types";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Code,
  Info,
  ChevronRight,
  Table,
  Image,
  Video,
  File,
  Bookmark,
  Calculator,
  ListTree,
  FileText,
} from "lucide-react";

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  commands: SlashCommandItem[];
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const ICON_MAP: Record<string, any> = {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Code,
  Info,
  ChevronRight,
  Table,
  Image,
  Video,
  File,
  Bookmark,
  Calculator,
  ListTree,
  FileText,
};

export function SlashCommandMenu({
  isOpen,
  query,
  selectedIndex,
  commands,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-6 z-50 w-72 max-h-80 overflow-y-auto rounded-3xl border border-border/80 bg-popover/95 backdrop-blur-xl p-2 shadow-2xl space-y-1 animate-in fade-in-0 zoom-in-95">
      <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase border-b border-border/40">
        Basic & Media Blocks
      </div>

      {commands.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground">No matching commands</div>
      ) : (
        commands.map((cmd, idx) => {
          const IconComponent = ICON_MAP[cmd.iconName] || Type;
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={cmd.id}
              type="button"
              onClick={() => onSelect(cmd.id)}
              className={`flex items-center gap-3 w-full p-2 rounded-2xl text-left transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent/60 text-foreground"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                  isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{cmd.title}</div>
                <div
                  className={`text-[10px] truncate ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {cmd.description}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
