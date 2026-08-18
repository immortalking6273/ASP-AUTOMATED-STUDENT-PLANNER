"use client";

import * as React from "react";

export interface ShortcutHandlers {
  onUndo?: () => void;
  onRedo?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onSearchToggle?: () => void;
}

export function useEditorShortcuts({
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onUnderline,
  onSearchToggle,
}: ShortcutHandlers) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          onRedo?.();
        } else {
          e.preventDefault();
          onUndo?.();
        }
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onBold?.();
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "i") {
        e.preventDefault();
        onItalic?.();
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "u") {
        e.preventDefault();
        onUnderline?.();
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "f") {
        e.preventDefault();
        onSearchToggle?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, onBold, onItalic, onUnderline, onSearchToggle]);
}
