# Competitive Research Prompt: save-a-stray

## Instructions for Research Agent

You are conducting competitive research to build a comprehensive feature backlog for **save-a-stray**, a pet adoption and animal rescue platform. Your goal is to identify 200-500+ features by analyzing competitors and industry best practices.

---

## Project Overview

**save-a-stray** is a full-stack pet adoption platform that helps:
- Users find and adopt pets from shelters/rescues
- Shelters list animals available for adoption
- Connect adopters with rescue organizations
- Facilitate the adoption process end-to-end

**Current Tech Stack:**
- Frontend: React (upgrading to 19.x)
- Backend: Node.js/Express, GraphQL, MongoDB
- Data: Apollo Client
- Auth: Firebase + Passport

---

## Research Categories

Analyze competitors and identify features in these categories:

### 1. Pet Discovery & Search
- Advanced search filters (species, breed, age, size, etc.)
- Location-based search with radius
- Pet personality matching
- AI-powered recommendations
- Saved searches and alerts
- Virtual pet profiles

### 2. Pet Profiles
- Photo galleries and videos
- Medical history display
- Personality assessments
- Compatibility indicators (kids, other pets, etc.)
- Foster vs. adoption status
- Success stories/updates

### 3. Shelter/Rescue Management
- Shelter dashboard
- Animal inventory management
- Adoption application processing
- Volunteer coordination
- Event management (adoption events)
- Analytics and reporting

### 4. Adoption Process
- Online application forms
- Application status tracking
- Document management
- Background check integration
- Adoption fee processing
- Adoption contract generation

### 5. User Features
- Saved/favorited pets
- Application history
- Adoption preferences profile
- Notification preferences
- Social sharing
- Reviews and ratings

### 6. Communication
- In-app messaging
- Shelter contact forms
- Video meet-and-greets
- Appointment scheduling
- Automated follow-ups
- Q&A about pets

### 7. Education & Resources
- Pet care guides
- Breed information
- Training resources
- Veterinary partnerships
- Pet supplies recommendations
- New pet owner checklists

### 8. Community Features
- Success story sharing
- Pet owner forums
- Lost & found section
- Foster network
- Volunteer opportunities
- Fundraising/donations

### 9. Mobile Experience
- Progressive Web App
- Push notifications
- Location services
- Camera for pet photos
- QR code scanning

### 10. Integrations
- Social media sharing
- Calendar integration
- Payment processors
- Shelter management systems
- Microchip registries
- Veterinary records

---

## Competitors to Analyze

### Primary Competitors (Pet Adoption Platforms)
1. **Petfinder** - Largest pet adoption platform
2. **Adopt-a-Pet** - Second largest adoption site
3. **ASPCA** - Major national organization
4. **Best Friends Animal Society** - National rescue network
5. **PetHarbor** - Shelter network platform

### Specialized Platforms
6. **Rescue Me!** - Breed-specific rescues
7. **Get Your Pet** - Peer-to-peer rehoming
8. **Rehome by Adopt-a-Pet** - Direct rehoming
9. **All Paws Rescue** - Regional rescue network
10. **Pets911** - Lost/found + adoption

### Shelter Management
11. **Shelter Animals Count** - Industry analytics
12. **PetPoint** - Shelter management software
13. **Chameleon** - Shelter CRM
14. **Pawlytics** - Rescue analytics

### International
15. **Battersea** (UK) - Famous rescue
16. **RSPCA** (UK/Australia) - National organizations
17. **Humane Society International**

---

## Output Format

Provide your research in this format:

### Feature Backlog Structure

```markdown
## Category X: [Category Name] (X features)

### P0 - Critical (MVP Required)
| ID | Feature | Description | Effort | Competitors |
|----|---------|-------------|--------|-------------|
| FX.X.X | Feature Name | What it does | Low/Med/High | Petfinder, ASPCA |

### P1 - High Priority (Competitive Parity)
[Same table format]

### P2 - Medium Priority (Differentiation)
[Same table format]

### P3 - Future (Nice to Have)
[Same table format]
```

### Priority Definitions
- **P0 Critical**: Core features needed for MVP launch
- **P1 High**: Features that major competitors all have
- **P2 Medium**: Features that differentiate from competitors
- **P3 Future**: Advanced features for long-term roadmap

### Effort Definitions
- **Low**: 1-2 days implementation
- **Medium**: 3-5 days implementation
- **High**: 1-2 weeks implementation

---

## Research Questions to Answer

1. What features do ALL major pet adoption sites have? (P0/P1 candidates)
2. What makes Petfinder the market leader? What can we learn?
3. What are shelters' biggest pain points with existing platforms?
4. What are adopters frustrated about? (Opportunity areas)
5. What mobile features are essential for pet discovery?
6. How are platforms using AI/ML for pet matching?
7. What payment/donation features are important?
8. What accessibility features are needed?
9. How can we support the foster network better?
10. What community features drive engagement?

---

## Expected Deliverable

A comprehensive FEATURE_BACKLOG.md file with:
- 200-500 features organized by category
- Priority levels (P0-P3) for each feature
- Effort estimates
- Competitor references
- Phase recommendations (which quarter to build)

Reference the SpecTree FEATURE_BACKLOG.md format for structure inspiration.
