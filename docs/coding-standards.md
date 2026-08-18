# Coding Standards & Naming Conventions

## Naming Conventions

| Entity | Convention | Example |
| :--- | :--- | :--- |
| **Files & Folders** | `kebab-case` | `theme-toggle.tsx`, `use-debounce.ts` |
| **Components** | `PascalCase` | `Button`, `AppShell`, `ComingSoon` |
| **Hooks** | `camelCase` starting with `use` | `useTheme`, `useMounted` |
| **Types & Interfaces** | `PascalCase` | `User`, `RouteMeta`, `BadgeProps` |
| **Constants** | `UPPER_SNAKE_CASE` | `ROUTES`, `SIDEBAR_NAVIGATION` |

## Code Quality Rules

- **SOLID Principles**: Single responsibility per component/file.
- **DRY (Don't Repeat Yourself)**: Leverage standard UI primitives in `src/components/ui/`.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering transient states.
- **Accessibility**: Ensure keyboard navigation and proper color contrast.
