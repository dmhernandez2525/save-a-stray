# Software Design Document: Communication Accountability System

**Version:** 1.0.0
**Author:** Claude Code
**Created:** January 22, 2026
**Last Updated:** January 22, 2026
**Status:** Draft
**Feature IDs:** COM-001, COM-002, COM-003, COM-004, APP-002

---

## 1. Overview

### 1.1 Purpose

Implement a communication accountability system that addresses the #1 complaint across ALL adoption platforms globally: unanswered inquiries. This feature will be Save A Stray's primary differentiator.

**Market Research Context:**
- 80%+ of negative reviews across Petfinder, Adopt-a-Pet, and PetRescue (Australia) cite unanswered inquiries
- No platform has implemented mandatory automated acknowledgments
- No platform provides response time SLAs or accountability metrics
- Adopter quote: "Application takes a lot of effort and time. When I hit submit, there was no auto reply to confirm the application had been received."

### 1.2 Goals

1. 100% inquiry acknowledgment rate (automated within 30 seconds)
2. Provide adopters visibility into their position in the inquiry queue
3. Track and display shelter response times (like Airbnb host ratings)
4. Reduce adopter frustration through transparency
5. Help shelters manage communication workflows efficiently

### 1.3 Non-Goals

- Replacing email as primary contact method for shelters (Phase 2)
- Real-time chat/video calls
- Automated application approval/rejection decisions
- Phone call tracking

---

## 2. Background

### 2.1 Current State

The existing application system stores applications but provides no:
- Confirmation to adopters
- Status visibility
- Response time tracking
- Queue position information

### 2.2 Problem Statement

Adopters experience "black hole" syndrome where applications disappear without acknowledgment. Shelters, overwhelmed and understaffed, struggle to respond timely. This creates:
- Adopter frustration and abandonment
- Missed adoptions (pets adopted while awaiting response)
- Negative platform reputation
- Shelter staff guilt and burnout

### 2.3 User Stories

**Adopters:**
- As an adopter, I want immediate confirmation when I submit an inquiry so I know it was received
- As an adopter, I want to see my position in the queue so I have realistic expectations
- As an adopter, I want to know the shelter's typical response time before applying
- As an adopter, I want updates when my application status changes
- As an adopter, I want to see that my application is being reviewed (not ignored)

**Shelter Staff:**
- As shelter staff, I want to see all pending inquiries in one dashboard
- As shelter staff, I want to quickly acknowledge applications without composing emails
- As shelter staff, I want templates for common responses
- As shelter staff, I want to track which team member is handling each application
- As shelter staff, I want to maintain a good response rating for my shelter

---

## 3. Technical Design

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMMUNICATION SYSTEM                               │
│                                                                              │
│  ┌───────────────────┐    ┌───────────────────┐    ┌────────────────────┐  │
│  │  Inquiry/App      │───▶│  Event Processor  │───▶│  Notification Svc  │  │
│  │  Submission       │    │                   │    │  - Email           │  │
│  └───────────────────┘    │  - Auto-ack       │    │  - Push            │  │
│                           │  - Queue calc     │    │  - SMS (future)    │  │
│                           │  - Status update  │    └────────────────────┘  │
│                           └───────────────────┘                             │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────┐    ┌───────────────────┐    ┌────────────────────┐  │
│  │  Response Time    │◀───│  Communication    │───▶│  Shelter Dashboard │  │
│  │  Analytics        │    │  Log              │    │  - Queue view      │  │
│  │                   │    │                   │    │  - Quick responses │  │
│  └───────────────────┘    └───────────────────┘    └────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    ADOPTER STATUS PORTAL                               │  │
│  │  - My Applications                                                     │  │
│  │  - Queue Position                                                      │  │
│  │  - Status History                                                      │  │
│  │  - Expected Response Time                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 GraphQL Schema Changes

```graphql
# Application status enum
enum ApplicationStatus {
  SUBMITTED          # Just submitted, auto-acknowledged
  ACKNOWLEDGED       # Shelter has seen it
  UNDER_REVIEW       # Being actively reviewed
  PENDING_INFO       # Awaiting additional info from adopter
  APPROVED           # Application approved
  REJECTED           # Application declined
  WITHDRAWN          # Adopter withdrew
  ADOPTED            # Animal was adopted (by this or another applicant)
}

# Communication event types
enum CommunicationEventType {
  AUTO_ACKNOWLEDGMENT
  SHELTER_VIEW
  STATUS_UPDATE
  MESSAGE_SENT
  MESSAGE_RECEIVED
}

# Communication log entry
type CommunicationEvent {
  id: ID!
  applicationId: ID!
  eventType: CommunicationEventType!
  status: ApplicationStatus
  message: String
  sentBy: User
  createdAt: DateTime!
}

# Enhanced Application type
type Application {
  id: ID!
  animal: Animal!
  user: User!
  shelter: Shelter!
  status: ApplicationStatus!
  queuePosition: Int                    # Position in shelter's queue
  estimatedResponseTime: Int            # Minutes
  submittedAt: DateTime!
  acknowledgedAt: DateTime
  lastStatusUpdate: DateTime
  lastShelterView: DateTime
  communicationLog: [CommunicationEvent!]!
  applicationData: JSON!
}

# Shelter response metrics
type ShelterResponseMetrics {
  shelterId: ID!
  averageResponseTime: Int!             # Minutes
  medianResponseTime: Int!
  responseRate: Float!                  # 0-100%
  totalApplications30Days: Int!
  respondedWithin24Hours: Float!        # Percentage
  rating: Float                         # 1-5 stars based on response
}

# Queue status for adopters
type ApplicationQueueStatus {
  application: Application!
  queuePosition: Int!
  applicationsAhead: Int!
  estimatedWait: Int                    # Minutes
  shelterResponseMetrics: ShelterResponseMetrics!
}

# New queries
extend type Query {
  # Adopter queries
  myApplications(status: ApplicationStatus): [Application!]!
  applicationStatus(applicationId: ID!): ApplicationQueueStatus!

  # Shelter queries
  shelterApplicationQueue(
    shelterId: ID!
    status: ApplicationStatus
    sortBy: ApplicationSortField
  ): [Application!]!
  shelterResponseMetrics(shelterId: ID!): ShelterResponseMetrics!

  # Public query
  shelterResponseRating(shelterId: ID!): Float
}

enum ApplicationSortField {
  SUBMITTED_AT
  LAST_UPDATE
  QUEUE_POSITION
}

# New mutations
extend type Mutation {
  # Adopter actions
  submitApplication(
    animalId: ID!
    applicationData: JSON!
  ): Application!
  withdrawApplication(applicationId: ID!): Application!

  # Shelter actions
  updateApplicationStatus(
    applicationId: ID!
    status: ApplicationStatus!
    message: String
  ): Application!

  markApplicationViewed(applicationId: ID!): Application!

  sendApplicationMessage(
    applicationId: ID!
    message: String!
    template: String          # Optional template ID
  ): CommunicationEvent!

  # Templates
  createResponseTemplate(
    shelterId: ID!
    name: String!
    content: String!
    forStatus: ApplicationStatus
  ): ResponseTemplate!
}

type ResponseTemplate {
  id: ID!
  shelterId: ID!
  name: String!
  content: String!
  forStatus: ApplicationStatus
  usageCount: Int!
}

# Subscriptions for real-time updates
extend type Subscription {
  applicationStatusChanged(applicationId: ID!): Application!
  newApplication(shelterId: ID!): Application!
}
```

### 3.3 MongoDB Models

```typescript
// Communication Event Schema
const communicationEventSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['AUTO_ACKNOWLEDGMENT', 'SHELTER_VIEW', 'STATUS_UPDATE', 'MESSAGE_SENT', 'MESSAGE_RECEIVED'],
    required: true
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'PENDING_INFO', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'ADOPTED']
  },
  message: String,
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Enhanced Application Schema
const applicationSchema = new mongoose.Schema({
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  },
  status: {
    type: String,
    enum: ['SUBMITTED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'PENDING_INFO', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'ADOPTED'],
    default: 'SUBMITTED'
  },
  applicationData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  queuePosition: Number,
  submittedAt: { type: Date, default: Date.now },
  acknowledgedAt: Date,
  lastStatusUpdate: Date,
  lastShelterView: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for efficient queries
applicationSchema.index({ shelterId: 1, status: 1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ shelterId: 1, submittedAt: -1 });
applicationSchema.index({ animalId: 1 });

// Response Time Metrics (denormalized for performance)
const shelterMetricsSchema = new mongoose.Schema({
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true,
    unique: true
  },
  averageResponseTime: { type: Number, default: 0 },     // Minutes
  medianResponseTime: { type: Number, default: 0 },
  responseRate: { type: Number, default: 100 },          // Percentage
  totalApplications30Days: { type: Number, default: 0 },
  respondedWithin24Hours: { type: Number, default: 100 },
  rating: { type: Number, min: 1, max: 5 },
  lastCalculated: { type: Date, default: Date.now }
}, { timestamps: true });

// Response Templates
const responseTemplateSchema = new mongoose.Schema({
  shelterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    required: true
  },
  name: { type: String, required: true },
  content: { type: String, required: true },
  forStatus: String,
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### 3.4 Auto-Acknowledgment Service

```typescript
// services/communication/AutoAcknowledgmentService.ts
class AutoAcknowledgmentService {
  private emailService: EmailService;
  private pushService: PushNotificationService;

  async processNewApplication(application: Application): Promise<void> {
    // 1. Send immediate acknowledgment email
    await this.sendAcknowledgmentEmail(application);

    // 2. Create communication event
    await CommunicationEvent.create({
      applicationId: application._id,
      eventType: 'AUTO_ACKNOWLEDGMENT',
      status: 'SUBMITTED',
      message: 'Your application has been received and is in the queue.'
    });

    // 3. Calculate queue position
    const queuePosition = await this.calculateQueuePosition(application);
    application.queuePosition = queuePosition;
    await application.save();

    // 4. Send push notification if app user
    if (application.userId) {
      await this.pushService.send(application.userId, {
        title: 'Application Received',
        body: `Your application for ${application.animal.name} is #${queuePosition} in queue.`,
        data: { applicationId: application._id }
      });
    }
  }

  private async sendAcknowledgmentEmail(application: Application): Promise<void> {
    const template = await this.loadEmailTemplate('application-received');
    const shelter = await Shelter.findById(application.shelterId);
    const animal = await Animal.findById(application.animalId);

    await this.emailService.send({
      to: application.user.email,
      subject: `Application Received: ${animal.name}`,
      template: 'application-received',
      data: {
        adopterName: application.user.name,
        animalName: animal.name,
        shelterName: shelter.name,
        queuePosition: application.queuePosition,
        expectedResponseTime: shelter.averageResponseTime || '24-48 hours',
        applicationId: application._id,
        statusUrl: `${process.env.APP_URL}/applications/${application._id}`
      }
    });
  }

  async calculateQueuePosition(application: Application): Promise<number> {
    const aheadCount = await Application.countDocuments({
      shelterId: application.shelterId,
      status: { $in: ['SUBMITTED', 'ACKNOWLEDGED', 'UNDER_REVIEW'] },
      submittedAt: { $lt: application.submittedAt }
    });

    return aheadCount + 1;
  }
}
```

### 3.5 Response Metrics Calculator

```typescript
// services/communication/MetricsCalculator.ts
class ResponseMetricsCalculator {
  async calculateForShelter(shelterId: string): Promise<ShelterMetrics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get all applications from last 30 days
    const applications = await Application.find({
      shelterId,
      submittedAt: { $gte: thirtyDaysAgo }
    });

    // Get response events
    const responseTimes: number[] = [];
    let respondedCount = 0;
    let respondedWithin24h = 0;

    for (const app of applications) {
      const firstResponse = await CommunicationEvent.findOne({
        applicationId: app._id,
        eventType: { $in: ['STATUS_UPDATE', 'MESSAGE_SENT'] }
      }).sort({ createdAt: 1 });

      if (firstResponse) {
        respondedCount++;
        const responseTime = firstResponse.createdAt - app.submittedAt;
        responseTimes.push(responseTime);

        if (responseTime <= 24 * 60 * 60 * 1000) {
          respondedWithin24h++;
        }
      }
    }

    // Calculate metrics
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const medianResponseTime = sortedTimes.length > 0
      ? sortedTimes[Math.floor(sortedTimes.length / 2)]
      : 0;

    const responseRate = applications.length > 0
      ? (respondedCount / applications.length) * 100
      : 100;

    const respondedWithin24HoursRate = respondedCount > 0
      ? (respondedWithin24h / respondedCount) * 100
      : 100;

    // Calculate rating (1-5 stars)
    const rating = this.calculateRating(responseRate, avgResponseTime);

    return {
      shelterId,
      averageResponseTime: Math.round(avgResponseTime / (60 * 1000)), // Minutes
      medianResponseTime: Math.round(medianResponseTime / (60 * 1000)),
      responseRate,
      totalApplications30Days: applications.length,
      respondedWithin24Hours: respondedWithin24HoursRate,
      rating
    };
  }

  private calculateRating(responseRate: number, avgResponseTimeMs: number): number {
    // Rating formula:
    // - Base: response rate (0-100) mapped to 1-5
    // - Penalty for slow responses (>24h)
    const avgResponseHours = avgResponseTimeMs / (60 * 60 * 1000);

    let rating = (responseRate / 100) * 5;

    // Penalty for slow responses
    if (avgResponseHours > 48) rating -= 1.5;
    else if (avgResponseHours > 24) rating -= 0.5;

    // Bonus for fast responses
    if (avgResponseHours < 4) rating += 0.5;

    return Math.max(1, Math.min(5, rating));
  }
}
```

### 3.6 Frontend Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ApplicationStatusTracker` | `client/src/components/adopter/ApplicationStatusTracker.tsx` | Shows current status with timeline |
| `QueuePositionDisplay` | `client/src/components/adopter/QueuePositionDisplay.tsx` | Visual queue position indicator |
| `MyApplicationsList` | `client/src/components/adopter/MyApplicationsList.tsx` | List all user's applications |
| `ShelterApplicationQueue` | `client/src/components/shelter/ShelterApplicationQueue.tsx` | Kanban-style queue view |
| `QuickResponsePanel` | `client/src/components/shelter/QuickResponsePanel.tsx` | Templates and quick actions |
| `ResponseTimeRating` | `client/src/components/ui/ResponseTimeRating.tsx` | Star rating display |
| `ShelterMetricsBadge` | `client/src/components/shelter/ShelterMetricsBadge.tsx` | Shows response metrics on shelter page |

### 3.7 Email Templates

**application-received.html:**
```html
<h1>Application Received!</h1>

<p>Hi {{adopterName}},</p>

<p>Your application for <strong>{{animalName}}</strong> at {{shelterName}} has been received.</p>

<div class="status-box">
  <p><strong>Queue Position:</strong> #{{queuePosition}}</p>
  <p><strong>Expected Response:</strong> {{expectedResponseTime}}</p>
</div>

<p>You can track your application status anytime:</p>
<a href="{{statusUrl}}" class="button">View Application Status</a>

<p>
  <small>
    You'll receive updates when your application status changes.
    This shelter typically responds within {{expectedResponseTime}}.
  </small>
</p>
```

**status-update.html:**
```html
<h1>Application Update</h1>

<p>Hi {{adopterName}},</p>

<p>Your application for <strong>{{animalName}}</strong> has been updated:</p>

<div class="status-box">
  <p><strong>New Status:</strong> {{newStatus}}</p>
  {{#if message}}
  <p><strong>Message from {{shelterName}}:</strong></p>
  <blockquote>{{message}}</blockquote>
  {{/if}}
</div>

<a href="{{statusUrl}}" class="button">View Full Details</a>
```

---

## 4. Implementation Plan

### 4.1 Phases

**Phase 1a: Database & Models (2-3 days)**
1. Create CommunicationEvent schema
2. Update Application schema
3. Create ShelterMetrics schema
4. Add database indexes

**Phase 1b: Auto-Acknowledgment (3-4 days)**
1. Implement AutoAcknowledgmentService
2. Set up email service (SendGrid/Mailgun)
3. Create email templates
4. Hook into application creation flow

**Phase 1c: Queue System (3-4 days)**
1. Implement queue position calculation
2. Create metrics calculator
3. Set up scheduled metrics recalculation
4. Add rating algorithm

**Phase 1d: Adopter Status Portal (4-5 days)**
1. ApplicationStatusTracker component
2. MyApplicationsList page
3. Real-time status updates via subscriptions
4. Queue position visualization

**Phase 1e: Shelter Dashboard (4-5 days)**
1. ShelterApplicationQueue component
2. QuickResponsePanel
3. Response templates management
4. Metrics display

### 4.2 Dependencies

**External:**
- Email service (SendGrid or Mailgun)
- Push notification service (optional for MVP)

**Internal:**
- User authentication
- Application model
- Shelter model

---

## 5. Testing Strategy

### 5.1 Unit Tests

```typescript
describe('AutoAcknowledgmentService', () => {
  it('sends acknowledgment email immediately on application', async () => {
    const application = await createMockApplication();
    await autoAckService.processNewApplication(application);

    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: application.user.email,
        template: 'application-received'
      })
    );
  });

  it('calculates correct queue position', async () => {
    // Create 3 existing applications
    await createMockApplications(3);
    const newApp = await createMockApplication();

    const position = await autoAckService.calculateQueuePosition(newApp);
    expect(position).toBe(4);
  });
});

describe('MetricsCalculator', () => {
  it('calculates average response time correctly', async () => {
    // Setup: 3 applications with known response times
    const metrics = await calculator.calculateForShelter(shelterId);
    expect(metrics.averageResponseTime).toBeCloseTo(expectedAvg, 0);
  });

  it('assigns 5-star rating for 100% response rate under 4h', async () => {
    const metrics = await calculator.calculateForShelter(fastShelterId);
    expect(metrics.rating).toBe(5);
  });
});
```

### 5.2 Integration Tests

```typescript
describe('Application Flow', () => {
  it('sends acknowledgment within 30 seconds', async () => {
    const startTime = Date.now();
    const response = await graphqlClient.mutate({
      mutation: SUBMIT_APPLICATION,
      variables: { animalId, applicationData }
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(30000);
    expect(emailService.send).toHaveBeenCalled();
  });

  it('updates queue positions when application is processed', async () => {
    // Create 3 applications
    const apps = await Promise.all([
      submitApplication(),
      submitApplication(),
      submitApplication()
    ]);

    // Process first application
    await updateApplicationStatus(apps[0].id, 'APPROVED');

    // Check remaining apps moved up
    const updatedApp2 = await Application.findById(apps[1].id);
    expect(updatedApp2.queuePosition).toBe(1);
  });
});
```

### 5.3 E2E Tests

- Submit application → verify email received → check status page shows correct info
- Multiple applications to same shelter → verify queue positions
- Shelter responds → adopter receives notification → status updates
- Shelter response time affects rating calculation

---

## 6. Security Considerations

### 6.1 Authentication Requirements

- Adopters must be logged in to submit applications
- Adopters can only view their own applications
- Shelter staff can only view/respond to their shelter's applications

### 6.2 Authorization Rules

```typescript
const canViewApplication = async (applicationId: string, userId: string) => {
  const application = await Application.findById(applicationId);
  if (!application) return false;

  // Adopter who submitted
  if (application.userId.equals(userId)) return true;

  // Shelter staff
  const shelter = await Shelter.findById(application.shelterId);
  return shelter.users.includes(userId);
};
```

### 6.3 Data Validation

- Sanitize application data (PII in free text fields)
- Rate limit application submissions (3 per shelter per hour)
- Validate email addresses before sending

---

## 7. Performance Considerations

### 7.1 Expected Load

- Application submissions: ~100-500/day at scale
- Status checks: ~10x submission rate
- Queue recalculation: On each status change

### 7.2 Caching Strategy

- Cache shelter metrics (5 min TTL)
- Cache queue positions (invalidate on status change)
- Batch email sends during high-volume periods

### 7.3 Database Optimizations

```javascript
// Indexes
db.applications.createIndex({ shelterId: 1, status: 1 });
db.applications.createIndex({ userId: 1 });
db.applications.createIndex({ shelterId: 1, submittedAt: -1 });
db.communicationevents.createIndex({ applicationId: 1, createdAt: 1 });
db.sheltermetrics.createIndex({ shelterId: 1 }, { unique: true });
```

---

## 8. Rollout Plan

### 8.1 Feature Flags

```typescript
const FEATURE_FLAGS = {
  AUTO_ACKNOWLEDGMENT: process.env.FF_AUTO_ACK === 'true',
  QUEUE_VISIBILITY: process.env.FF_QUEUE_VIS === 'true',
  RESPONSE_RATINGS: process.env.FF_RATINGS === 'true'
};
```

### 8.2 Gradual Rollout

1. **Week 1:** Auto-acknowledgment only (no queue visibility)
2. **Week 2:** Add queue position display
3. **Week 3:** Add shelter response metrics
4. **Week 4:** Public rating display

### 8.3 Rollback Plan

- Disable auto-ack → applications still stored, just no email
- Disable ratings → hide display, continue collecting data

---

## 9. Monitoring & Alerts

### 9.1 Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Email delivery rate | <95% | PagerDuty |
| Acknowledgment latency (p95) | >30s | Slack |
| Daily applications processed | <expected | Slack |
| Unacknowledged applications | >0 (5 min) | PagerDuty |

### 9.2 Dashboard Metrics

- Applications submitted (hourly/daily)
- Average time to first shelter response
- Queue depth by shelter
- Rating distribution

---

## 10. Open Questions

- [ ] Email service selection (SendGrid vs Mailgun vs SES)
- [ ] Should shelters be able to hide their response rating?
- [ ] What's the minimum sample size before showing rating?
- [ ] Push notification service for MVP or defer?

---

## 11. References

- COMPILED_RESEARCH_P.md - Communication gap analysis
- COMPILED_RESEARCH_NP.md - Platform communication patterns
- PetRescue Australia reviews - International communication problems
- Airbnb host response rate system (inspiration)

---

## 12. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 22, 2026 | Claude Code | Initial draft |
