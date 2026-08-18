"use client";

import * as React from "react";
import { BlocksService } from "@/services/db/blocks-service";
import { EditorBlock, SaveStatus } from "../types";

export function useAutoSave(
  pageId: string,
  blocks: EditorBlock[],
  isDirty: boolean,
  markClean: () => void,
  onReplaceBlockIds?: (idMap: Record<string, string>) => void
) {
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [lastSavedTime, setLastSavedTime] = React.useState<Date | null>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = React.useRef<boolean>(false);

  const performSave = React.useCallback(async () => {
    if (!pageId || !isDirty || blocks.length === 0 || isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus("saving");
    try {
      const result = await BlocksService.batchSaveBlocks(pageId, blocks);
      if (result.success) {
        if (result.idMap && Object.keys(result.idMap).length > 0 && onReplaceBlockIds) {
          onReplaceBlockIds(result.idMap);
        }
        setSaveStatus("saved");
        setLastSavedTime(new Date());
        markClean();
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("[AutoSave] Save operation failed:", err);
      setSaveStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [pageId, blocks, isDirty, markClean, onReplaceBlockIds]);

  // Debounced auto-save trigger on content modification (800ms idle delay)
  React.useEffect(() => {
    if (!isDirty) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      performSave();
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isDirty, performSave]);

  // Warn user if navigating away with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return {
    saveStatus,
    lastSavedTime,
    triggerManualSave: performSave,
  };
}
