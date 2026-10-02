# LifePass — Backend Specification

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE

## 1. Backend responsibilities

The backend is responsible for:
- authentication integration
- authorization
- records and metadata
- requirement profiles
- requests
- consent
- matching
- audit logs
- AI-service orchestration
- notifications
- institution workflows

## 2. Service boundaries

### Supabase
Primary persistence and application platform.

### Edge Functions
Use for:
- authenticated server-side endpoints
- lightweight orchestration
- secure third-party calls
- consent/package generation
- webhooks where needed

### Python service
Use for:
- OCR
- document processing
- AI inference
- embeddings
- retrieval pipelines

Heavy/long-running processing must not be forced into a short-lived Edge Function.

## 3. Business logic

### Requirement matching

Inputs:
- requirement profile
- user's records

For every requirement:
- identify candidate records
- apply metadata filters
- check record status
- check expiry if applicable
- determine matched/missing/attention-needed

The LLM may assist retrieval/classification but cannot directly set final match state.

### Readiness

For MVP:

```text
readiness = matched_required_items / total_required_items * 100
```

Only required items are included in the denominator.

Optional items are displayed separately and do not reduce readiness.

If a requirement has a source verification status requirement and no acceptable status exists, mark it `attention_needed` or `unmet` according to the requirement configuration.

## 4. Record statuses

Suggested states:
- `uploaded`
- `processing`
- `processed`
- `needs_review`
- `expired`
- `archived`

External verification status is separate:
- `not_verified`
- `source_verified`
- `source_rejected`
- `verification_unavailable`

LifePass must not convert `processed` into `source_verified`.

## 5. Request states

- `draft`
- `sent`
- `pending_user`
- `approved`
- `partially_approved`
- `denied`
- `expired`
- `completed`
- `revoked`

## 6. Consent states

- `pending`
- `granted`
- `denied`
- `revoked`
- `expired`

Consent must specify:
- requester
- user
- purpose
- requested record categories/records
- creation time
- expiry
- status

## 7. Matching pipeline

```text
Requirement
   |
   v
Candidate retrieval
   |
   +--> metadata filtering
   |
   +--> ownership/user scope
   |
   +--> record status
   |
   +--> expiry rules
   |
   v
Deterministic match result
```

Semantic similarity alone must never be sufficient to mark a record as matched.

## 8. Error handling

Every service should return:
- stable error code
- human-readable message
- optional field/context information
- correlation/request ID

Never expose:
- database credentials
- service keys
- internal stack traces
- private prompt/system data

## 9. Idempotency

Upload processing, consent actions and package creation should avoid accidental duplicate side effects.

Repeated consent submission should result in a safe existing-state response rather than multiple conflicting grants.

## 10. Authorization

A user can access only their own records.

An institution can access:
- records explicitly included in a valid consent
- records associated with its authorized request
- only for the permitted purpose and duration

Administrative/service roles must be explicitly modeled rather than inferred from client data.

## 11. Notifications

Notifications are generated for:
- new institution request
- consent decision needed
- consent approved/denied
- request expiry
- processing completed
- important record status change

## 12. AI output handling

All AI outputs must be validated before persistence/use.

Structured AI outputs must conform to schemas.

Free-form LLM output cannot directly modify:
- authorization
- consent
- verification status
- readiness
- institutional decision

## 13. Authentication integration

Supabase Auth owns user and institution authentication based on a **Username and Password** credential model.
The LifePass backend integrates with the authenticated Supabase session and does not persist plaintext passwords or implement insecure custom authentication tables.

Requirements:
- Clean username and password validation during authentication
- Server-side authorization still required after authentication
- No plain-text passwords stored in application tables or logs
- No client-controlled role escalation
- Auth-side rate-limiting and anti-abuse controls must be respected
- Login success establishes authentication only; it does not grant access to another user's records or bypass RLS/consent rules.
- **Consent OTP Distinction:** The separate temporary-access verification / OTP mechanism used during institutional record sharing remains part of the consent/security workflow and is distinct from login authentication.
