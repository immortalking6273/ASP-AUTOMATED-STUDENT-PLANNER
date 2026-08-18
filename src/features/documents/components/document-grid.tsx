"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { DocumentCard } from "./document-card";

interface DocumentGridProps {
  documents: UploadedDocumentRow[];
  onSelect: (doc: UploadedDocumentRow) => void;
  onToggleFavorite: (id: string, cur: boolean) => void;
  onToggleArchive: (id: string, cur: boolean) => void;
  onDelete: (doc: UploadedDocumentRow) => void;
  onRename: (doc: UploadedDocumentRow) => void;
}

export function DocumentGrid({
  documents,
  onSelect,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onRename,
}: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          onToggleArchive={onToggleArchive}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}
