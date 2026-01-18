# Save a Stray - Architecture

**Version:** 1.0.0
**Last Updated:** January 2026

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   React     │  │   Apollo     │  │   OAuth (Google,    │ │
│  │   Router    │  │   Client     │  │   Facebook)         │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                │                                   │
│         └────────────────┼───────────────────────────────────┤
│                          │                                   │
│                     GraphQL API                              │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│               BACKEND (Express + GraphQL)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Schema    │  │   Resolvers  │  │    Mutations        │ │
│  │   Types     │  │              │  │                     │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────┘ │
│         │                │                                   │
└─────────┼────────────────┼───────────────────────────────────┘
          │                │
   ┌──────┴────────────────┴──────┐
   │         MongoDB              │
   └──────────────────────────────┘
```

---

## GraphQL Schema

### Types

```graphql
type Animal {
  id: ID!
  name: String!
  species: String!
  breed: String
  age: Int
  shelter: Shelter!
  photos: [String]
  status: AdoptionStatus!
}

type Shelter {
  id: ID!
  name: String!
  location: String!
  animals: [Animal]!
}

type User {
  id: ID!
  email: String!
  applications: [Application]!
}

type Application {
  id: ID!
  user: User!
  animal: Animal!
  status: ApplicationStatus!
}
```

---

## Directory Structure

```
save-a-stray/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # 20+ React components
│   │   ├── graphql/        # Apollo queries
│   │   └── css/            # Stylesheets
│   └── package.json
├── server/                 # Express + GraphQL
│   ├── models/             # Mongoose models
│   ├── schema/             # GraphQL schema
│   │   ├── types/
│   │   ├── mutations.js
│   │   └── schema.js
│   ├── services/           # Auth services
│   └── seeds.js
├── config/                 # Configuration
├── docs/                   # Documentation
└── package.json
```

---

## API Queries & Mutations

### Queries
- `animals(shelter: ID, species: String): [Animal]`
- `animal(id: ID!): Animal`
- `shelters: [Shelter]`
- `user(id: ID!): User`

### Mutations
- `createApplication(animalId: ID!): Application`
- `updateApplicationStatus(id: ID!, status: String!): Application`
- `registerUser(email: String!, password: String!): User`
