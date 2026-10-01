# LifePass — Master Specification

**Version:** 1.1  
**Status:** FROZEN BASELINE  
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
8. `FRONTEND_SPEC.md` — user mobile app and institution web portal.
9. `IMPLEMENTATION_PLAN.md` — build order, milestones and ownership.
10. `PRODUCT_SPEC.md` — product scope, users, features and non-goals.
11. `SECURITY_CONSENT.md` — security, authorization, consent and audit rules.
12. `TESTING_QA.md` — acceptance criteria, tests and failure cases.

Authentication amendment:
- Supabase Auth phone-number OTP is the required login verification mechanism.
- OTP delivery must use an actually configured SMS provider; frontend-only/mock OTP is not acceptable.
- OTP codes are verified by Supabase Auth and are not stored in the LifePass application database.

## Technology baseline

### Citizen application
- React Native
- Expo
- TypeScript

### Institution application
- React
- TypeScript
- Web application
- Desktop-first responsive interface

### Platform/backend
- Supabase
- PostgreSQL
- Supabase Auth (phone-number OTP for login verification)
- Supabase Storage
- Row Level Security (RLS)
- Supabase Edge Functions where suitable
- Python AI/document-processing service where Python libraries or model workflows are required

Supabase officially supports Expo/React Native and provides Postgres, Auth, Storage, RLS and Edge Functions. See the official documentation before implementation.

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

## OTP authentication requirement

LifePass login must use real phone-number OTP authentication through Supabase Auth.

Required flow:
```text
Enter phone number
    ↓
Request OTP
    ↓
Actual SMS delivered by configured SMS provider
    ↓
Enter OTP
    ↓
Supabase Auth verifies OTP
    ↓
Authenticated session
    ↓
LifePass application
```

The client must not implement its own OTP generation, persistence, or verification authority. OTP values must not be stored in PostgreSQL, AsyncStorage, localStorage, or other client persistence. Provider/Auth-side expiration and abuse controls must be respected.

A demo/development environment may use provider-supported test mechanisms only when clearly documented; the real acceptance path requires an actual SMS OTP flow.
