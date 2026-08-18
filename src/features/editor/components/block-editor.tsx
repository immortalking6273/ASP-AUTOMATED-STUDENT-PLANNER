"use client";

import * as React from "react";
import { PageRow } from "@/types/database";
import { useBlockEditor } from "../hooks/use-block-editor";
import { useAutoSave } from "../hooks/use-auto-save";
import { useSlashCommand } from "../hooks/use-slash-command";
import { useFormattingToolbar } from "../hooks/use-formatting-toolbar";
import { useEditorShortcuts } from "../hooks/use-editor-shortcuts";
import { useInPageSearch } from "../hooks/use-in-page-search";

import { PageMetaBar } from "./page-meta-bar";
import { BlockItem } from "./block-item";
import { SlashCommandMenu } from "./slash-command-menu";
import { FormattingToolbar } from "./formatting-toolbar";
import { InPageSearch } from "./in-page-search";
import { AINoteAssistant } from "./ai-note-assistant";
import { BlockType } from "../types";

interface BlockEditorProps {
  page: PageRow;
  workspaceId?: string;
}

export function BlockEditor({ page, workspaceId }: BlockEditorProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = React.useState(false);

  const {
    blocks,
    isLoading,
    isDirty,
    markClean,
    updateBlock,
    addBlockAfter,
    convertBlockType,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
    replaceBlockIds,
    undo,
    redo,
  } = useBlockEditor(page.id);

  const { saveStatus, lastSavedTime } = useAutoSave(page.id, blocks, isDirty, markClean, replaceBlockIds);

  const {
    isOpen: isSlashOpen,
    query: slashQuery,
    selectedIndex: slashSelectedIndex,
    activeBlockId: slashActiveBlockId,
    filteredCommands,
    openSlashMenu,
    closeSlashMenu,
    handleKeyDown: handleSlashKeyDown,
  } = useSlashCommand((newType: BlockType) => {
    if (slashActiveBlockId) {
      convertBlockType(slashActiveBlockId, newType);
    }
  });

  const { isVisible: isFormattingVisible, position: formattingPosition, hideToolbar } = useFormattingToolbar();

  const {
    isOpen: isSearchOpen,
    query: searchQuery,
    matches: searchMatches,
    activeMatchIndex: searchActiveMatchIndex,
    setQuery: setSearchQuery,
    nextMatch: nextSearchMatch,
    prevMatch: prevSearchMatch,
    openSearch,
    closeSearch,
  } = useInPageSearch(blocks);

  useEditorShortcuts({
    onUndo: undo,
    onRedo: redo,
    onSearchToggle: () => (isSearchOpen ? closeSearch() : openSearch()),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const lastBlockId = blocks.length > 0 ? blocks[blocks.length - 1].id : "";
  const targetWorkspaceId = workspaceId || page.notebook_id;

  return (
    <div className="relative space-y-4 max-w-4xl mx-auto w-full pb-24" onKeyDown={handleSlashKeyDown}>
      {/* Top Page Meta & Analytics Bar */}
      <PageMetaBar
        page={page}
        blocks={blocks}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        onToggleSearch={() => (isSearchOpen ? closeSearch() : openSearch())}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* Floating In-Page Search Bar */}
      <InPageSearch
        isOpen={isSearchOpen}
        query={searchQuery}
        matches={searchMatches}
        activeMatchIndex={searchActiveMatchIndex}
        onQueryChange={setSearchQuery}
        onNext={nextSearchMatch}
        onPrev={prevSearchMatch}
        onClose={closeSearch}
      />

      {/* Main Block List Container */}
      <div className="space-y-1 min-h-[400px]">
        {blocks.map((block, idx) => (
          <BlockItem
            key={block.id}
            block={block}
            allBlocks={blocks}
            index={idx}
            onUpdate={updateBlock}
            onAddAfter={addBlockAfter}
            onDelete={deleteBlock}
            onDuplicate={duplicateBlock}
            onConvertType={convertBlockType}
            onSlashTrigger={(id) => openSlashMenu(id)}
          />
        ))}
      </div>

      {/* Slash Command Searchable Menu Popover */}
      <SlashCommandMenu
        isOpen={isSlashOpen}
        query={slashQuery}
        selectedIndex={slashSelectedIndex}
        commands={filteredCommands}
        onSelect={(type) => {
          if (slashActiveBlockId) convertBlockType(slashActiveBlockId, type);
          closeSlashMenu();
        }}
        onClose={closeSlashMenu}
      />

      {/* Contextual Floating Text Formatting Toolbar */}
      <FormattingToolbar
        isVisible={isFormattingVisible}
        position={formattingPosition}
        onApplyFormat={(format, value) => {
          hideToolbar();
        }}
        onClose={hideToolbar}
      />

      {/* NVIDIA NIM AI Note Assistant Drawer */}
      <AINoteAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        pageTitle={page.title}
        workspaceId={targetWorkspaceId}
        blocks={blocks}
        onInsertBlock={(aiText) => {
          addBlockAfter(lastBlockId, "paragraph", { text: aiText });
        }}
      />
    </div>
  );
}
