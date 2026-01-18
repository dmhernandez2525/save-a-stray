# Save A Stray - Coding Standards

**Version:** 1.0.0
**Last Updated:** January 2026

---

## General Principles

1. **Readability First**: Code should be self-documenting
2. **Consistency**: Follow established patterns in the codebase
3. **Simplicity**: Prefer simple solutions over clever ones
4. **DRY**: Don't Repeat Yourself, but avoid premature abstraction

---

## JavaScript/Node.js

### Formatting
- Use 2-space indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

### Naming Conventions
```javascript
// Variables and functions: camelCase
const userName = 'john';
function getUserById(id) {}

// Classes and components: PascalCase
class UserService {}
function AnimalCard() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Private methods: prefixed with underscore
function _validateInput() {}
```

### Functions
```javascript
// Prefer arrow functions for callbacks
animals.map((animal) => animal.name);

// Use async/await over .then() chains
async function fetchAnimals() {
  try {
    const animals = await Animal.find();
    return animals;
  } catch (error) {
    throw new Error(`Failed to fetch animals: ${error.message}`);
  }
}

// Destructure parameters when appropriate
function createAnimal({ name, type, age }) {
  // ...
}
```

---

## React Components

### Component Structure
```jsx
// 1. Imports
import React from 'react';
import { useQuery } from '@apollo/client';

// 2. Component definition
function AnimalCard({ animal }) {
  // 3. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 4. Event handlers
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  // 5. Render
  return (
    <div className="animal-card" onClick={handleClick}>
      <h3>{animal.name}</h3>
      {isExpanded && <p>{animal.description}</p>}
    </div>
  );
}

// 6. Export
export default AnimalCard;
```

### Component Best Practices
- One component per file
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and small (<200 lines)

---

## GraphQL

### Query/Mutation Naming
```graphql
# Queries: noun or get + noun
query Animals { ... }
query GetAnimalById($id: ID!) { ... }

# Mutations: verb + noun
mutation CreateAnimal { ... }
mutation UpdateAnimalStatus { ... }
mutation DeleteAnimal { ... }
```

### Resolver Structure
```javascript
const resolvers = {
  Query: {
    animals: async (_, args, context) => {
      // Validate auth if needed
      // Fetch and return data
    },
  },
  Mutation: {
    createAnimal: async (_, { input }, context) => {
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
```javascript
const animalSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true,
  },
}, {
  timestamps: true,
});

// Add indexes for common queries
animalSchema.index({ type: 1, status: 1 });
animalSchema.index({ shelter: 1 });
```

---

## Error Handling

### Backend
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// GraphQL resolver error handling
const resolvers = {
  Mutation: {
    createAnimal: async (_, { input }) => {
      if (!input.name) {
        throw new UserInputError('Name is required');
      }
      // ...
    },
  },
};
```

### Frontend
```jsx
function AnimalList() {
  const { loading, error, data } = useQuery(GET_ANIMALS);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return <AnimalGrid animals={data.animals} />;
}
```

---

## Testing

### Test File Naming
- Unit tests: `component.test.js`
- Integration tests: `feature.integration.test.js`
- Test utilities: `__tests__/utils/`

### Test Structure
```javascript
describe('AnimalCard', () => {
  it('renders animal name', () => {
    // Arrange
    const animal = { name: 'Max', type: 'dog' };

    // Act
    render(<AnimalCard animal={animal} />);

    // Assert
    expect(screen.getByText('Max')).toBeInTheDocument();
  });
});
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
```
