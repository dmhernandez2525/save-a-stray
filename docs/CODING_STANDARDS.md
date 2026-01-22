# Save A Stray - Coding Standards

**Version:** 2.0.0
**Last Updated:** January 22, 2026

---

## General Principles

1. **Readability First**: Code should be self-documenting
2. **Consistency**: Follow established patterns in the codebase
3. **Simplicity**: Prefer simple solutions over clever ones
4. **DRY**: Don't Repeat Yourself, but avoid premature abstraction
5. **Type Safety**: TypeScript strict mode is mandatory

---

## Critical Rules - Auto-Reject Patterns

### NEVER Use

```typescript
any                    // Use specific types or unknown
@ts-ignore            // Fix the type error properly
eslint-disable        // Follow lint rules or configure correctly
console.log           // Use a proper logging service
alert()               // Use proper UI notifications (toast, modal)
// TODO:              // Create a GitHub issue instead
```

### ALWAYS Use

```typescript
// Proper type definitions
interface Animal {
  _id: string;
  name: string;
  type: string;
  age: number;
  sex: string;
  status: 'available' | 'pending' | 'adopted';
}

// Tailwind class utility for conditional classes
import { cn } from '@/lib/utils';
const className = cn('base-class', conditional && 'conditional-class');

// Proper error handling
try {
  const result = await mutation();
  if (result.errors) {
    // Handle GraphQL errors
  }
} catch (error) {
  // Handle network errors
}
```

---

## TypeScript

### Strict Mode

Both `tsconfig.json` (root) and `client/tsconfig.json` use `"strict": true`. This means:
- `noImplicitAny` - No implicit `any` types
- `strictNullChecks` - Null/undefined must be handled
- `strictFunctionTypes` - Function parameter types are checked
- `noImplicitReturns` - All code paths must return

### Type Definitions

```typescript
// Use interfaces for object shapes
interface ShelterInput {
  name: string;
  location: string;
  paymentEmail: string;
}

// Use type for unions, intersections, and aliases
type UserRole = 'shelter' | 'endUser';
type AnimalStatus = 'available' | 'pending' | 'adopted';

// Use generics when appropriate
function findById<T extends { _id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item._id === id);
}
```

### Formatting

- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

### Naming Conventions

```typescript
// Variables and functions: camelCase
const userName = 'john';
function getUserById(id: string): Promise<User> {}

// Interfaces and types: PascalCase
interface AnimalInput {}
type UserRole = 'shelter' | 'endUser';

// React components: PascalCase
function AnimalCard({ animal }: AnimalCardProps) {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_TIMEOUT_MS = 5000;

// File names: Match export (PascalCase for components, camelCase for utils)
// AnimalCard.tsx, userService.ts, types.ts
```

---

## React Components

### Component Structure

```typescript
// 1. Imports (external, then internal, then types)
import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Animal } from '@/types';

// 2. Interface definition
interface AnimalCardProps {
  animal: Animal;
  onSelect?: (animal: Animal) => void;
  className?: string;
}

// 3. Component definition (named export)
export function AnimalCard({
  animal,
  onSelect,
  className,
}: AnimalCardProps) {
  // 4. Hooks (state, queries, effects)
  const [isExpanded, setIsExpanded] = useState(false);

  // 5. Event handlers
  const handleClick = useCallback(() => {
    setIsExpanded(prev => !prev);
    onSelect?.(animal);
  }, [animal, onSelect]);

  // 6. Render
  return (
    <div className={cn('animal-card', className)} onClick={handleClick}>
      <h3>{animal.name}</h3>
      {isExpanded && <p>{animal.description}</p>}
    </div>
  );
}
```

### Component Best Practices

- One component per file
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and small (<200 lines)
- Use `cn()` utility for conditional Tailwind classes
- Define prop interfaces above the component
- Use named exports (not default exports)

---

## GraphQL

### Query/Mutation Naming

```graphql
# Queries: noun or get + noun
query Animals { ... }
query GetAnimalById($id: ID!) { ... }

# Mutations: verb + noun
mutation CreateAnimal($input: AnimalInput!) { ... }
mutation UpdateAnimalStatus($id: ID!, $status: String!) { ... }
mutation DeleteAnimal($id: ID!) { ... }
```

### Client-Side Usage

```typescript
import { useQuery, useMutation } from '@apollo/client';
import { GET_ANIMALS } from '@/graphql/queries';
import { CREATE_ANIMAL } from '@/graphql/mutations';

function AnimalList() {
  const { loading, error, data } = useQuery(GET_ANIMALS);
  const [createAnimal] = useMutation(CREATE_ANIMAL, {
    refetchQueries: [{ query: GET_ANIMALS }],
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <AnimalGrid animals={data.animals} />;
}
```

### Resolver Structure (Backend)

```typescript
const resolvers = {
  Query: {
    animals: async (_: unknown, args: Record<string, unknown>, context: GraphQLContext) => {
      return Animal.find();
    },
  },
  Mutation: {
    createAnimal: async (_: unknown, { input }: { input: AnimalInput }, context: GraphQLContext) => {
      // Validate input
      // Perform operation
      // Return result
    },
  },
};
```

---

## MongoDB/Mongoose

### Schema Definition

```typescript
import mongoose, { Schema, Document } from 'mongoose';

interface IAnimal extends Document {
  name: string;
  type: string;
  age: number;
  sex: string;
  color: string;
  description: string;
  image: string;
  video: string;
  applications: mongoose.Types.ObjectId[];
}

const animalSchema = new Schema<IAnimal>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  type: {
    type: String,
    enum: ['dog', 'cat', 'other'],
    required: true,
  },
  shelter: {
    type: Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true,
  },
}, {
  timestamps: true,
});

// Add indexes for common queries
animalSchema.index({ type: 1 });
animalSchema.index({ shelter: 1 });

export const Animal = mongoose.model<IAnimal>('Animal', animalSchema);
```

---

## Error Handling

### Backend

```typescript
// GraphQL resolver error handling
const resolvers = {
  Mutation: {
    createAnimal: async (_: unknown, { input }: { input: AnimalInput }) => {
      if (!input.name) {
        throw new Error('Name is required');
      }
      try {
        const animal = new Animal(input);
        return await animal.save();
      } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
          throw new Error(`Validation failed: ${error.message}`);
        }
        throw new Error('Failed to create animal');
      }
    },
  },
};
```

### Frontend

```typescript
function AnimalList() {
  const { loading, error, data } = useQuery(GET_ANIMALS);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <AnimalGrid animals={data.animals} />;
}
```

---

## Testing

### Test Structure

```
client/src/test/
├── setup.ts              # Global test setup
├── test-utils.tsx        # Custom render with providers
├── mocks/
│   └── handlers.ts       # MSW API mock handlers
└── fixtures/
    └── {entities}.ts     # Test data factories

tests/                    # Backend tests
├── models.test.js        # Model validation tests
├── auth.test.js          # Auth service tests
├── graphql-queries.test.js
├── graphql-mutations.test.js
└── api-integration.test.js
```

### Test File Naming

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utilName.test.ts`
- Backend tests: `feature.test.js` (migrating to `.ts`)
- Integration tests: `feature.integration.test.ts`

### Test Pattern

```typescript
describe('AnimalCard', () => {
  it('renders animal name', () => {
    // Arrange
    const animal = { name: 'Max', type: 'dog', age: 3 };

    // Act
    render(<AnimalCard animal={animal} />);

    // Assert
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn();
    const animal = { name: 'Max', type: 'dog', age: 3 };

    render(<AnimalCard animal={animal} onSelect={onSelect} />);
    await userEvent.click(screen.getByText('Max'));

    expect(onSelect).toHaveBeenCalledWith(animal);
  });
});
```

### Test Requirements per Feature Type

| Feature Type | Minimum Tests Required |
|--------------|----------------------|
| New Component | 3+ tests (render, interaction, edge cases) |
| New Hook | 2+ tests (basic usage, error handling) |
| New GraphQL Query | 2+ tests (success, error) |
| New GraphQL Mutation | 3+ tests (success, validation, error) |
| New Model | 2+ tests (valid data, validation errors) |
| Bug Fix | 1+ test (regression test) |

### Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Branches | 85% |
| Functions | 85% |
| Lines | 85% |
| Statements | 85% |

### Running Tests

```bash
# Frontend
cd client
npm test              # Run all tests
npm run test:watch    # Watch mode (vitest)
npm run test:coverage # With coverage report

# Backend
npm test              # Run all tests (from root)
npm run test:coverage # With coverage report
```

---

## Git Commit Messages

Follow conventional commits:

```
feat: add animal search by location
fix: resolve shelter list pagination issue
docs: update API documentation
test: add unit tests for AnimalService
refactor: extract validation logic to utils
chore: update dependencies
style: fix formatting in AnimalCard
perf: optimize animal query with proper indexing
```

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`, `perf`, `ci`

**Scope:** Optional, use feature ID when applicable (e.g., `feat(ANI-006): add status tracking`)

---

## Code Quality Tools

### ESLint

- Frontend: `client/eslint.config.js` (flat config format)
- Runs via `npm run lint` in client directory

### Prettier

- Config: `.prettierrc` in project root
- Runs automatically on save (recommended editor setup)

### TypeScript

- Frontend: `client/tsconfig.json` (strict mode, bundler resolution)
- Backend: `tsconfig.json` (strict mode, CommonJS)
- Check via `npm run typecheck` (client) or `npx tsc --noEmit` (root)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2026 | Original | Initial coding standards |
| 2.0.0 | Jan 22, 2026 | Claude Code | Aligned with BUILD_PROMPT TypeScript standards |
