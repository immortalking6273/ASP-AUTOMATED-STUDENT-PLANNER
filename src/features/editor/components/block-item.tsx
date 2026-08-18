"use client";

import * as React from "react";
import { EditorBlock, BlockType } from "../types";
import { ParagraphBlock } from "./renderers/paragraph-block";
import { HeadingBlock } from "./renderers/heading-block";
import { ListBlock } from "./renderers/list-block";
import { ChecklistBlock } from "./renderers/checklist-block";
import { QuoteBlock } from "./renderers/quote-block";
import { DividerBlock } from "./renderers/divider-block";
import { CodeBlock } from "./renderers/code-block";
import { CalloutBlock } from "./renderers/callout-block";
import { ToggleBlock } from "./renderers/toggle-block";
import { TableBlock } from "./renderers/table-block";
import { PlaceholderBlock } from "./renderers/placeholder-block";
import { TableOfContentsBlock } from "./renderers/table-of-contents-block";
import { PageLinkBlock } from "./renderers/page-link-block";
import { GripVertical, Plus, Trash2, Copy, RefreshCw } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";

interface BlockItemProps {
  block: EditorBlock;
  allBlocks: EditorBlock[];
  index: number;
  onUpdate: (id: string, updates: any) => void;
  onAddAfter: (id: string, type?: BlockType) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onConvertType: (id: string, type: BlockType) => void;
  onSlashTrigger: (id: string) => void;
}

export function BlockItem({
  block,
  allBlocks,
  index,
  onUpdate,
  onAddAfter,
  onDelete,
  onDuplicate,
  onConvertType,
  onSlashTrigger,
}: BlockItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const dropdownItems: DropdownItem[] = [
    {
      label: "Duplicate",
      icon: <Copy className="h-3.5 w-3.5" />,
      onClick: () => onDuplicate(block.id),
    },
    {
      label: "Turn to H1",
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      onClick: () => onConvertType(block.id, "heading_1"),
    },
    {
      label: "Turn to Callout",
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      onClick: () => onConvertType(block.id, "callout"),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      destructive: true,
      onClick: () => onDelete(block.id),
    },
  ];

  const renderContent = () => {
    switch (block.block_type) {
      case "heading_1":
      case "heading_2":
      case "heading_3":
        return (
          <HeadingBlock
            block={block}
            onChange={(text) => onUpdate(block.id, { content: { text } })}
            onEnter={() => onAddAfter(block.id)}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "bullet_list":
      case "numbered_list":
        return (
          <ListBlock
            block={block}
            indexInGroup={index + 1}
            onChange={(text) => onUpdate(block.id, { content: { text } })}
            onEnter={() => onAddAfter(block.id, block.block_type as BlockType)}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "checklist":
        return (
          <ChecklistBlock
            block={block}
            onChange={(text, checked) => onUpdate(block.id, { content: { text, checked } })}
            onEnter={() => onAddAfter(block.id, "checklist")}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "quote":
        return (
          <QuoteBlock
            block={block}
            onChange={(text) => onUpdate(block.id, { content: { text } })}
            onEnter={() => onAddAfter(block.id)}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "divider":
        return <DividerBlock />;
      case "code":
        return (
          <CodeBlock
            block={block}
            onChange={(text, language) => onUpdate(block.id, { content: { text, language } })}
            onEnter={() => onAddAfter(block.id)}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "callout":
        return (
          <CalloutBlock
            block={block}
            onChange={(text, calloutIcon) => onUpdate(block.id, { content: { text, calloutIcon } })}
            onEnter={() => onAddAfter(block.id)}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "toggle":
        return (
          <ToggleBlock
            block={block}
            onChange={(text, isCollapsed) => onUpdate(block.id, { content: { text, isCollapsed } })}
            onEnter={() => onAddAfter(block.id)}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "table":
        return (
          <TableBlock
            block={block}
            onChange={(rows) => onUpdate(block.id, { content: { rows } })}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "image_placeholder":
      case "video_placeholder":
      case "file_placeholder":
      case "bookmark_placeholder":
      case "equation_placeholder":
      case "embed_placeholder":
        return (
          <PlaceholderBlock
            block={block}
            onChange={(url, caption) => onUpdate(block.id, { content: { url, caption } })}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      case "table_of_contents":
        return <TableOfContentsBlock allBlocks={allBlocks} />;
      case "page_link":
        return (
          <PageLinkBlock
            block={block}
            onChange={(linkedPageTitle) => onUpdate(block.id, { content: { linkedPageTitle } })}
            onBackspaceEmpty={() => onDelete(block.id)}
          />
        );
      default:
        return (
          <ParagraphBlock
            block={block}
            onChange={(text) => onUpdate(block.id, { content: { text } })}
            onEnter={() => onAddAfter(block.id)}
            onBackspaceEmpty={() => onDelete(block.id)}
            onSlashTrigger={() => onSlashTrigger(block.id)}
          />
        );
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-start gap-1 py-0.5 px-2 rounded-xl hover:bg-accent/30 transition-colors"
    >
      {/* Drag & Action Handles */}
      <div
        className={`flex items-center gap-0.5 pt-1.5 shrink-0 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => onAddAfter(block.id)}
          className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
          title="Add block below"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <Dropdown
          trigger={
            <button
              type="button"
              className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors cursor-grab"
              title="Block options"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          }
          items={dropdownItems}
        />
      </div>

      {/* Main Block Content */}
      <div className="flex-1 min-w-0">{renderContent()}</div>
    </div>
  );
}
