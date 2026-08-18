"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { formatBytes } from "../utils/validation";
import {
  FileText,
  FileCode,
  Image as ImageIcon,
  FileSpreadsheet,
  MoreVertical,
  Star,
  Trash2,
  ExternalLink,
  Edit2,
} from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { DocumentStatusBadge } from "./document-status-badge";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: UploadedDocumentRow;
  onSelect: (doc: UploadedDocumentRow) => void;
  onToggleFavorite: (id: string, cur: boolean) => void;
  onToggleArchive: (id: string, cur: boolean) => void;
  onDelete: (doc: UploadedDocumentRow) => void;
  onRename: (doc: UploadedDocumentRow) => void;
}

export function DocumentCard({
  document: doc,
  onSelect,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onRename,
}: DocumentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const getFileIcon = () => {
    switch (doc.file_type) {
      case "image":
        return <ImageIcon className="h-6 w-6 text-emerald-500" />;
      case "word":
        return <FileText className="h-6 w-6 text-primary" />;
      case "powerpoint":
        return <FileSpreadsheet className="h-6 w-6 text-amber-500" />;
      case "text":
        return <FileCode className="h-6 w-6 text-primary" />;
      case "pdf":
      default:
        return <FileText className="h-6 w-6 text-rose-500" />;
    }
  };

  const dropdownItems: DropdownItem[] = [
    {
      label: "Inspect Details",
      icon: <ExternalLink className="h-3.5 w-3.5 text-primary" />,
      onClick: () => onSelect(doc),
    },
    {
      label: doc.is_favorite ? "Unfavorite" : "Favorite",
      icon: <Star className={cn("h-3.5 w-3.5", doc.is_favorite ? "fill-amber-400 text-amber-400" : "text-amber-500")} />,
      onClick: () => onToggleFavorite(doc.id, doc.is_favorite),
    },
    {
      label: "Rename",
      icon: <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />,
      onClick: () => onRename(doc),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      destructive: true,
      onClick: () => onDelete(doc),
    },
  ];

  return (
    <div
      onClick={() => onSelect(doc)}
      className={cn(
        "group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md p-5 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer space-y-4",
        isMenuOpen ? "z-30 border-primary/40 shadow-xl" : "z-10 hover:z-20"
      )}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/50 group-hover:scale-105 transition-transform shrink-0">
          {getFileIcon()}
        </div>

        <div className="flex items-center gap-1">
          {doc.is_favorite && <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />}
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              align="right"
              onOpenChange={setIsMenuOpen}
              trigger={
                <button
                  type="button"
                  className="p-1.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Document options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={dropdownItems}
            />
          </div>
        </div>
      </div>

      {/* Info Body */}
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
          {doc.display_name || doc.original_name || doc.file_name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <div className="flex items-center gap-2">
            <span>{formatBytes(doc.file_size)}</span>
            <span>•</span>
            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
          </div>
          <DocumentStatusBadge status={doc.processing_status || "uploaded"} showIcon={false} />
        </div>
      </div>

      {/* Tags Row */}
      {doc.tags && doc.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {doc.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-lg"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
