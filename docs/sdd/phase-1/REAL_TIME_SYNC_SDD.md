# Software Design Document: Real-Time Listing Sync

**Version:** 1.0.0
**Author:** Claude Code
**Created:** January 22, 2026
**Last Updated:** January 22, 2026
**Status:** Draft
**Feature IDs:** SYN-001, SYN-002, SYN-004

---

## 1. Overview

### 1.1 Purpose

Implement real-time animal listing synchronization to solve the #1 user complaint across all adoption platforms: outdated listings showing animals that are already adopted.

**Market Research Context:**
- Petfinder uses daily FTP sync creating 24-36 hour data lag
- Adopt-a-Pet uses API with 30-minute refresh cycles
- User complaints: "The site says the dogs are available, then already adopted but still on the site"
- Texas rescue reported application volume drop from 250-400/month to ~5/week after Petfinder issues

### 1.2 Goals

1. Achieve <5 minute listing sync delay (vs competitors' 30min-24hr)
2. Provide real-time availability status to adopters
3. Display "Last updated" timestamps on all listings
4. Support bidirectional sync with Petfinder and Adopt-a-Pet

### 1.3 Non-Goals

- Full shelter management software features (medical records, intake workflows)
- Replacing shelter software - we integrate with existing tools
- Real-time chat/messaging (Phase 2)

---

## 2. Background

### 2.1 Current State

The existing system has basic animal CRUD operations but no external platform synchronization. Animals are listed only on Save A Stray.

### 2.2 Problem Statement

Shelters currently must manually update multiple platforms when an animal's status changes. This leads to:
- Outdated listings frustrating adopters
- Lost adoption opportunities
- Duplicate data entry for shelter staff
- Inconsistent information across platforms

### 2.3 User Stories

**Shelter Staff:**
- As a shelter admin, I want to update an animal's status once and have it sync everywhere so I don't waste time on duplicate data entry
- As a shelter admin, I want to see sync status for each listing so I know if updates propagated successfully
- As a shelter admin, I want to receive alerts when sync fails so I can take corrective action

**Adopters:**
- As an adopter, I want to see when a listing was last updated so I know if the information is current
- As an adopter, I want confidence that "Available" animals are actually available
- As an adopter, I want to filter out stale listings

---

## 3. Technical Design

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SAVE A STRAY                                 │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ Animal CRUD  │───▶│ Event Queue  │───▶│ Sync Service         │  │
│  │ (GraphQL)    │    │ (Bull/Redis) │    │ - Petfinder Adapter  │  │
│  └──────────────┘    └──────────────┘    │ - Adopt-a-Pet Adapter│  │
│                             │            └──────────┬─────────────┘  │
│                             │                       │                │
│                             ▼                       ▼                │
│                    ┌──────────────┐       ┌──────────────────────┐  │
│                    │ Sync Status  │       │ External Platforms   │  │
│                    │ Tracking     │       │ - Petfinder          │  │
│                    └──────────────┘       │ - Adopt-a-Pet        │  │
│                                           │ - RescueGroups       │  │
│                                           └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 GraphQL Schema Changes

```graphql
# Sync status enum
enum SyncStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  FAILED
  NOT_CONFIGURED
}

# Sync record for external platforms
type ExternalSync {
  platform: String!          # "petfinder" | "adoptapet" | "rescuegroups"
  externalId: String         # ID on external platform
  status: SyncStatus!
  lastSyncedAt: DateTime
  lastSyncError: String
  enabled: Boolean!
}

# Extend Animal type
extend type Animal {
  externalSyncs: [ExternalSync!]!
  lastModified: DateTime!
  availabilityConfirmedAt: DateTime  # When shelter last confirmed availability
}

# Extend Shelter type
extend type Shelter {
  syncConfigurations: [SyncConfiguration!]!
}

# Sync configuration per platform
type SyncConfiguration {
  platform: String!
  enabled: Boolean!
  apiKey: String            # Encrypted, not returned in queries
  organizationId: String    # Platform-specific org ID
  lastFullSync: DateTime
  syncFrequency: Int        # Minutes between full syncs
}

# New queries
extend type Query {
  syncStatus(animalId: ID!): [ExternalSync!]!
  shelterSyncHealth(shelterId: ID!): SyncHealthReport!
}

type SyncHealthReport {
  totalAnimals: Int!
  syncedToPetfinder: Int!
  syncedToAdoptapet: Int!
  failedSyncs: Int!
  lastSyncRun: DateTime
  pendingSyncs: Int!
}

# New mutations
extend type Mutation {
  configurePlatformSync(
    shelterId: ID!
    platform: String!
    enabled: Boolean!
    apiKey: String
    organizationId: String
  ): SyncConfiguration!

  triggerManualSync(animalId: ID!, platform: String!): ExternalSync!

  triggerFullSync(shelterId: ID!): SyncHealthReport!

  confirmAnimalAvailability(animalId: ID!): Animal!
}

# Subscriptions for real-time updates
extend type Subscription {
  syncStatusChanged(shelterId: ID!): ExternalSync!
}
```

### 3.3 MongoDB Models

```typescript
// ExternalSync subdocument schema
const externalSyncSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['petfinder', 'adoptapet', 'rescuegroups']
  },
  externalId: String,
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'NOT_CONFIGURED'],
    default: 'NOT_CONFIGURED'
  },
  lastSyncedAt: Date,
  lastSyncError: String,
  enabled: { type: Boolean, default: false }
});

// Add to Animal model
const animalSchema = new mongoose.Schema({
  // ... existing fields
  externalSyncs: [externalSyncSchema],
  lastModified: { type: Date, default: Date.now },
  availabilityConfirmedAt: Date
}, { timestamps: true });

// Create index for efficient sync queries
animalSchema.index({ 'externalSyncs.status': 1, 'externalSyncs.platform': 1 });
animalSchema.index({ shelterId: 1, status: 1 });

// SyncConfiguration schema
const syncConfigurationSchema = new mongoose.Schema({
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
  platform: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  apiKeyEncrypted: String,  // AES-256 encrypted
  organizationId: String,
  lastFullSync: Date,
  syncFrequency: { type: Number, default: 5 }  // 5 minutes default
}, { timestamps: true });

// Compound unique index
syncConfigurationSchema.index({ shelterId: 1, platform: 1 }, { unique: true });
```

### 3.4 Sync Service Architecture

```typescript
// services/sync/SyncService.ts
interface SyncAdapter {
  platform: string;
  createListing(animal: Animal, config: SyncConfiguration): Promise<string>;
  updateListing(animal: Animal, config: SyncConfiguration): Promise<void>;
  deleteListing(externalId: string, config: SyncConfiguration): Promise<void>;
  getListingStatus(externalId: string, config: SyncConfiguration): Promise<ListingStatus>;
}

class SyncService {
  private adapters: Map<string, SyncAdapter>;
  private queue: Bull.Queue;

  constructor() {
    this.adapters = new Map([
      ['petfinder', new PetfinderAdapter()],
      ['adoptapet', new AdoptAPetAdapter()],
      ['rescuegroups', new RescueGroupsAdapter()]
    ]);

    this.queue = new Bull('animal-sync', {
      redis: process.env.REDIS_URL,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      }
    });
  }

  async queueSync(animalId: string, action: 'create' | 'update' | 'delete') {
    await this.queue.add('sync', { animalId, action }, {
      priority: action === 'delete' ? 1 : 2  // Deletes are higher priority
    });
  }

  async processSync(job: Bull.Job) {
    const { animalId, action } = job.data;
    const animal = await Animal.findById(animalId).populate('shelter');

    if (!animal) return;

    const configs = await SyncConfiguration.find({
      shelterId: animal.shelterId,
      enabled: true
    });

    for (const config of configs) {
      const adapter = this.adapters.get(config.platform);
      if (!adapter) continue;

      try {
        await this.executeSyncAction(adapter, animal, config, action);
        await this.updateSyncStatus(animalId, config.platform, 'SUCCESS');
      } catch (error) {
        await this.updateSyncStatus(animalId, config.platform, 'FAILED', error.message);
        throw error;  // Retry via Bull
      }
    }
  }
}
```

### 3.5 Platform Adapters

**Petfinder Adapter:**
```typescript
// services/sync/adapters/PetfinderAdapter.ts
class PetfinderAdapter implements SyncAdapter {
  platform = 'petfinder';

  // Note: Petfinder API was deprecated Dec 2025
  // This uses FTP-based sync as fallback
  // Monitor for new API availability

  async createListing(animal: Animal, config: SyncConfiguration): Promise<string> {
    // Transform to Petfinder format
    const petfinderData = this.transformToPetfinderFormat(animal);

    // Upload via FTP (legacy) or API (if available)
    if (this.hasAPIAccess(config)) {
      return await this.createViaAPI(petfinderData, config);
    } else {
      return await this.createViaFTP(petfinderData, config);
    }
  }

  private transformToPetfinderFormat(animal: Animal): PetfinderAnimal {
    return {
      type: this.mapSpecies(animal.type),
      breeds: { primary: animal.breed },
      age: this.mapAge(animal.age),
      gender: animal.sex,
      size: animal.size,
      name: animal.name,
      description: animal.description,
      photos: animal.images.map(img => ({ medium: img })),
      status: animal.status === 'available' ? 'adoptable' : 'adopted',
      // ... additional mappings
    };
  }
}
```

**Adopt-a-Pet Adapter:**
```typescript
// services/sync/adapters/AdoptAPetAdapter.ts
class AdoptAPetAdapter implements SyncAdapter {
  platform = 'adoptapet';
  private apiBase = 'https://api.adoptapet.com/v1';

  async createListing(animal: Animal, config: SyncConfiguration): Promise<string> {
    const response = await fetch(`${this.apiBase}/listings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.decryptApiKey(config.apiKeyEncrypted)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.transformToAdoptAPetFormat(animal))
    });

    if (!response.ok) {
      throw new Error(`Adopt-a-Pet API error: ${response.status}`);
    }

    const data = await response.json();
    return data.listingId;
  }
}
```

### 3.6 Frontend Components

| Component | Location | Description |
|-----------|----------|-------------|
| `SyncStatusBadge` | `client/src/components/ui/SyncStatusBadge.tsx` | Shows sync status with colored indicator |
| `SyncConfigurationPanel` | `client/src/components/shelter/SyncConfigurationPanel.tsx` | Platform API key configuration |
| `SyncHealthDashboard` | `client/src/components/shelter/SyncHealthDashboard.tsx` | Overview of sync status for all animals |
| `LastUpdatedIndicator` | `client/src/components/animal/LastUpdatedIndicator.tsx` | Shows freshness timestamp |
| `ManualSyncButton` | `client/src/components/shelter/ManualSyncButton.tsx` | Trigger manual sync |

### 3.7 Event-Driven Architecture

```typescript
// Animal status change triggers sync
animalSchema.post('save', async function(doc) {
  const relevantChanges = ['status', 'name', 'description', 'images', 'sex', 'age'];
  const hasRelevantChange = relevantChanges.some(
    field => doc.isModified(field)
  );

  if (hasRelevantChange) {
    await syncService.queueSync(doc._id, doc.isNew ? 'create' : 'update');
  }
});

animalSchema.post('remove', async function(doc) {
  await syncService.queueSync(doc._id, 'delete');
});
```

---

## 4. Implementation Plan

### 4.1 Phases

**Phase 1a: Infrastructure (3-5 days)**
1. Set up Redis for Bull queue
2. Implement SyncService base class
3. Create database schemas and indexes
4. Add lastModified timestamp tracking

**Phase 1b: Petfinder Integration (5-7 days)**
1. Implement PetfinderAdapter
2. FTP upload capability (legacy fallback)
3. Status polling for confirmation
4. Error handling and retry logic

**Phase 1c: Adopt-a-Pet Integration (3-5 days)**
1. Implement AdoptAPetAdapter
2. API authentication
3. Bidirectional status sync

**Phase 1d: Dashboard & UI (3-5 days)**
1. SyncConfigurationPanel
2. SyncHealthDashboard
3. LastUpdatedIndicator on animal cards
4. Manual sync controls

### 4.2 Dependencies

**External:**
- Redis instance (Render Redis or similar)
- Petfinder organization account and API credentials
- Adopt-a-Pet partner API access

**Internal:**
- Animal model updates
- Shelter model updates
- Environment variable management

---

## 5. Testing Strategy

### 5.1 Unit Tests

```typescript
describe('PetfinderAdapter', () => {
  it('transforms animal data to Petfinder format', () => {
    const animal = createMockAnimal();
    const result = adapter.transformToPetfinderFormat(animal);
    expect(result.type).toBe('Dog');
    expect(result.status).toBe('adoptable');
  });

  it('maps age categories correctly', () => {
    expect(adapter.mapAge(2)).toBe('Adult');
    expect(adapter.mapAge(0.5)).toBe('Baby');
  });
});

describe('SyncService', () => {
  it('queues sync job on animal update', async () => {
    const animal = await Animal.create(mockAnimal);
    animal.status = 'adopted';
    await animal.save();

    expect(queue.add).toHaveBeenCalledWith('sync', {
      animalId: animal._id,
      action: 'update'
    });
  });
});
```

### 5.2 Integration Tests

```typescript
describe('Sync Integration', () => {
  it('syncs animal to Petfinder successfully', async () => {
    const shelter = await createShelterWithPetfinderConfig();
    const animal = await createAnimal(shelter._id);

    await syncService.processSync({ data: { animalId: animal._id, action: 'create' }});

    const updated = await Animal.findById(animal._id);
    expect(updated.externalSyncs[0].status).toBe('SUCCESS');
    expect(updated.externalSyncs[0].externalId).toBeDefined();
  });

  it('handles Petfinder API errors gracefully', async () => {
    mockPetfinderAPI.mockRejectedValue(new Error('API rate limit'));

    await syncService.processSync({ data: { animalId: animal._id, action: 'create' }});

    const updated = await Animal.findById(animal._id);
    expect(updated.externalSyncs[0].status).toBe('FAILED');
    expect(updated.externalSyncs[0].lastSyncError).toContain('rate limit');
  });
});
```

### 5.3 E2E Tests

- Shelter configures Petfinder sync → animal created → verify appears on Petfinder
- Animal status changed to adopted → verify removed from Petfinder
- Network failure → verify retry → verify eventual success

---

## 6. Security Considerations

### 6.1 Authentication Requirements

- Only shelter admins can configure sync settings
- API keys encrypted at rest using AES-256
- API keys never returned in GraphQL responses

### 6.2 Authorization Rules

```typescript
// Middleware for sync configuration
const canConfigureSync = async (shelterId: string, userId: string) => {
  const shelter = await Shelter.findById(shelterId);
  return shelter.users.includes(userId);
};
```

### 6.3 Data Validation

- Validate platform names against whitelist
- Sanitize organization IDs
- Rate limit sync trigger mutations

---

## 7. Performance Considerations

### 7.1 Expected Load

- Average shelter: 50-200 animals
- Status changes: ~10-20/day per shelter
- Target: Handle 1000 concurrent syncs

### 7.2 Caching Strategy

- Cache sync configurations (5 min TTL)
- Cache external platform rate limits
- Debounce rapid successive updates (5 sec window)

### 7.3 Database Indexing

```javascript
// Indexes for efficient sync queries
db.animals.createIndex({ "externalSyncs.status": 1, "externalSyncs.platform": 1 });
db.animals.createIndex({ shelterId: 1, status: 1 });
db.animals.createIndex({ lastModified: 1 });
db.syncconfigurations.createIndex({ shelterId: 1, platform: 1 }, { unique: true });
```

---

## 8. Rollout Plan

### 8.1 Feature Flags

```typescript
const FEATURE_FLAGS = {
  SYNC_PETFINDER: process.env.FF_SYNC_PETFINDER === 'true',
  SYNC_ADOPTAPET: process.env.FF_SYNC_ADOPTAPET === 'true',
  SYNC_RESCUEGROUPS: process.env.FF_SYNC_RESCUEGROUPS === 'true'
};
```

### 8.2 Gradual Rollout

1. **Alpha (Week 1):** Internal testing with mock APIs
2. **Beta (Week 2-3):** 5 pilot shelters with real API access
3. **Limited GA (Week 4):** 50 shelters, monitor error rates
4. **Full GA (Week 5+):** All shelters

### 8.3 Rollback Plan

- Feature flags allow instant disable
- Queue can be paused without data loss
- Manual sync available as fallback

---

## 9. Monitoring & Alerts

### 9.1 Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Sync success rate | <95% | PagerDuty |
| Sync latency (p95) | >60s | Slack |
| Queue depth | >1000 | Slack |
| Failed syncs (24hr) | >100 | Email |

### 9.2 Logging

```typescript
// Structured logging for sync operations
logger.info('sync_completed', {
  animalId: animal._id,
  platform: 'petfinder',
  duration: endTime - startTime,
  action: 'update'
});

logger.error('sync_failed', {
  animalId: animal._id,
  platform: 'petfinder',
  error: error.message,
  attempt: job.attemptsMade
});
```

---

## 10. Open Questions

- [ ] Petfinder API status post-Dec 2025 deprecation - need to verify current access options
- [ ] Adopt-a-Pet partner API access requirements - application process unclear
- [ ] RescueGroups API rate limits - documentation mentions caching but no specifics
- [ ] Redis hosting decision - Render Redis vs external service

---

## 11. References

- [Petfinder API Documentation](https://www.petfinder.com/developers/v2/docs/) (Deprecated Dec 2025)
- [Adopt-a-Pet Partner Portal](https://www.adoptapet.com/shelter-info)
- [RescueGroups API](https://rescuegroups.org/services/api/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- COMPILED_RESEARCH_P.md - Competitor sync capabilities analysis
- COMPILED_RESEARCH_NP.md - Platform integration requirements

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 22, 2026 | Claude Code | Initial draft |
