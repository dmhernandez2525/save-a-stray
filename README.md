# Save A Stray

A pet adoption platform that connects animal shelters with potential adopters through a unified, searchable database with real-time listing sync and communication accountability.

---

## Overview

Save A Stray addresses three key challenges faced by animal shelters:

- **Reach**: Provides shelters with an online presence without building their own websites
- **Cost**: Per-adoption pricing ($2/adoption) vs monthly subscriptions
- **Communication**: Auto-acknowledgment and response tracking for every inquiry

### Key Features

- **Animal Listings**: Browse adoptable pets with photos, image galleries, video, breed tags, and status tracking
- **Shelter Dashboard**: Shelters can add, edit, and manage their animals with application management
- **Unified Registration**: Register as an adopter or shelter staff with inline shelter creation
- **Adoption Applications**: Submit and track applications with status workflow (submitted → under review → approved/rejected)
- **Favorites**: Save animals to your favorites list for quick access
- **User Profile**: View your favorites and application history
- **Search & Filters**: Find animals by type, breed, sex, color, age range, status, and name with pagination
- **Success Stories**: Adopters can share their adoption stories with photos to inspire others
- **OAuth Authentication**: Sign in with Google or Facebook
- **Real-Time Sync**: <5 min listing updates to external platforms (planned)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Apollo Client |
| Backend | Node.js 20+, Express, GraphQL (graphql-http), TypeScript |
| Database | MongoDB (Mongoose 8) |
| Auth | Passport.js (JWT, Google OAuth, Facebook OAuth) |
| Testing | Vitest (frontend), Jest (backend) |
| Deployment | Render.com (IaC via render.yaml) |
| CI/CD | GitHub Actions |
| Code Quality | ESLint, Prettier, SonarCloud, CodeRabbit |

---

## Project Structure

```
save-a-stray/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components + Shadcn UI
│   │   ├── graphql/           # Apollo queries/mutations
│   │   ├── types/             # TypeScript types
│   │   ├── util/              # Route utilities
│   │   ├── test/              # Component tests
│   │   └── lib/               # Helper libraries (cn utility)
│   └── package.json
├── server/                    # Express + GraphQL backend
│   ├── models/                # Mongoose schemas (TypeScript)
│   ├── schema/                # GraphQL schema + resolvers
│   ├── services/              # Auth service
│   └── validation/            # Input validation
├── tests/                     # Backend tests (Jest)
├── shared/                    # Shared TypeScript types
├── config/                    # Configuration
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── FEATURE_BACKLOG.md
│   └── CODING_STANDARDS.md
└── roadmap/                   # Work tracking
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas cluster)
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/dmhernandez2525/save-a-stray.git
cd save-a-stray

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### Environment Variables

Create environment variables for the backend (or use a `.env` file):

```bash
MONGO_URI=mongodb+srv://your-cluster-url
SECRET_OR_KEY=your-jwt-secret
GOOG_CLIENT=your-google-client-id
GOOG_SECRET=your-google-secret
FBOOK_KEY=your-facebook-app-id
FBOOK_CLIENT=your-facebook-secret
CORS_ORIGIN=http://localhost:3000
```

### Running the Application

```bash
# Development mode (frontend + backend concurrently)
npm run dev

# Backend only (port 5000)
npm run server:dev

# Frontend only (port 3000)
cd client && npm run dev
```

---

## GraphQL API

### Queries

| Query | Parameters | Returns |
|-------|------------|---------|
| `animals` | - | All animals |
| `findAnimals` | `type, breed, sex, color, name, status, minAge, maxAge, limit, offset` | Filtered/paginated animals |
| `animal` | `_id: ID!` | Single animal |
| `shelters` | - | All shelters |
| `shelter` | `_id: ID` | Single shelter |
| `users` | - | All users |
| `user` | `_id: ID!` | Single user |
| `userFavorites` | `userId: ID!` | User's favorited animals |
| `shelterApplications` | `shelterId: ID!` | Applications for shelter's animals |
| `userApplications` | `userId: ID!` | User's submitted applications |
| `successStories` | - | All success stories (newest first) |

### Mutations

| Mutation | Purpose |
|----------|---------|
| `register` | Create user account (optionally creates shelter with shelterName/shelterLocation/shelterPaymentEmail) |
| `login` | Authenticate user |
| `newAnimal` | Create animal listing |
| `updateAnimal` | Edit animal |
| `updateAnimalStatus` | Update animal availability status |
| `deleteAnimal` | Remove animal |
| `newApplication` | Submit adoption application |
| `updateApplicationStatus` | Update application review status |
| `addFavorite` | Add animal to user's favorites |
| `removeFavorite` | Remove animal from favorites |
| `newShelter` | Create shelter |
| `createSuccessStory` | Share an adoption success story |

---

## Testing

```bash
# Frontend tests (Vitest)
cd client
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage

# Backend tests (Jest)
npm test              # From root
npm run test:coverage # With coverage
```

**Coverage target:** 85% across branches, functions, lines, and statements.

---

## Deployment

Deployed on [Render.com](https://render.com) using infrastructure-as-code (`render.yaml`):

| Service | URL |
|---------|-----|
| Frontend | https://save-a-stray-site.onrender.com |
| Backend | https://save-a-stray-api.onrender.com |
| Health Check | https://save-a-stray-api.onrender.com/health |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Documentation Index](./docs/INDEX.md) | Full documentation overview |
| [Architecture](./docs/ARCHITECTURE.md) | System design, models, API reference |
| [Roadmap](./docs/ROADMAP.md) | 5-phase implementation plan |
| [Feature Backlog](./docs/FEATURE_BACKLOG.md) | 326 features organized by phase |
| [Coding Standards](./docs/CODING_STANDARDS.md) | TypeScript patterns and quality requirements |

---

## Contributing

1. Check `roadmap/WORK_STATUS.md` for current priorities
2. Create a feature branch: `git checkout -b feat/{feature-id}-{name}`
3. Follow the coding standards in `docs/CODING_STANDARDS.md`
4. Write tests for all new features
5. Submit a PR with conventional commit messages

---

## License

MIT License

---

## Original Team

- Daniel Hernandez
- Chas Huggins
- Tom Driscoll
