# LifePass — Implementation Plan

**Version:** 1.1  
**Status:** Frozen baseline

## 1. Build strategy

Build in vertical slices.

Do not build four isolated products and integrate at the end.

First establish:
- authentication
- database
- record storage
- requirement profiles
- matching
- one AI flow
- consent
- institution view

Then expand.

## 2. Phase 0 — Repository and environment

Create:
- Git repository
- user app
- institution web app
- Supabase project
- Python AI service
- environment variable strategy

No secrets committed.

## 3. Phase 1 — Foundation

Implement:
- Supabase Auth
- phone-number OTP login with real SMS delivery through configured Auth provider
- OTP verification/session handling
- profiles
- user/institution roles
- base navigation
- database migrations
- RLS baseline

Acceptance:
- user can sign in using phone OTP
- OTP is actually delivered by SMS in the acceptance environment
- institution can sign in using the defined Auth flow
- incorrect/expired OTP fails
- unauthorized cross-user access fails

### Phase 1.5 — Authentication QA gate

Before moving to records, verify the complete phone OTP path in the target environment: phone input → real SMS → OTP verification → Supabase session → protected LifePass data. Do not replace this gate with a mock OTP for demo sign-off.

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

## 14. Team work allocation

### Member A
User mobile app.

### Member B
Supabase/database/backend.

### Member C
AI/document pipeline.

### Member D
Institution portal/integration/demo.

All members must understand:
- architecture
- data flow
- verification boundary
- consent flow

## 15. Development rule

Do not implement a later phase by violating an earlier contract.

When blocked:
1. Read relevant specs.
2. Identify dependency.
3. Fix the contract/schema first if necessary.
4. Then implement.
