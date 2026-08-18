import { BlockRow } from "@/types/database";

export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bullet_list"
  | "numbered_list"
  | "checklist"
  | "quote"
  | "divider"
  | "code"
  | "callout"
  | "toggle"
  | "table"
  | "image_placeholder"
  | "video_placeholder"
  | "file_placeholder"
  | "bookmark_placeholder"
  | "equation_placeholder"
  | "table_of_contents"
  | "page_link"
  | "embed_placeholder";

export interface FormattingState {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  highlight?: string;
  textColor?: string;
  backgroundColor?: string;
  link?: string;
}

export interface BlockContent {
  text?: string;
  checked?: boolean;
  language?: string;
  calloutIcon?: string;
  calloutColor?: string;
  isCollapsed?: boolean;
  rows?: string[][];
  caption?: string;
  url?: string;
  formula?: string;
  linkedPageId?: string;
  linkedPageTitle?: string;
  level?: number;
  formatting?: FormattingState;
}

export interface BlockMetadata {
  author?: string;
  indentation?: number;
  textColor?: string;
  backgroundColor?: string;
}

export interface EditorBlock extends Omit<BlockRow, "content" | "metadata"> {
  content: BlockContent;
  metadata: BlockMetadata;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SlashCommandItem {
  id: BlockType;
  title: string;
  description: string;
  iconName: string;
  category: "Basic" | "Lists & Tasks" | "Structure" | "Media & Placeholders" | "Advanced";
}

export interface SearchMatch {
  blockId: string;
  matchIndex: number;
  textSnippet: string;
}
