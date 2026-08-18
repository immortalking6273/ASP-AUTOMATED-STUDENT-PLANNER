"use client";

import * as React from "react";
import {
  MoreVertical,
  Edit2,
  Copy,
  Star,
  Pin,
  FolderInput,
  Archive,
  Trash2,
  RotateCcw,
} from "lucide-react";

export interface ContextMenuAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: "default" | "destructive" | "active";
}

export interface NotebookContextMenuProps {
  onRename?: () => void;
  onDuplicate?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  onPin?: () => void;
  isPinned?: boolean;
  onMove?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  isArchived?: boolean;
  onDelete?: () => void;
  trigger?: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export const NotebookContextMenu: React.FC<NotebookContextMenuProps> = ({
  onRename,
  onDuplicate,
  onFavorite,
  isFavorite = false,
  onPin,
  isPinned = false,
  onMove,
  onArchive,
  onRestore,
  isArchived = false,
  onDelete,
  trigger,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const toggleOpen = (newVal: boolean) => {
    setIsOpen(newVal);
    onOpenChange?.(newVal);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        toggleOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        toggleOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (action?: () => void) => {
    if (action) action();
    toggleOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen(!isOpen);
        }}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        aria-label="Notebook options"
      >
        {trigger || <MoreVertical className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 z-50 rounded-2xl border border-border/80 bg-popover p-1.5 shadow-xl backdrop-blur-xl animate-fadeIn space-y-0.5 text-xs text-popover-foreground select-none">
          {onRename && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onRename);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary text-left font-medium transition-colors cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5 text-primary" />
              <span>Rename</span>
            </button>
          )}

          {onDuplicate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDuplicate);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary text-left font-medium transition-colors cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5 text-primary" />
              <span>Duplicate</span>
            </button>
          )}

          {onFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onFavorite);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary text-left font-medium transition-colors cursor-pointer"
            >
              <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-amber-400 text-amber-400" : "text-amber-500"}`} />
              <span>{isFavorite ? "Unfavorite" : "Favorite"}</span>
            </button>
          )}

          {onPin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onPin);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary text-left font-medium transition-colors cursor-pointer"
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-primary text-primary" : "text-primary"}`} />
              <span>{isPinned ? "Unpin" : "Pin"}</span>
            </button>
          )}

          {onMove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onMove);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 hover:text-primary text-left font-medium transition-colors cursor-pointer"
            >
              <FolderInput className="h-3.5 w-3.5 text-primary" />
              <span>Move Page</span>
            </button>
          )}

          <div className="my-1 border-t border-border/40" />

          {isArchived && onRestore ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onRestore);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-left font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore</span>
            </button>
          ) : (
            onArchive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(onArchive);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-accent text-left font-medium transition-colors cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Archive</span>
              </button>
            )
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction(onDelete);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-destructive/10 text-destructive text-left font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
