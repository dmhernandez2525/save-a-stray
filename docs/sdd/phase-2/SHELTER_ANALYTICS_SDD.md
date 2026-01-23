# Software Design Document: Shelter Analytics Dashboard

**Phase:** 15
**Status:** Implemented
**Date:** January 22, 2026

---

## 1. Overview

The Shelter Analytics Dashboard provides shelter staff with a comprehensive view of their operational metrics. It displays animal statistics (by status), adoption rates, and application breakdown (by status and time period), enabling data-driven decision-making for shelter operations.

---

## 2. Features

- **Adoption Rate**: Visual progress bar showing percentage of animals adopted
- **Animal Status Breakdown**: Color-coded stat cards for total, available, pending, and adopted animals
- **Application Summary**: Total, recent (30 days), and approved counts
- **Application Status Bars**: Visual breakdown of applications by status with proportional bars

---

## 3. Architecture

### Backend

**New GraphQL Type: `ShelterAnalyticsType`**

| Field | Type | Description |
|-------|------|-------------|
| `totalAnimals` | Int | Total animals in shelter |
| `availableAnimals` | Int | Animals with status "available" |
| `pendingAnimals` | Int | Animals with status "pending" |
| `adoptedAnimals` | Int | Animals with status "adopted" |
| `adoptionRate` | Float | Percentage (0-100) of adopted animals |
| `totalApplications` | Int | All applications for shelter's animals |
| `submittedApplications` | Int | Applications in "submitted" status |
| `underReviewApplications` | Int | Applications in "under_review" status |
| `approvedApplications` | Int | Applications in "approved" status |
| `rejectedApplications` | Int | Applications in "rejected" status |
| `recentApplications` | Int | Applications in last 30 days |

**Query: `shelterAnalytics(shelterId: ID!)`**

The resolver:
1. Fetches the shelter by ID
2. Queries all animals belonging to the shelter
3. Counts animals by status
4. Computes adoption rate as `(adopted / total) * 100`
5. Queries all applications where `animalId` is in the shelter's animals
6. Counts applications by status
7. Filters applications by `submittedAt` within last 30 days for `recentApplications`

### Frontend

**Component: `ShelterAnalytics`** (functional component)

Props: `{ shelterId: string }`

Uses Apollo `Query` render prop to fetch analytics data and renders:
- Adoption rate card with progress bar
- 4 color-coded stat cards (grid layout)
- Applications card with summary counts and status bars

**Sub-components:**
- `StatCard` - Colored card displaying a label and numeric value
- `StatusBar` - Horizontal bar showing proportion of a status relative to total

---

## 4. Files Created/Modified

| File | Change |
|------|--------|
| `server/schema/types/shelter_analytics_type.ts` | Created - GraphQL type |
| `server/schema/types/root_query_type.ts` | Modified - Added shelterAnalytics query |
| `client/src/components/ShelterAnalytics.tsx` | Created - Analytics component |
| `client/src/components/ShelterLanding.tsx` | Modified - Integrated analytics section |
| `client/src/types/index.ts` | Modified - Added ShelterAnalytics types |
| `client/src/graphql/queries.ts` | Modified - Added SHELTER_ANALYTICS query |

---

## 5. Testing

- Backend: ShelterAnalyticsType field validation, shelterAnalytics query arg validation
- Frontend: Adoption rate display, animal stats, application stats, edge cases (zero values, 100% rate, overflow)
