"use client";

import * as React from "react";
import { UploadedDocumentRow } from "@/types/database";
import { DocumentsService } from "@/services/db/documents-service";
import { toast } from "@/components/ui/toast";

export function useDocumentDetails(document: UploadedDocumentRow | null) {
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (document) {
      setIsGeneratingUrl(true);
      DocumentsService.getDownloadUrl(document.storage_path)
        .then(setDownloadUrl)
        .finally(() => setIsGeneratingUrl(false));

      // Record last opened timestamp
      DocumentsService.touchLastOpened(document.id);
    } else {
      setDownloadUrl(null);
    }
  }, [document]);

  const addTag = async (tag: string) => {
    if (!document || !tag.trim()) return;
    const currentTags = document.tags || [];
    if (currentTags.includes(tag.trim())) return;

    const newTags = [...currentTags, tag.trim()];
    try {
      await DocumentsService.updateDocument(document.id, { tags: newTags });
      toast.success(`Added tag '${tag.trim()}'`);
    } catch (err: any) {
      toast.error("Failed to add tag", err.message);
    }
  };

  const removeTag = async (tag: string) => {
    if (!document) return;
    const newTags = (document.tags || []).filter((t) => t !== tag);
    try {
      await DocumentsService.updateDocument(document.id, { tags: newTags });
      toast.success(`Removed tag '${tag}'`);
    } catch (err: any) {
      toast.error("Failed to remove tag", err.message);
    }
  };

  return {
    downloadUrl,
    isGeneratingUrl,
    addTag,
    removeTag,
  };
}
