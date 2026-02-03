# Save A Stray - Architecture

**Version:** 2.1.0
**Last Updated:** February 3, 2026

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                                 │
│                         Production: save-a-stray-site.onrender.com            │
│                         Port: 3000 (dev)                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐ │
│  │    Marketing     │  │   Auth System    │  │      Dashboard              │ │
│  │   Splash Page    │  │   OAuth (FB/G)   │  │  - Shelter Management       │ │
│  │   Animal Search  │  │   JWT Auth       │  │  - Animal CRUD              │ │
│  │   Privacy/ToS    │  │                  │  │  - Application Tracking     │ │
│  └──────────────────┘  └──────────────────┘  └─────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ GraphQL API
                                │
    ┌───────────────────────────▼──────────────────────────────────────────┐
    │    EXPRESS + GRAPHQL SERVER                                           │
    │    Production: save-a-stray-api.onrender.com                         │
    │    Port: 10000 (prod) / 5000 (dev)                                   │
    │                                                                      │
    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
    │  │   GraphQL API   │  │   Auth Service  │  │   Business Logic    │  │
    │  │   - Queries     │  │   - Register    │  │   - Animal mgmt     │  │
    │  │   - Mutations   │  │   - Login       │  │   - Shelter mgmt    │  │
    │  │   - Types       │  │   - OAuth       │  │   - Applications    │  │
    │  └─────────────────┘  │   - JWT tokens  │  └─────────────────────┘  │
    │                       └─────────────────┘                            │
    └───────────────────────────┬──────────────────────────────────────────┘
                                │
                       ┌────────▼──────────┐
                       │    MongoDB Atlas   │
                       │    Database        │
                       │                    │
                       │  Collections:      │
                       │  - users           │
                       │  - shelters        │
                       │  - animals         │
                       │  - applications    │
                       │  - successstories  │
                       └────────────────────┘
```

---

## Technology Stack

### Frontend (client/)

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19.1.1 |
| Build Tool | Vite | 7.1.4 |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | 4.1.13 |
| State/Data | Apollo Client | 4.0.4 |
| Routing | React Router | 7.9.1 |
| UI Components | Custom Shadcn-style + Radix | - |
| Testing | Vitest + Testing Library | 3.2.4 |

### Backend (server/)

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | 20+ |
| Framework | Express | 4.21.2 |
| API | GraphQL via Apollo Server | 16.11.0 / 4.x |
| Database | MongoDB via Mongoose | 8.9.5 |
| Auth | Passport.js + JWT + bcryptjs | 0.7.0 |
| OAuth | Facebook, Google | - |
| Validation | validator.js | 13.12.0 |

### DevOps

| Category | Technology |
|----------|-----------|
| Deployment | Render.com (IaC via render.yaml) |
| CI/CD | GitHub Actions |
| Code Quality | ESLint, Prettier |
| Code Review | CodeRabbit (automated PR reviews) |
| Static Analysis | SonarCloud |
| Coverage | Codecov (85% target) |

---

## Directory Structure

```
save-a-stray/
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
├── client/                           # React + Vite Frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── App.tsx               # Main router
│   │   │   ├── Nav.tsx               # Navigation
│   │   │   ├── Login.tsx             # Login form
│   │   │   ├── Register.tsx          # Registration form
│   │   │   ├── RegisterShelter.tsx   # Shelter registration
│   │   │   ├── Shelter.tsx           # Shelter creation
│   │   │   ├── Animal.tsx            # Animal creation
│   │   │   ├── AnimalShow.tsx        # Animal details
│   │   │   ├── AnimalFeedItem.tsx    # Animal card
│   │   │   ├── Application.tsx       # Adoption application
│   │   │   ├── UserLanding.tsx       # User dashboard
│   │   │   ├── ShelterLanding.tsx    # Shelter dashboard
│   │   │   ├── Landing.tsx           # Browse animals
│   │   │   ├── Splash.tsx            # Home page
│   │   │   ├── FacebookLogin.tsx     # Facebook OAuth component
│   │   │   ├── SuccessStories.tsx    # Adoption success stories
│   │   │   ├── Privacy.tsx           # Privacy policy page
│   │   │   ├── TermsOfService.tsx    # Terms of service page
│   │   │   ├── slug.tsx              # URL slug utility component
│   │   │   ├── css/                  # Component stylesheets
│   │   │   └── ui/                   # Shadcn-style components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── input.tsx
│   │   │       └── label.tsx
│   │   ├── graphql/                  # Apollo queries/mutations
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   ├── util/                     # Utilities
│   │   │   ├── route_util.tsx
│   │   │   ├── protected_route.tsx
│   │   │   └── withRouter.tsx
│   │   ├── types/                    # TypeScript types
│   │   │   └── index.ts
│   │   ├── test/                     # Component tests
│   │   ├── lib/                      # Helper libraries
│   │   │   └── utils.ts             # cn() utility
│   │   ├── main.jsx                  # Entry point (Apollo setup)
│   │   └── index.css                 # Tailwind styles
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── server/                           # Express + GraphQL Backend
│   ├── models/                       # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Animal.ts
│   │   ├── Shelter.ts
│   │   ├── Application.ts
│   │   ├── SuccessStory.ts
│   │   └── index.ts
│   ├── schema/                       # GraphQL schema
│   │   ├── schema.ts
│   │   ├── mutations.ts
│   │   └── types/
│   │       ├── root_query_type.ts
│   │       ├── user_type.ts
│   │       ├── animal_type.ts
│   │       ├── shelter_type.ts
│   │       ├── application_type.ts
│   │       └── success_story_type.ts
│   ├── graphql/                      # GraphQL context/loaders/pubsub
│   │   ├── context.ts
│   │   ├── loaders.ts
│   │   └── pubsub.ts
│   ├── services/                     # Business logic
│   │   └── auth.ts
│   ├── validation/                   # Input validation
│   │   ├── register.ts
│   │   ├── login.ts
│   │   └── valid-text.ts
│   ├── server.ts                     # Express app
│   └── seeds.js                      # Database seeding
│
├── tests/                            # Backend tests
│   ├── models.test.js
│   ├── auth.test.js
│   ├── validation.test.js
│   ├── graphql-queries.test.js
│   ├── graphql-mutations.test.js
│   └── api-integration.test.js
│
├── shared/                           # Shared types
│   └── types/
│       └── index.ts
│
├── config/                           # Configuration
│   ├── keys.ts
│   ├── keys_prod.ts
│   └── google_signin.json
│
├── docs/                             # Documentation
│   ├── INDEX.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── FEATURE_BACKLOG.md
│   ├── CODING_STANDARDS.md
│   ├── checklists/                   # Quality checklists
│   │   ├── CODE_REVIEW_CHECKLIST.md
│   │   ├── PRE_COMMIT_CHECKLIST.md
│   │   └── PRE_MR_CHECKLIST.md
│   ├── research/                     # Research documentation
│   │   └── COMPETITIVE_RESEARCH_PROMPT.md
│   └── sdd/
│       ├── FEATURE_SDD_TEMPLATE.md
│       ├── MODERNIZATION_SDD.md
│       └── phase-1/
│
├── roadmap/                          # Work tracking
│   ├── WORK_STATUS.md
│   └── AGENT_LOGS/
│
├── index.ts                          # Main entry point
├── package.json                      # Root dependencies
├── tsconfig.json                     # TypeScript config
├── render.yaml                       # Render deployment
├── jest.config.js                    # Test configuration
├── codecov.yml                       # Coverage config
├── .prettierrc                       # Prettier config
├── .coderabbit.yaml                  # CodeRabbit config
└── sonar-project.properties          # SonarCloud config
```

**Note:** The codebase is in a TypeScript migration state. Some server files have both `.ts` and legacy `.js` versions. The `.ts` files are the source of truth; `.js` files will be removed as migration completes.

---

## Database Models

### User

```typescript
{
  _id: ObjectId,
  name: string,              // Required
  email: string,             // Required, unique
  userRole: 'shelter' | 'endUser',  // Required
  paymentEmail?: string,     // For shelter payment
  password: string,          // Required, 8-32 chars, hashed
  date: Date,                // Auto: creation date
  fbookId?: string,          // Facebook OAuth ID
  shelterId?: ObjectId,      // Reference to shelter
  favorites: ObjectId[],     // References to favorited animals
  varId?: ObjectId           // Variable ID
}
```

### Animal

```typescript
{
  _id: ObjectId,
  name: string,              // Required
  type: string,              // Required: 'dog', 'cat', etc.
  breed: string,             // Default: '' (optional breed tag)
  age: number,               // Required
  sex: string,               // Required
  color: string,             // Required
  description: string,       // Required
  image: string,             // Required: primary image URL
  images: string[],          // Additional image URLs (default: [])
  video: string,             // Required: URL
  status: 'available' | 'pending' | 'adopted',  // Default: 'available'
  applications: ObjectId[]   // References to applications
}
```

### Shelter

```typescript
{
  _id: ObjectId,
  name: string,              // Required
  location: string,          // Required
  users: ObjectId[],         // References to users (staff)
  paymentEmail: string,      // Required: for adoption fees
  animals: ObjectId[]        // References to animals
}
```

### Application

```typescript
{
  _id: ObjectId,
  animalId: string,          // Required
  userId: string,            // Required
  applicationData: string,   // Required: JSON stringified form data
  status: 'submitted' | 'under_review' | 'approved' | 'rejected',  // Default: 'submitted'
  submittedAt: Date          // Default: Date.now
}
```

### SuccessStory

```typescript
{
  _id: ObjectId,
  userId: string,            // Required: author's user ID
  animalName: string,        // Required: adopted pet's name
  animalType: string,        // Required: 'Dog', 'Cat', etc.
  title: string,             // Required: story title
  story: string,             // Required: full story text
  image: string,             // Optional photo URL (default: '')
  createdAt: Date            // Default: Date.now
}
```

---

## GraphQL API

**Subscriptions:** WebSocket subscriptions are served via `graphql-ws` on `/graphql`.

### Queries

| Query | Parameters | Returns |
|-------|------------|---------|
| `users` | - | All users |
| `user` | `_id: ID!` | Single user (includes name, email, userRole, shelter) |
| `animals` | - | All animals |
| `findAnimals` | `type, breed, sex, color, name, status, minAge, maxAge, limit, offset` | Filtered/paginated animals |
| `animal` | `_id: ID!` | Single animal |
| `applications` | - | All applications |
| `shelters` | - | All shelters |
| `shelter` | `_id: ID` | Single shelter |
| `userFavorites` | `userId: ID!` | User's favorited animals |
| `shelterApplications` | `shelterId: ID!` | Applications for shelter's animals |
| `userApplications` | `userId: ID!` | User's submitted applications |
| `successStories` | - | All success stories (sorted by newest) |

### Mutations

| Mutation | Purpose |
|----------|---------|
| `register` | Create user account (supports inline shelter creation via shelterName/shelterLocation/shelterPaymentEmail) |
| `login` | Authenticate user |
| `logout` | Log out user |
| `verifyUser` | Verify JWT token |
| `userId` | Get user ID from token |
| `newAnimal` | Create animal listing |
| `deleteAnimal` | Remove animal |
| `updateAnimal` | Edit animal |
| `updateAnimalStatus` | Update animal status (available/pending/adopted) |
| `newApplication` | Submit adoption application (sets status=submitted, submittedAt) |
| `deleteApplication` | Cancel application |
| `editApplication` | Update application data |
| `updateApplicationStatus` | Update application status (submitted/under_review/approved/rejected) |
| `addFavorite` | Add animal to user's favorites |
| `removeFavorite` | Remove animal from user's favorites |
| `newShelter` | Create shelter |
| `deleteShelter` | Remove shelter |
| `editShelter` | Update shelter |
| `createSuccessStory` | Create adoption success story (userId, animalName, animalType, title, story, image) |

---

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │────▶│  Server  │────▶│ MongoDB  │
│           │     │          │     │          │
│ 1. Login  │     │ 2. Verify│     │ 3. Find  │
│    Form   │     │    creds │     │    User  │
│           │◀────│          │◀────│          │
│ 5. Store  │     │ 4. Sign  │     │          │
│    JWT    │     │    JWT   │     │          │
└──────────┘     └──────────┘     └──────────┘

Subsequent Requests:
- JWT sent in Authorization header
- Server verifies token via Passport.js
- Token contains user ID for database lookup
```

### OAuth Flow (Google/Facebook)

1. Client redirects to OAuth provider
2. User authorizes on provider
3. Provider redirects back with auth code
4. Server exchanges code for token
5. Server creates/finds user with provider ID
6. Server issues JWT to client

---

## Deployment Architecture

### Render.com Configuration

```yaml
# render.yaml defines infrastructure as code

Frontend (save-a-stray-site):
  Type: Static site
  Build: cd client && npm ci && npm run build
  Publish: client/build
  Features:
    - SPA routing (/* → /index.html)
    - Asset caching (1 year immutable)

Backend (save-a-stray-api):
  Type: Web service (Node.js, free tier)
  Build: NODE_ENV=development npm ci && npm run build
  Start: NODE_ENV=production npm start
  Port: 10000
  Health: /health
  Features:
    - Auto-deploy on push
    - Spins down after 15 min inactivity (free tier)
  Note: NODE_ENV is set inline in commands (not as env var)
        to prevent npm ci from skipping devDependencies
```

### Environment Variables

```bash
# Backend (set in Render dashboard, NOT in render.yaml for secrets)
PORT=10000
MONGO_URI=<MongoDB Atlas connection string>
SECRET_OR_KEY=<JWT secret (auto-generated)>
GOOG_CLIENT=<Google OAuth client ID>
GOOG_SECRET=<Google OAuth secret>
FBOOK_KEY=<Facebook App ID>
FBOOK_CLIENT=<Facebook App Secret>
CORS_ORIGIN=<Frontend URL>

# Frontend (build-time, set in Render dashboard)
VITE_API_URL=<Backend URL>

# NOTE: NODE_ENV is NOT set as an environment variable.
# It is set inline in build/start commands to avoid
# npm ci skipping TypeScript devDependencies during build.
```

---

## Future Architecture (Phase 2+)

### Planned Additions

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLANNED SERVICES                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Redis       │  │  Email Svc   │  │  Cloud Storage       │  │
│  │  (Bull Queue)│  │  (SendGrid)  │  │  (S3/Cloudinary)     │  │
│  │              │  │              │  │                      │  │
│  │  - Sync jobs │  │  - Auto-ack  │  │  - Animal photos     │  │
│  │  - Rate limit│  │  - Notifs    │  │  - Videos            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Petfinder   │  │  Adopt-a-Pet │                             │
│  │  Sync        │  │  Sync        │                             │
│  │  Adapter     │  │  Adapter     │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Animal Listing Creation

```
Shelter Staff → Dashboard → GraphQL Mutation → MongoDB → Response
                                   │
                                   ├──▶ Sync Queue (future)
                                   │        ├──▶ Petfinder
                                   │        └──▶ Adopt-a-Pet
                                   │
                                   └──▶ Search Index Update
```

### Adoption Application Flow

```
Adopter → Application Form → GraphQL Mutation → MongoDB
                                    │
                                    ├──▶ Auto-Acknowledgment Email (future)
                                    │
                                    └──▶ Shelter Dashboard Notification
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2026 | Original | Basic architecture overview |
| 2.0.0 | Jan 22, 2026 | Claude Code | Complete rewrite to match current codebase |
| 2.1.0 | Feb 3, 2026 | Codex | Updated frontend and GraphQL stack versions |

---

**Related Documents:**
- [ROADMAP.md](./ROADMAP.md) - Implementation phases
- [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) - Complete feature list
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Development guidelines
- [docs/sdd/](./sdd/) - Feature specifications
