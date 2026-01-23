# Save A Stray - Client

React frontend for the Save A Stray adoption platform.

## Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type checking
npm test             # Run tests (watch mode)
npm run test:run     # Run tests (single run)
npm run test:coverage # Run tests with coverage report
```

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite 6 (build tool)
- Apollo Client 3 (GraphQL)
- Tailwind CSS 3 + Shadcn-style components
- React Router 7
- Vitest + Testing Library

## Structure

```
src/
├── components/      # React components
│   ├── ui/          # Shadcn-style base components
│   └── css/         # Legacy component styles
├── graphql/         # Apollo queries and mutations
├── types/           # TypeScript type definitions
├── util/            # Route utilities
├── test/            # Test files and setup
└── lib/             # Utilities (cn helper)
```

See the root [README](../README.md) and [docs/](../docs/) for full documentation.
