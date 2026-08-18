"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { formatBytes } from "../utils/validation";
import { FileText, Star, MoreVertical, Trash2, ExternalLink, Edit2 } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { DocumentStatusBadge } from "./document-status-badge";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: UploadedDocumentRow[];
  onSelect: (doc: UploadedDocumentRow) => void;
  onToggleFavorite: (id: string, cur: boolean) => void;
  onDelete: (doc: UploadedDocumentRow) => void;
  onRename: (doc: UploadedDocumentRow) => void;
}

export function DocumentList({
  documents,
  onSelect,
  onToggleFavorite,
  onDelete,
  onRename,
}: DocumentListProps) {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md shadow-sm relative">
      <div className="overflow-x-auto rounded-3xl">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-accent/40 text-muted-foreground border-b border-border/50 text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3.5 pl-5">Name</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5">AI Status</th>
              <th className="p-3.5">Uploaded</th>
              <th className="p-3.5 text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {documents.map((doc) => {
              const isMenuOpen = activeMenuId === doc.id;

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
                <tr
                  key={doc.id}
                  onClick={() => onSelect(doc)}
                  className={cn(
                    "hover:bg-accent/50 transition-colors cursor-pointer group",
                    isMenuOpen && "bg-accent/40 z-30 relative"
                  )}
                >
                  <td className="p-3.5 pl-5 font-bold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate max-w-xs sm:max-w-md group-hover:text-primary transition-colors">
                        {doc.display_name || doc.original_name}
                      </span>
                      {doc.is_favorite && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground uppercase font-semibold">
                    {doc.file_type || "pdf"}
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">{formatBytes(doc.file_size)}</td>
                  <td className="p-3.5">
                    <DocumentStatusBadge status={doc.processing_status || "uploaded"} />
                  </td>
                  <td className="p-3.5 text-xs text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right pr-5" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      align="right"
                      onOpenChange={(isOpen) => setActiveMenuId(isOpen ? doc.id : null)}
                      trigger={
                        <button
                          type="button"
                          className="p-1 rounded-xl hover:bg-accent text-muted-foreground transition-colors cursor-pointer"
                          aria-label="Document options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      items={dropdownItems}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
