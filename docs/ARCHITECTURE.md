# LifePass — Architecture

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE

## 1. High-level architecture

```text
                                LifePass AI
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
           INDIVIDUAL SIDE                   INSTITUTION SIDE
        Responsive React Web               Responsive React Web
           (apps/web/**)                      (apps/web/**)
          [Mobile/Tablet/PC]                 [Desktop/Tablet]
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                             Frontend Auth Adapter
                      (Mock in dev / Supabase in prod)
                                     │
                                 Supabase
                    ┌────────────────┼────────────────┐
                    │        │       │        │       │
                  Auth   PostgreSQL Storage  RLS  Functions
                    │
           Username/Password
                                     │
                            Application Services
                                     │
                         Python AI/Document Service
                                  (FastAPI)
                    ┌────────────────┼────────────────┐
                    │                │                │
                  Intent           RAG/KB        Document AI
                    │                │                │
                    └────────────────┼────────────────┘
                                     │
                              Matching Engine
                                     │
                              Consent Workflow
                           (Temporary Access OTP)
                                     │
                                Audit Layer

[Legacy Prototype Reference: apps/mobile/** (React Native/Expo) — Frozen, Non-active]
```

## 2. Frontend architecture

### Individual (Citizen / Record Owner)
React + TypeScript responsive web application (`apps/web/**`).

Architecture:
- App-like responsive layout supporting mobile web browsers, tablets, and desktop displays.
- Responsive shell with mobile hamburger navigation and desktop sidebar.
- Single unified design system reusing W-1 primitives (`Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, `Spinner`).
- Decoupled from backend via client-side adapters during isolated frontend development.

Responsibilities:
- Landing & role discovery
- Individual registration & login (Username/Password)
- Life-stage dashboard (with primary hackathon focus: College Admission)
- Record vault browsing & uploading
- AI task submission & requirement review
- Access request review & explicit consent granting/denial
- Active permissions & audit activity inspection

*(Note: The original native mobile prototype in `apps/mobile/**` is frozen and no longer an active frontend target).*

### Institution (Verifying Organization)
React + TypeScript responsive web application (`apps/web/**`).

Responsibilities:
- Institution authentication (Username/Password) & officer registration
- Request creation & requirement profile assignment
- Application/request tracking dashboard
- Requirement checklist & verification views
- Consented record package inspection
- Audit trail & compliance views
- application/request dashboard
- requirement views
- consented package display
- audit views
- workflow status

## 3. Supabase role

Supabase is the main application platform:
- PostgreSQL
- Auth
- Storage
- RLS
- Realtime only where useful
- Edge Functions for lightweight server-side APIs/orchestration

Supabase's architecture places Postgres at the core with Auth, Storage, Realtime and Functions around it.

## 4. Python service

A Python service is used when the processing requires Python-specific document/AI tooling.

Responsibilities:
- OCR orchestration
- document classification
- metadata extraction
- embedding/indexing
- intent/AI processing
- requirement retrieval where appropriate
- explanation generation

It communicates through defined API contracts and never bypasses authorization.

## 5. Core logical layers

### Layer 1 — Identity
Authentication and user/institution roles.

### Layer 2 — Record layer
Document files and metadata.

### Layer 3 — Life-Stage Knowledge Layer
Controlled requirement profiles.

### Layer 4 — Intelligence layer
Intent understanding, retrieval, classification and explanation.

### Layer 5 — Match engine
Deterministic mapping of requirements to available records.

### Layer 6 — Consent
User-controlled sharing permissions.

### Layer 7 — Organization workflow
Request and package lifecycle.

### Layer 8 — Audit
Immutable-style application audit events.

## 6. Trusted-source boundary

LifePass may consume records from trusted/authorized sources in the future, including ecosystems such as DigiLocker, but the MVP must not pretend to have a production integration that has not been built and authorized.

The source of truth for authenticity remains the issuing/authoritative system.

## 7. Request flow

```text
User/Institution
      |
      v
Authenticated request
      |
      v
Authorization/RLS
      |
      v
Requirement profile
      |
      v
Record retrieval
      |
      v
Deterministic matching
      |
      v
User consent
      |
      v
Scoped package access
      |
      v
Audit event
```

## 8. Security boundary

- RLS protects user-owned records.
- Institution access is scoped to an approved request/consent.
- Service credentials remain server-side.
- AI service does not receive data it is not authorized to process.
- LLM output is never treated as an authorization decision.

## 9. Architectural constraints

Do not add:
- microservices for every feature
- blockchain
- a second database
- a second auth provider
- unnecessary message queues
- unnecessary vector databases
- a separate backend framework when Supabase/Edge Functions are sufficient

A component may be added only when a real requirement justifies it.

## 10. Authentication flow

LifePass enforces **Username and Password** authentication across both Individual and Institution web clients:
- **Individual Credentials:** Authenticated using clean username/password credentials created during registration.
- **Institution Credentials:** Authenticated using portal username/password credentials linked to an official institution membership.
- **Client-Side Auth Adapter:** During parallel frontend development, a clean `IAuthAdapter` isolates the web client from live backend/Supabase credentials, running seamlessly with zero configuration warnings.
- **Production Authority:** During final cross-workstream integration, Supabase Auth serves as the production authentication authority.
- **Consent OTP Distinction:** Temporary access OTP / authorization codes used during institutional record sharing remain part of the consent/security workflow and are distinct from login authentication.
