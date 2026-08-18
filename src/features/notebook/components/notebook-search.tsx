"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface NotebookSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const NotebookSearch: React.FC<NotebookSearchProps> = ({
  value,
  onChange,
  placeholder = "Search notebooks, descriptions, or page titles...",
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-0.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
        className="w-full text-xs bg-background/80 backdrop-blur-md rounded-2xl border-border/80"
      />
    </div>
  );
};

/**
 * Helper component to highlight matching search term text in titles or descriptions
 */
export const HighlightText: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query || !query.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={idx} className="bg-amber-400/30 text-amber-900 dark:text-amber-200 px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};
