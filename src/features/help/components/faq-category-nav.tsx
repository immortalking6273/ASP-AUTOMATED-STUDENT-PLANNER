"use client";

import * as React from "react";
import { FaqCategoryRow } from "../types";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

interface FaqCategoryNavProps {
  categories: FaqCategoryRow[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function FaqCategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
}: FaqCategoryNavProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
      <button
        type="button"
        onClick={() => onSelectCategory("all")}
        className={cn(
          "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
          selectedCategory === "all"
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
            : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Layers className="h-3.5 w-3.5" />
        All Topics
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              isSelected
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
