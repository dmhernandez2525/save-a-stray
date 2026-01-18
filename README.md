# Save A Stray

A pet adoption platform that connects animal shelters with potential adopters through a unified, searchable database.

---

## Overview

Save A Stray addresses three key challenges faced by animal shelters:

- **Reach**: Provides shelters with an online presence without building their own websites
- **Cost**: No upfront costs - only a small fee on successful adoptions
- **Convenience**: One platform to search all available animals in your area

### Key Features

- **Animal Listings**: Browse adoptable pets with photos and details
- **Shelter Management**: Shelters can add and manage their animals
- **Adoption Applications**: Submit applications directly through the platform
- **Location Search**: Find animals near you
- **OAuth Authentication**: Sign in with Google or Facebook

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 16, Apollo Client |
| Backend | Node.js, Express |
| API | GraphQL with Apollo Server |
| Database | MongoDB (Mongoose ODM) |
| Auth | Passport.js (Google, Facebook OAuth) |
| Styling | SCSS |

---

## Project Structure

```
save-a-stray/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── graphql/           # Apollo queries/mutations
│   │   ├── css/               # Stylesheets
│   │   └── util/              # Utilities
├── server/                    # Express backend
│   ├── models/                # Mongoose schemas
│   ├── schema/                # GraphQL schema
│   │   ├── types/             # GraphQL type definitions
│   │   ├── mutations.js       # Mutation resolvers
│   │   └── schema.js          # Schema composition
│   └── services/              # Auth services
├── config/                    # Configuration
├── docs/                      # Documentation
└── package.json               # Dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 12.x or higher
- MongoDB (local or Atlas cluster)
- Google OAuth credentials
- Facebook OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/save-a-stray.git
cd save-a-stray

# Install dependencies
npm install

# Set up environment variables
cp config/keys_dev.example.js config/keys_dev.js
# Edit keys_dev.js with your configuration
```

### Configuration

Create `config/keys_dev.js`:
```javascript
module.exports = {
  MONGO_URI: 'mongodb+srv://your-cluster-url',
  secretOrKey: 'your-jwt-secret',
  googleClientId: 'your-google-client-id',
  googleClientSecret: 'your-google-secret',
  facebookAppId: 'your-facebook-app-id',
  facebookAppSecret: 'your-facebook-secret'
};
```

### Running the Application

```bash
# Development mode (frontend + backend)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client
```

Note: Frontend requires `NODE_OPTIONS=--openssl-legacy-provider` due to OpenSSL 3.0 compatibility.

---

## GraphQL API

### Queries

| Query | Description |
|-------|-------------|
| `animals(shelter: ID, species: String)` | List animals with optional filters |
| `animal(id: ID!)` | Get single animal by ID |
| `shelters` | List all shelters |
| `shelter(id: ID!)` | Get shelter details |
| `user(id: ID!)` | Get user profile |

### Mutations

| Mutation | Description |
|----------|-------------|
| `createApplication(animalId: ID!)` | Submit adoption application |
| `updateApplicationStatus(id: ID!, status: String!)` | Update application status |
| `registerUser(email: String!, password: String!)` | Register new user |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Index](./docs/INDEX.md) | Documentation overview |
| [Architecture](./docs/ARCHITECTURE.md) | System design and patterns |
| [Roadmap](./docs/ROADMAP.md) | Modernization backlog |
| [Coding Standards](./docs/CODING_STANDARDS.md) | Code style guidelines |

---

## Status

**Current State**: Requires modernization

This project was built in 2019-2020. It requires:
- MongoDB Atlas cluster recreation
- OAuth credential setup (Google, Facebook)
- React modernization (16 → 18)
- Apollo Client upgrade (2 → 3)
- Testing infrastructure setup

See [ROADMAP.md](./docs/ROADMAP.md) for detailed modernization plan.

---

## Original Team

- Daniel Hernandez - Backend and Frontend
- Chas Huggins - Backend and Frontend
- Tom Driscoll - Frontend and UI/UX

---

## License

MIT License
