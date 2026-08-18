"use client";

import * as React from "react";
import { FormattingState } from "../types";

export function useFormattingToolbar() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(null);

  const checkSelection = React.useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setIsVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      setIsVisible(false);
      return;
    }

    // Position floating toolbar above text selection
    setPosition({
      top: rect.top + window.scrollY - 44,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setIsVisible(true);
  }, []);

  React.useEffect(() => {
    document.addEventListener("selectionchange", checkSelection);
    return () => document.removeEventListener("selectionchange", checkSelection);
  }, [checkSelection]);

  return {
    isVisible,
    position,
    activeBlockId,
    setActiveBlockId,
    hideToolbar: () => setIsVisible(false),
  };
}
