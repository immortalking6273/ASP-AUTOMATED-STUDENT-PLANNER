"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-7 w-7 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-9 w-9 p-2",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle();
      }}
      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40",
        isFavorite
          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        sizeClasses[size],
        className
      )}
    >
      <Star
        className={cn(
          iconSizes[size],
          "transition-transform duration-200 active:scale-125",
          isFavorite ? "fill-amber-400 text-amber-500" : ""
        )}
      />
    </button>
  );
};
