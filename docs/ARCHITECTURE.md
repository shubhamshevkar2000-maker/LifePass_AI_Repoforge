# LifePass — Architecture

**Version:** 1.1  
**Status:** Frozen baseline

## 1. High-level architecture

```text
                    LIFE PASS
                        |
        +---------------+---------------+
        |                               |
 React Native + Expo              React Web Portal
   Citizen Mobile App              Institution Portal
        |                               |
        +---------------+---------------+
                        |
                    Supabase
        +---------------+---------------+
        |        |        |       |      |
      Auth   PostgreSQL Storage   RLS  Functions
       |
   Phone OTP + SMS provider
                        |
                Application Services
                        |
              Python AI/Document Service
                        |
          +-------------+-------------+
          |             |             |
        Intent       RAG/KB       Document AI
          |             |             |
          +-------------+-------------+
                        |
                 Matching Engine
                        |
                 Consent Workflow
                        |
                   Audit Layer
```

## 2. Frontend architecture

### User
React Native + Expo + TypeScript.

Responsibilities:
- UI
- navigation
- session handling
- record browsing
- uploads
- AI request submission
- displaying requirement/matching results
- consent interaction
- notifications

The client must not contain privileged secrets or authoritative security logic.

### Institution
React + TypeScript web application.

Responsibilities:
- institution authentication
- request creation
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

Supabase Auth is the authentication authority for LifePass phone-number OTP login. The SMS delivery provider is configured within the Auth layer. Citizen and institution clients only collect the phone number/OTP and consume the resulting authenticated session; they do not implement OTP generation or verification authority.

No second authentication provider or custom OTP database is introduced.
