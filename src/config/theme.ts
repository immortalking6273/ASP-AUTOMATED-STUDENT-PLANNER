export const themeConfig = {
  /** Default theme on first visit — reads OS preference when set to "system" */
  defaultTheme: "system" as const,

  /** Use class strategy: next-themes toggles class="dark" on <html> */
  attribute: "class" as const,

  /** Enable OS preference detection */
  enableSystem: true,

  /**
   * MUST be true so next-themes does NOT inject a style that strips all CSS
   * transitions during the theme switch. We apply our own smooth transition
   * via the `html { transition: background-color 250ms ease ... }` rule in
   * globals.css, which is more precise and avoids the flash-of-no-transition.
   */
  disableTransitionOnChange: true,

  /** localStorage key for persistence */
  storageKey: "asp-theme-preference",
};
