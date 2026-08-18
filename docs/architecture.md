# ASP Architecture Overview

ASP follows **Clean Architecture** principles and **Feature-Driven Design** to ensure scalability, modularity, and maintainability.

## Architectural Layers

1. **Presentation Layer (`src/app/`, `src/components/`)**:
   - Next.js App Router for server-rendered layouts and dynamic routes.
   - Reusable UI component library isolated in `src/components/ui/` with zero feature-specific dependencies.
   - Layout primitives (`Sidebar`, `Navbar`, `AppShell`) managing responsive UI state.

2. **Feature Slices Layer (`src/features/`)**:
   - Self-contained feature folders (`notes`, `documents`, `planner`, `chat`, etc.).
   - Each feature encapsulates its own API client calls, hooks, Zustand stores, components, and types.

3. **Core Services & Domain Layer (`src/services/`, `src/lib/`, `src/config/`)**:
   - Environment validation via Zod (`src/config/env.ts`).
   - Global permissions and role matrix (`src/config/permissions.ts`).
   - Abstraction wrappers for external services (Supabase, Groq AI).

4. **Cross-Cutting Concerns (`src/hooks/`, `src/providers/`, `src/styles/`)**:
   - Global AppProvider managing themes (Dark/Light) and toast notifications (Sonner).
   - Custom hooks (`useTheme`, `useDebounce`, `useMediaQuery`, `useMounted`).
