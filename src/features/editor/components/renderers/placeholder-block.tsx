"use client";

import * as React from "react";
import { EditorBlock } from "../../types";
import { Image, Video, File, Bookmark, Calculator, Link as LinkIcon, ExternalLink } from "lucide-react";

interface PlaceholderBlockProps {
  block: EditorBlock;
  onChange: (url: string, caption?: string) => void;
  onBackspaceEmpty: () => void;
}

export function PlaceholderBlock({ block, onChange, onBackspaceEmpty }: PlaceholderBlockProps) {
  const url = block.content?.url || "";
  const caption = block.content?.caption || "";
  const formula = block.content?.formula || "";

  const [inputUrl, setInputUrl] = React.useState(url);
  const [inputCaption, setInputCaption] = React.useState(caption);
  const [isEditing, setIsEditing] = React.useState(!url);

  const getBlockConfig = () => {
    switch (block.block_type) {
      case "image_placeholder":
        return { label: "Image", icon: Image, placeholder: "https://example.com/image.jpg" };
      case "video_placeholder":
        return { label: "Video", icon: Video, placeholder: "https://youtube.com/watch?v=..." };
      case "file_placeholder":
        return { label: "File Attachment", icon: File, placeholder: "https://example.com/document.pdf" };
      case "bookmark_placeholder":
        return { label: "Web Bookmark", icon: Bookmark, placeholder: "https://wikipedia.org/..." };
      case "equation_placeholder":
        return { label: "Math Equation (TeX)", icon: Calculator, placeholder: "e = mc^2" };
      default:
        return { label: "Embed Link", icon: LinkIcon, placeholder: "https://..." };
    }
  };

  const config = getBlockConfig();
  const Icon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(inputUrl, inputCaption);
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-4 my-2 text-xs sm:text-sm space-y-3 w-full shadow-xs">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span>{config.label}</span>
        </div>
        {url && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            {isEditing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      {isEditing || !url ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={config.placeholder}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={inputCaption}
              onChange={(e) => setInputCaption(e.target.value)}
              placeholder="Caption (optional)..."
              className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shrink-0"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background/80 hover:bg-accent/60 transition-colors group"
          >
            <span className="truncate font-medium text-foreground group-hover:text-primary">{url}</span>
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
          </a>
          {caption && <p className="text-xs text-muted-foreground italic px-1">{caption}</p>}
        </div>
      )}
    </div>
  );
}
