# Save A Stray - Documentation Index

**Version:** 2.0.0
**Last Updated:** January 22, 2026

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | System design, tech stack, data models, API reference |
| [Roadmap](./ROADMAP.md) | 5-phase implementation plan with success criteria |
| [Feature Backlog](./FEATURE_BACKLOG.md) | 326 features organized by phase and priority |
| [Coding Standards](./CODING_STANDARDS.md) | Code style, patterns, and quality requirements |
| [SDDs](./sdd/) | Software Design Documents for planned features |

---

## Project Overview

Save A Stray is a pet adoption platform that connects animal shelters with potential adopters through a unified, searchable database with real-time listing sync and communication accountability.

### Core Differentiators

| Differentiator | Description |
|----------------|-------------|
| Real-Time Sync | <5 min listing updates vs competitors' 24-36hr lag |
| Communication Accountability | Auto-acknowledgment, response time tracking |
| Per-Adoption Pricing | $2/adoption vs monthly subscriptions |
| Foster-First Focus | Targeting underserved foster-based rescues |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Apollo Client |
| Backend | Node.js, Express, GraphQL, Mongoose |
| Database | MongoDB Atlas |
| Auth | Passport.js (JWT, Google OAuth, Facebook OAuth) |
| Deployment | Render.com (IaC via render.yaml) |
| CI/CD | GitHub Actions |
| Testing | Vitest (frontend), Jest (backend) |

---

## Documentation Map

### Planning & Strategy

| Document | Purpose |
|----------|---------|
| [ROADMAP.md](./ROADMAP.md) | Phase timeline, milestones, go-to-market |
| [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) | Complete feature list with dependencies |

### Technical Reference

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, models, API |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | TypeScript patterns, testing |

### Feature Specifications

| Document | Purpose |
|----------|---------|
| [sdd/FEATURE_SDD_TEMPLATE.md](./sdd/FEATURE_SDD_TEMPLATE.md) | Template for new SDDs |
| [sdd/MODERNIZATION_SDD.md](./sdd/MODERNIZATION_SDD.md) | TypeScript migration details |
| [sdd/phase-1/INDEX.md](./sdd/phase-1/INDEX.md) | Phase 1 overview |
| [sdd/phase-1/REAL_TIME_SYNC_SDD.md](./sdd/phase-1/REAL_TIME_SYNC_SDD.md) | Listing sync architecture |
| [sdd/phase-1/COMMUNICATION_SYSTEM_SDD.md](./sdd/phase-1/COMMUNICATION_SYSTEM_SDD.md) | Auto-acknowledgment system |

### Quality Checklists

| Document | Purpose |
|----------|---------|
| [checklists/CODE_REVIEW_CHECKLIST.md](./checklists/CODE_REVIEW_CHECKLIST.md) | PR code review checklist |
| [checklists/PRE_COMMIT_CHECKLIST.md](./checklists/PRE_COMMIT_CHECKLIST.md) | Pre-commit quality checks |
| [checklists/PRE_MR_CHECKLIST.md](./checklists/PRE_MR_CHECKLIST.md) | Pre-merge request checklist |

### Research

| Document | Purpose |
|----------|---------|
| [research/COMPETITIVE_RESEARCH_PROMPT.md](./research/COMPETITIVE_RESEARCH_PROMPT.md) | Competitor analysis prompt |

### Work Tracking

| Document | Purpose |
|----------|---------|
| [../roadmap/WORK_STATUS.md](../roadmap/WORK_STATUS.md) | Current work in progress |

---

## URLs

| Environment | URL |
|-------------|-----|
| Live Site | https://save-a-stray-site.onrender.com |
| API | https://save-a-stray-api.onrender.com |
| Health Check | https://save-a-stray-api.onrender.com/health |
| GitHub | https://github.com/dmhernandez2525/save-a-stray |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2026 | Original | Initial index |
| 2.0.0 | Jan 22, 2026 | Claude Code | Updated to reflect current documentation |
