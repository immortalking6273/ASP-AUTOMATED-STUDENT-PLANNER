"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();
  const mounted = useMounted();

  // Render a stable skeleton placeholder during SSR / before hydration.
  // This prevents hydration mismatch — the placeholder has the same dimensions
  // as the real button so layout doesn't shift on mount.
  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-lg border border-border bg-muted/40 animate-pulse",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const label = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "border border-input bg-background text-foreground",
        "transition-colors duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      aria-label={label}
      title={label}
      type="button"
    >
      {/* Sun icon — visible in dark mode (click to go light) */}
      <Sun
        className={cn(
          "absolute h-4 w-4 text-amber-400 transition-all duration-300",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0"
        )}
        aria-hidden="true"
      />

      {/* Moon icon — visible in light mode (click to go dark) */}
      <Moon
        className={cn(
          "absolute h-4 w-4 text-slate-600 dark:text-slate-300 transition-all duration-300",
          isDark
            ? "scale-50 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100"
        )}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <span
        className={cn(
          "pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "rounded-md bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground",
          "border border-border shadow-md",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-300",
          "z-50"
        )}
        role="tooltip"
      >
        {label}
      </span>
    </button>
  );
};
