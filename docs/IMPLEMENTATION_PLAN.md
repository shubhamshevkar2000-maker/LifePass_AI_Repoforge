# LifePass — Implementation Plan

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE

## 1. Build strategy

Build in vertical slices with isolated parallel workstreams:
- **Workstream 1 (Frontend):** Responsive Web applications for Individual and Institution (`apps/web/**`).
- **Workstream 2 (AI):** Context Engine, document classification, extraction, and explanation (`services/ai/**`).
- **Workstream 3 (Backend):** Supabase PostgreSQL, Storage, RLS, and security policies.

First establish:
- authentication interfaces (isolated mock in dev; Supabase in prod)
- database
- record storage
- requirement profiles
- matching
- one AI flow
- consent
- institution view

Then integrate cross-workstream.

## 2. Phase 0 — Repository and environment

Create:
- Git repository
- Individual responsive web experience (`apps/web/**`)
- Institution responsive web portal (`apps/web/**`)
- Legacy mobile prototype reference (`apps/mobile/**`, frozen)
- Supabase project
- Python AI service (`services/ai/**`)
- environment variable strategy

No secrets committed.

## 3. Phase 1 — Foundation

Implement:
- Username and password authentication baseline
- Session handling and profile creation
- User and institution role separation
- Base responsive navigation shell (`apps/web/**`)
- Database migrations and RLS baseline
- Client-side auth adapter for isolated frontend development without live Supabase credentials

Acceptance:
- individual can register and sign in using username/password
- institution officer can register and sign in using username/password
- incorrect password fails
- unauthorized cross-user access fails

### Phase 1.5 — Authentication & Interface Gate

Verify that frontend components consume authentication through clean interfaces (`IAuthAdapter`), permitting local development with zero external dependencies and smooth subsequent integration with Supabase Auth.

## 4. Phase 2 — Records

Implement:
- categories
- upload
- Supabase Storage
- record metadata
- record listing
- record detail
- processing state

Acceptance:
- user can upload and view their own record
- another user cannot access it

## 5. Phase 3 — Requirement Knowledge Layer

Implement:
- requirement profiles
- requirement items
- versioning
- seed only controlled requirement knowledge needed for MVP

Acceptance:
- education-loan profile returns deterministic requirements

## 6. Phase 4 — AI intent

Implement:
- AI intent endpoint
- schema validation
- confidence
- fallback

Acceptance:
Input:
> "I want to apply for an education loan."

returns the expected structured task.

## 7. Phase 5 — Document processing

Implement:
- OCR
- classification
- metadata extraction
- processing states
- review state

Acceptance:
- supported demo documents are classified
- extraction is stored
- no authenticity claim is generated

## 8. Phase 6 — Matching

Implement:
- candidate retrieval
- metadata filters
- deterministic rules
- readiness
- missing/attention states

Acceptance:
Known demo dataset produces expected result.

## 9. Phase 7 — User workflow

Implement:
- AI assistant
- result screen
- requests
- consent
- notifications

## 10. Phase 8 — Institution portal

Implement:
- dashboard
- create request
- request detail
- package view
- audit

## 11. Phase 9 — End-to-end integration

Test:
```text
User goal
→ requirements
→ records
→ matching
→ consent
→ institution
→ audit
```

## 12. Phase 10 — Security hardening

Verify:
- RLS
- private storage
- authorization
- consent enforcement
- no secrets in client
- prompt injection handling
- input validation

## 13. Phase 11 — Demo polish

Focus on:
- speed
- clarity
- error states
- visual consistency
- loading states
- prepared demo account
- repeatable demo

## 14. Team work allocation (Parallel Workstreams)

### Workstream 1 — Frontend (Lead Engineer)
- **Scope:** `apps/web/**`
- **Deliverables:** Responsive web application for both **Individual** and **Institution** experiences.
- **Components:** Landing page role selection, Individual dashboard/vault/AI/consent, Institution dashboard/requests/audit.
- *(Note: `apps/mobile/**` is a legacy prototype reference; receives no further feature work).*

### Workstream 2 — AI Context Engine (Separate Developer)
- **Scope:** `services/ai/**`
- **Deliverables:** FastAPI service, intent parsing, requirement retrieval, document classification, metadata extraction, explanation.

### Workstream 3 — Backend, Database & Security (Separate Developer)
- **Scope:** `supabase/**`, PostgreSQL, RLS, Storage, edge functions, server authorization, audit trails.

## 15. Revised Frontend Implementation Roadmap (F-1 through F-12)

The frontend workstream in `apps/web/**` proceeds along the following sequence:

- **F-1: Product/Frontend Reframe + Auth UX**  
  Landing screen role selector (Individual vs Institution), tabbed username/password login & registration for both sides, mock auth adapter with session persistence, zero configuration warnings.
- **F-2: Shared Responsive Web Shell + Landing / Role Selection**  
  Unified responsive layout primitives, mobile navigation drawer/bottom navigation, desktop sidebar, brand elements, user switcher.
- **F-3: Individual Dashboard**  
  Personalized greeting, "What are you trying to accomplish?" AI prompt, suggested life tasks (**College Admission** priority), record counts, active permissions summary.
- **F-4: Individual Record Vault + Upload UX**  
  Multi-category record browsing, upload modal with progress, record cards, status badges (`VERIFIED`, `PENDING`, `UNVERIFIED`, `EXPIRED`).
- **F-5: Individual AI Task / Requirement Experience**  
  Task input submission, requirement profile display, matched vs missing records, readiness percentage, human explanation.
- **F-6: Individual Consent / Access Request Experience**  
  Incoming request view, purpose & duration review, record selection, explicit Allow/Deny actions, active permissions management.
- **F-7: Institution Dashboard**  
  Institution metrics, active applications, pending requests, attention items.
- **F-8: Institution Request Creation**  
  Applicant selector, workflow purpose, requirement profile attachment, expiry definition.
- **F-9: Institution Applications + Detail**  
  Application tracking table, applicant status, requirement checklist inspection.
- **F-10: Consented Record Package + AI Explanation**  
  Structured consented package view, metadata inspection, verification indicators, AI explanation.
- **F-11: Audit + Settings**  
  Audit event log, role settings, security status.
- **F-12: Frontend QA + Cross-Workstream Integration Readiness**  
  End-to-end frontend verification, mock-to-backend adapter readiness, responsiveness testing.

## 16. Development rule

Do not implement a later phase by violating an earlier contract.

When blocked:
1. Read relevant specs.
2. Identify dependency.
3. Fix the contract/schema first if necessary.
4. Then implement.
