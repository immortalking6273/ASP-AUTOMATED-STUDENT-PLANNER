"use client";

import * as React from "react";
import { BlocksService } from "@/services/db/blocks-service";
import { EditorBlock, BlockType, BlockContent, BlockMetadata } from "../types";
import { toast } from "@/components/ui/toast";

export function useBlockEditor(pageId: string) {
  const [blocks, setBlocks] = React.useState<EditorBlock[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isDirty, setIsDirty] = React.useState<boolean>(false);

  // History stack for Undo / Redo
  const historyRef = React.useRef<EditorBlock[][]>([]);
  const historyIndexRef = React.useRef<number>(-1);

  const pushHistory = (newBlocks: EditorBlock[]) => {
    // Truncate future redo stack and push new state
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(JSON.parse(JSON.stringify(newBlocks)));
    historyIndexRef.current = historyRef.current.length - 1;
  };

  // Fetch page blocks from Supabase
  const fetchBlocks = React.useCallback(async () => {
    if (!pageId) return;
    setIsLoading(true);
    try {
      const rawBlocks = await BlocksService.getBlocksByPage(pageId);
      
      let parsedBlocks: EditorBlock[] = rawBlocks.map((b) => ({
        ...b,
        content: (b.content as BlockContent) || { text: "" },
        metadata: (b.metadata as BlockMetadata) || {},
      }));

      // If page has no blocks yet, insert initial default paragraph block
      if (parsedBlocks.length === 0) {
        const initial = await BlocksService.createBlock(pageId, {
          block_type: "paragraph",
          content: { text: "" },
          order_index: 0,
        });
        parsedBlocks = [
          {
            ...initial,
            content: (initial.content as BlockContent) || { text: "" },
            metadata: (initial.metadata as BlockMetadata) || {},
          },
        ];
      }

      setBlocks(parsedBlocks);
      historyRef.current = [JSON.parse(JSON.stringify(parsedBlocks))];
      historyIndexRef.current = 0;
      setIsDirty(false);
    } catch (err: any) {
      console.error("Error loading page blocks:", err);
      toast.error("Failed to load page content", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  React.useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // Update block content / metadata
  const updateBlock = (id: string, updates: { content?: Partial<BlockContent>; metadata?: Partial<BlockMetadata>; block_type?: BlockType }) => {
    setBlocks((prev) => {
      const next = prev.map((b) => {
        if (b.id !== id) return b;
        return {
          ...b,
          block_type: updates.block_type || b.block_type,
          content: updates.content ? { ...b.content, ...updates.content } : b.content,
          metadata: updates.metadata ? { ...b.metadata, ...updates.metadata } : b.metadata,
          updated_at: new Date().toISOString(),
        };
      });
      pushHistory(next);
      setIsDirty(true);
      return next;
    });
  };

  // Insert a new block after target index
  const addBlockAfter = (targetId: string, blockType: BlockType = "paragraph", initialContent: BlockContent = { text: "" }) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === targetId);
      const newIndex = index >= 0 ? index + 1 : prev.length;

      const newBlock: EditorBlock = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        page_id: pageId,
        block_type: blockType,
        content: initialContent,
        metadata: {},
        order_index: newIndex,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const next = [...prev];
      next.splice(newIndex, 0, newBlock);
      // Re-index order
      next.forEach((b, i) => (b.order_index = i));

      pushHistory(next);
      setIsDirty(true);
      return next;
    });
  };

  // Convert block type
  const convertBlockType = (id: string, newType: BlockType) => {
    updateBlock(id, { block_type: newType });
  };

  // Delete block
  const deleteBlock = (id: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) {
        // Keep at least 1 empty paragraph block
        return prev.map((b) =>
          b.id === id ? { ...b, block_type: "paragraph", content: { text: "" } } : b
        );
      }
      const next = prev.filter((b) => b.id !== id);
      next.forEach((b, i) => (b.order_index = i));
      pushHistory(next);
      setIsDirty(true);
      return next;
    });
  };

  // Duplicate block
  const duplicateBlock = (id: string) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      if (index < 0) return prev;

      const original = prev[index];
      const dup: EditorBlock = {
        ...JSON.parse(JSON.stringify(original)),
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        order_index: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const next = [...prev];
      next.splice(index + 1, 0, dup);
      next.forEach((b, i) => (b.order_index = i));
      pushHistory(next);
      setIsDirty(true);
      return next;
    });
  };

  // Reorder blocks (drag and drop)
  const reorderBlocks = (sourceIndex: number, destinationIndex: number) => {
    setBlocks((prev) => {
      const next = [...prev];
      const [removed] = next.splice(sourceIndex, 1);
      next.splice(destinationIndex, 0, removed);
      next.forEach((b, i) => (b.order_index = i));
      pushHistory(next);
      setIsDirty(true);
      return next;
    });
  };

  // Replace client temporary block IDs with real database UUIDs after successful auto-save
  const replaceBlockIds = React.useCallback((idMap: Record<string, string>) => {
    if (!idMap || Object.keys(idMap).length === 0) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (idMap[b.id]) {
          return { ...b, id: idMap[b.id] };
        }
        return b;
      })
    );
    // Also update history stack to prevent temporary IDs from reappearing on Undo
    historyRef.current = historyRef.current.map((stack) =>
      stack.map((b) => (idMap[b.id] ? { ...b, id: idMap[b.id] } : b))
    );
  }, []);

  // Undo operation
  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current];
      setBlocks(JSON.parse(JSON.stringify(prev)));
      setIsDirty(true);
    }
  };

  // Redo operation
  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current];
      setBlocks(JSON.parse(JSON.stringify(next)));
      setIsDirty(true);
    }
  };

  return {
    blocks,
    isLoading,
    isDirty,
    markClean: () => setIsDirty(false),
    updateBlock,
    addBlockAfter,
    convertBlockType,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
    replaceBlockIds,
    undo,
    redo,
    refresh: fetchBlocks,
  };
}
