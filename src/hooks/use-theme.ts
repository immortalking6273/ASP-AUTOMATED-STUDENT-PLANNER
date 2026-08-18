"use client";

import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  // resolvedTheme is undefined before the component mounts.
  // Fall back to "light" so toggle always works correctly.
  const currentTheme = resolvedTheme ?? "light";

  return {
    theme,
    setTheme,
    resolvedTheme: currentTheme,
    isDark: currentTheme === "dark",
    toggleTheme: () => setTheme(currentTheme === "dark" ? "light" : "dark"),
  };
}
