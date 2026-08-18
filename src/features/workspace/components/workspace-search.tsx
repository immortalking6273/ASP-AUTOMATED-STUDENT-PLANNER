"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface WorkspaceSearchProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export const WorkspaceSearch: React.FC<WorkspaceSearchProps> = ({
  value,
  onChange,
  placeholder = "Search workspaces by title or description...",
}) => {
  return (
    <div className="relative w-full max-w-sm">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value ? (
            <button
              onClick={() => onChange("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        className="w-full text-xs"
      />
    </div>
  );
};
