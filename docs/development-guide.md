# ASP Development Guide

## Workflow Guidelines

1. **Strict TypeScript Compliance**:
   - Do not use `any`. Always create explicit interfaces or types in `src/types/` or feature-specific `types.ts` files.
   - Use strict null checks and optional chaining (`?.`).

2. **Styling & Design System**:
   - Use Tailwind utility classes with the `cn(...)` helper function for class merging.
   - Always reference design system variables (e.g. `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-primary`).
   - Support both Light and Dark modes seamlessly.

3. **Component Guidelines**:
   - Place generic, reusable primitives in `src/components/ui/`.
   - Place feature-specific UI in `src/features/<feature_name>/components/`.
   - Always provide accessible focus indicators (`focus-visible:ring-2`) and ARIA labels.

4. **State Management**:
   - Use local component state (`useState`) for transient UI state (e.g. dropdown open state).
   - Use Zustand stores in feature directories for module-level shared state.
