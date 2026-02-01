# Demo Mode Documentation

## Overview

Demo Mode allows users to explore the Save-a-Stray platform without creating an account or connecting to the backend. When enabled, users can select from different role-based experiences (Adopter, Shelter Staff, Shelter Admin) and interact with realistic mock data.

This feature is useful for:
- Product demonstrations and showcases
- User onboarding and feature discovery
- Development and testing without backend dependencies
- Trade shows and presentations

## Architecture Flow

```
+------------------+     +-------------------+     +--------------------+
|  Environment     |     |   Auth Pages      |     |   Demo Experience  |
|  VITE_DEMO_MODE  |---->|   (Login/Register)|---->|   Pages            |
|  = "true"        |     |                   |     |                    |
+------------------+     +-------------------+     +--------------------+
        |                        |                         |
        |                        v                         v
        |               +-------------------+     +--------------------+
        |               | DemoRoleSelector  |     | DemoAdopterExp.    |
        |               | Component         |     | DemoShelterExp.    |
        |               +-------------------+     +--------------------+
        |                        |                         |
        v                        v                         v
+------------------+     +-------------------+     +--------------------+
|  config/env.ts   |     |  DemoContext      |<----|   Demo Data        |
|  isDemoMode()    |---->|  (React Context)  |     |   (demoData.ts)    |
+------------------+     +-------------------+     +--------------------+
                                |
                                v
                         +-------------------+
                         |  Demo Users       |
                         |  (demoUsers.ts)   |
                         +-------------------+
```

## File Structure

```
client/src/
├── config/
│   └── env.ts                    # Environment configuration utilities
├── demo/
│   ├── DemoContext.tsx           # React Context for demo state management
│   ├── demoData.ts               # Mock data (animals, applications, etc.)
│   ├── demoUsers.ts              # Demo user definitions by role
│   ├── DemoLanding.tsx           # Demo mode landing page
│   ├── DemoRoleSelector.tsx      # Role selection component for auth pages
│   ├── DemoAdopterExperience.tsx # Adopter demo experience page
│   └── DemoShelterExperience.tsx # Shelter staff/admin demo experience page
└── components/
    ├── App.tsx                   # Routes include /demo/* paths
    ├── Login.tsx                 # Includes DemoRoleSelector when demo mode enabled
    └── Register.tsx              # Includes DemoRoleSelector when demo mode enabled
```

## How to Enable/Disable

### Development (Local)

1. Create a `.env.local` file in the `client/` directory:

```bash
# Enable demo mode
VITE_DEMO_MODE=true

# Disable demo mode (default)
VITE_DEMO_MODE=false
```

2. Restart the Vite dev server for changes to take effect.

### Production (Render)

Demo mode is enabled in `render.yaml`:

```yaml
services:
  - type: web
    name: save-a-stray-site
    runtime: static
    envVars:
      - key: VITE_DEMO_MODE
        value: "true"  # Set to "false" to disable
```

To disable in production:
1. Go to Render Dashboard > save-a-stray-site > Environment
2. Change `VITE_DEMO_MODE` from `true` to `false`
3. Trigger a new deploy

## Demo Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Adopter** | Simulates a potential pet adopter | Browse pets, view profiles, submit applications |
| **Shelter Staff** | Simulates a shelter employee | Manage animals, review applications, update statuses |
| **Shelter Admin** | Simulates a shelter administrator | Full access plus analytics, donations, staff management |

## Demo Data

The demo includes pre-populated data for a fictional shelter called "Sunny Paws Rescue":

- **8 Animals**: Mix of dogs and cats with various statuses
- **4 Applications**: Different stages (submitted, under review, approved, rejected)
- **4 Donations**: Sample donation history
- **3 Events**: Upcoming shelter events
- **2 Fosters**: Active foster arrangements
- **2 Volunteers**: Active volunteer profiles
- **Behavior Notes, Vaccinations, Weight Records**: Medical and behavioral data

All demo data is defined in `client/src/demo/demoData.ts` and can be customized as needed.

## How to Add New Demo Features

### Adding a New Demo User Role

1. Edit `client/src/demo/demoUsers.ts`:

```typescript
// Add to DemoRole type
export type DemoRole = 'adopter' | 'shelter_staff' | 'shelter_admin' | 'new_role';

// Add user definition
export const demoUsers: Record<DemoRole, DemoUser> = {
  // ... existing users
  new_role: {
    _id: 'demo-user-newrole',
    name: 'New Role User',
    email: 'newrole@example.com',
    userRole: 'endUser', // or 'shelter'
    token: 'demo-token-newrole',
    loggedIn: true,
    demoRole: 'new_role',
    displayName: 'New Role Name',
    description: 'Description of what this role can do.',
  },
};

// Add role description
export const roleDescriptions: Record<DemoRole, { title: string; features: string[] }> = {
  // ... existing descriptions
  new_role: {
    title: 'New Role Title',
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
};
```

2. Update `DemoRoleSelector.tsx` to add icon and color for the new role.

### Adding New Demo Data

Edit `client/src/demo/demoData.ts` to add or modify:

```typescript
// Add a new animal
export const demoAnimals: Animal[] = [
  // ... existing animals
  {
    _id: 'demo-animal-new',
    name: 'NewPet',
    type: 'Dogs',
    // ... other fields
  },
];
```

### Adding a New Demo Experience Page

1. Create a new component in `client/src/demo/`:

```typescript
// client/src/demo/DemoNewExperience.tsx
import React from 'react';
import { useDemo } from './DemoContext';

const DemoNewExperience: React.FC = () => {
  const { animals, currentDemoUser } = useDemo();
  // ... component implementation
};

export default DemoNewExperience;
```

2. Add route in `client/src/components/App.tsx`:

```typescript
import DemoNewExperience from '../demo/DemoNewExperience';

// In Routes:
<Route path="/demo/new" element={<DemoNewExperience />} />
```

## API Reference

### `isDemoMode()`

```typescript
import { isDemoMode } from '../config/env';

if (isDemoMode()) {
  // Demo mode is enabled
}
```

### `useDemo()` Hook

```typescript
import { useDemo } from '../demo/DemoContext';

const {
  isDemoModeEnabled,    // boolean - is VITE_DEMO_MODE=true
  isDemo,               // boolean - is user currently in demo mode
  currentDemoUser,      // DemoUser | null - current demo user
  demoRole,             // 'adopter' | 'shelter' - simplified role
  animals,              // Animal[] - demo animal data
  applications,         // Application[] - demo applications
  // ... other data and actions
  selectDemoUser,       // (role: DemoRole) => void
  exitDemoMode,         // () => void
  updateAnimalStatus,   // (id, status) => void
  updateApplicationStatus, // (id, status) => void
} = useDemo();
```

## Testing

Demo mode can be tested by:

1. Setting `VITE_DEMO_MODE=true` in `.env.local`
2. Navigating to `/login` or `/register`
3. Clicking "Try Demo Mode" button
4. Selecting a role from the role selector
5. Exploring the demo experience

Direct URL access:
- `/demo` - Demo landing page (role selection)
- `/demo/adopter` - Adopter experience
- `/demo/shelter` - Shelter experience

## Troubleshooting

### Demo mode not appearing

- Verify `VITE_DEMO_MODE=true` is set (exact string "true")
- Restart the Vite dev server
- Check browser console for any errors

### Demo data not updating

- Demo data is stored in React state and resets on page refresh
- Changes are not persisted to any backend

### Role selector not showing

- Ensure you're on `/login` or `/register` pages
- Check that `isDemoMode()` returns `true`
