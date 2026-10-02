# LifePass — Master Specification

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE  
**Product:** LifePass AI — Unified Life-Stage Digital Identity & Record Network

## Purpose

This repository is the single source of truth for building LifePass.

Every developer, designer, AI coding agent, or future contributor MUST read the relevant specification files before making implementation decisions.

Do not independently redesign architecture, replace technologies, add major features, remove defined constraints, or reinterpret product behavior. If a change is necessary, update the specification first and record the change.

## Specification files

1. `AI_AGENT_SPEC.md` — AI responsibilities, prompts, outputs, guardrails.
2. `API_CONTRACT.md` — API/service contracts and payload conventions.
3. `ARCHITECTURE.md` — complete system architecture and boundaries.
4. `BACKEND_SPEC.md` — backend services, business logic and processing.
5. `DATABASE_SCHEMA.md` — PostgreSQL/Supabase schema and relationships.
6. `DEMO_FLOW.md` — exact end-to-end demonstration flows.
7. `DOCUMENT_PIPELINE.md` — document intake and processing.
8. `FRONTEND_SPEC.md` — individual and institution responsive web applications.
9. `IMPLEMENTATION_PLAN.md` — build order, milestones and ownership.
10. `PRODUCT_SPEC.md` — product scope, users, features and non-goals.
11. `SECURITY_CONSENT.md` — security, authorization, consent and audit rules.
12. `TESTING_QA.md` — acceptance criteria, tests and failure cases.

### Two-Sided Platform & Authentication Amendment (v1.2)
- **Two-Sided Architecture:** LifePass AI serves two primary user types:
  1. **Individual / Citizen:** Personal record owner managing life tasks and consent. Implemented as a **responsive React web application** (`apps/web/**`).
  2. **Institution:** Verifying organizations requesting consented records. Implemented as a **responsive React web portal** (`apps/web/**`).
- **Mobile Target Reframe:** The original native mobile app (`apps/mobile/**`) is designated as a **legacy prototype reference**. All active frontend development is consolidated in `apps/web/**`.
- **Authentication Model:** Login operates via **Username and Password** for both Individual and Institution users. Phone OTP login and Email-based login are retired.
- **Consent OTP Distinction:** Temporary access OTP / authorization codes used during institutional record sharing remain part of the consent/security workflow and are distinct from login authentication.

## Technology baseline

### Individual application
- React
- TypeScript
- Responsive Web application (`apps/web/**`)
- App-like mobile-friendly & desktop layouts

### Institution application
- React
- TypeScript
- Responsive Web application (`apps/web/**`)
- Desktop & tablet optimized administrative interface

### Legacy prototype (Non-active)
- React Native / Expo (`apps/mobile/**`) — preserved as historical reference; receives no further feature work.

### Platform/backend
- Supabase
- PostgreSQL
- Supabase Auth (Username/Password authentication model)
- Supabase Storage
- Row Level Security (RLS)
- Supabase Edge Functions where suitable
- Python AI/document-processing service (FastAPI) for OCR, embeddings, and NLP

During frontend development, the web application runs in an isolated prototype mode using a clean auth adapter with zero Supabase credential requirements. Real backend integration occurs in later cross-workstream integration phases.

## Core product boundary

LifePass is NOT another document locker and is NOT an issuing authority.

LifePass is an intelligence and orchestration layer that makes a person's existing records context-aware and reusable across life-stage workflows.

### LifePass does

- Understand the user's intended task.
- Identify the relevant life-stage/domain.
- Retrieve trusted requirements from a controlled requirement knowledge base.
- Classify uploaded documents.
- Extract text/metadata.
- Match records to requirements.
- Detect missing/expired/attention-needed records according to deterministic rules.
- Prepare a structured sharing package.
- Explain results to the user.
- Manage consent and access workflows.
- Maintain audit history.

### LifePass does NOT

- Declare arbitrary document contents authentic.
- Claim an issuer confirmed a document without an authoritative response.
- Decide whether marks, salary, identity details, etc. are factually true.
- Approve/reject a loan, admission, employment, KYC, healthcare or other institutional decision.
- Pretend a real DigiLocker/issuer integration exists when it has not been implemented.

## Verification boundary

The AI may inspect a document for structure, type, extracted fields and requirement matching.

It must never turn extraction into an authenticity claim.

External/issuer verification status may be stored and displayed when an authoritative source provides it.

## Data/demo rule

The prototype may contain controlled demo-account records so the end-to-end system can be demonstrated.

Demo records must be clearly treated as demo-account data.

The system must NOT present fake external API responses as real DigiLocker, government, university, bank or issuer integrations.

## Two supported workflows

### User initiated
User states a goal such as:
> "I want to apply for an education loan."

LifePass identifies the task, retrieves requirements, finds relevant records, identifies gaps, and asks the user to review and consent.

### Organization initiated
An institution creates a request for a defined purpose and requirement profile. LifePass maps the user's records to that request, then the user reviews and consents before sharing.

Both workflows use the same underlying requirement, matching, record, consent and audit systems.

## Source-of-truth rule for future AI coding prompts

Every implementation prompt MUST instruct the coding agent to:

1. Read this Master README.
2. Read the specification file(s) relevant to the requested change.
3. Follow the existing architecture and contracts.
4. Avoid introducing unapproved technologies or flows.
5. Report conflicts instead of silently changing the architecture.
6. Update the relevant specification when an approved architectural change is made.

## Change control

A change is not considered part of LifePass merely because code implements it.

The specification is authoritative.

For an architectural/product change:
1. Identify the affected specification.
2. Update the specification.
3. Update dependent specifications.
4. Update implementation plan.
5. Update testing/acceptance criteria.
6. Only then implement.

## Current implementation status

This repository defines the final baseline. The specifications describe what must be built; they do not imply that every component has already been implemented.

## Authentication & Access Control Architecture

LifePass uses **Username and Password** authentication across both Individual and Institution web applications.

### Login Flow:
```text
Enter Username & Password
    ↓
Auth Adapter / Credential Verification
    ↓
Authenticated Session Established
    ↓
LifePass Responsive Web (Individual Dashboard or Institution Portal)
```

- **Login Credentials:** Users and institution officers authenticate using clean, deterministic username and password credentials. Neither Phone OTP login nor Email-based login is used.
- **Frontend Development Mode:** In the isolated frontend workstream, authentication is handled via a client-side `IAuthAdapter` (`MockAuthAdapter`) storing session display metadata in `localStorage` without plaintext passwords and requiring no live backend credentials.
- **Production Integration:** During final integration, `SupabaseAuthAdapter` will connect to Supabase Auth without modifying the UI components.
- **Consent OTP Distinction:** The separate temporary-access verification / OTP mechanism for authorizing institutional access to personal records remains part of the consent security boundary and is not affected by the login authentication model.
