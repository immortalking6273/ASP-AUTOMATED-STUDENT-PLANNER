# ASP Folder Structure Explanation

```
ASP/
├── docs/                       # Architecture, standards, and integration guides
├── public/                     # Static public assets (favicons, images)
├── tests/                      # Test suite placeholders (unit, integration, components, e2e)
├── src/
│   ├── app/                    # Next.js App Router routes and error handlers
│   │   ├── (auth)/             # Route group for future authentication flows
│   │   ├── (dashboard)/        # Route group for dashboard pages (workspace, notes, etc.)
│   │   ├── api/                # Next.js API route handlers
│   │   ├── error.tsx           # Global 500 error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── loading.tsx         # Global loading screen
│   │   ├── maintenance/        # Maintenance status page
│   │   ├── offline/            # Offline status page
│   │   ├── unauthorized/       # 401 Unauthorized page
│   │   └── forbidden/          # 403 Forbidden page
│   ├── components/             # Reusable UI library
│   │   ├── ui/                 # Atomic UI primitives (Button, Card, Modal, Input, etc.)
│   │   ├── layout/             # Shell, Sidebar, Navbar, Footer, Breadcrumbs
│   │   └── feedback/           # Loader, Spinner, Skeleton, EmptyState, ErrorState
│   ├── features/               # Feature domain modules (structure only for Module 1)
│   │   ├── authentication/
│   │   ├── dashboard/
│   │   ├── workspace/
│   │   ├── notes/
│   │   ├── documents/
│   │   ├── planner/
│   │   ├── calendar/
│   │   ├── tasks/
│   │   ├── flashcards/
│   │   ├── quizzes/
│   │   ├── chat/
│   │   ├── search/
│   │   ├── analytics/
│   │   ├── settings/
│   │   ├── notifications/
│   │   └── study/
│   ├── hooks/                  # Custom utility React hooks
│   ├── services/               # Future API service clients
│   ├── lib/                    # Helper functions and cn utility
│   ├── utils/                  # Formatting and pure utilities
│   ├── constants/              # Route meta, nav items, app constants
│   ├── contexts/               # React Context definitions
│   ├── providers/              # Combined app provider wrapper
│   ├── types/                  # Global TypeScript interfaces
│   ├── styles/                 # Tailwind CSS globals and tokens
│   ├── assets/                 # App icons and brand logos
│   ├── config/                 # Site, Env, AI, DB, Theme, Permissions configs
│   └── middleware.ts           # Next.js Edge Middleware
├── .env.example                # Example environment variables
├── .env.local                  # Development environment variables
├── tailwind.config.ts          # Design system & Tailwind configuration
├── tsconfig.json               # Strict TypeScript configuration
└── package.json                # Project dependencies
```
