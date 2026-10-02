# LifePass — Backend Specification

**Version:** 1.1  
**Status:** Frozen baseline

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

### Institution Request Creation Rules

**1. Initial Request Status**
For `POST /institution/requests`, the newly created access request MUST have `status = "draft"`.
The workflow is:
`POST /institution/requests` (creates `draft`) → `POST /institution/requests/{id}/send` (transitions to `pending_user`).
Do not use `sent` or `pending_user` at initial creation.

**2. Institution Membership**
A user is considered an active institution member when a corresponding `institution_members` row exists for that institution and user.
Do not invent an `is_active`/`status` field or modify the database schema for membership status.

**3. Institution Request Creation Permission**
Any authenticated user with a valid `institution_members` row for the institution may create an access request.
The existing `role` value must NOT be interpreted as a permission hierarchy. Do not invent role names or role-based permissions.

**4. Atomic Request Creation Architecture**
Creating an access request and its `request_items` MUST be atomic.
The intended architecture is:
`Edge Function` → `PostgreSQL transaction function / RPC` → `INSERT access_requests` + `INSERT request_items` → `COMMIT`.
If either insertion fails, the entire operation rolls back. The Edge Function must NOT attempt to implement atomicity by making separate REST inserts. A PostgreSQL function/RPC created through a version-controlled Supabase migration is the allowed implementation mechanism.

**5. RPC Security Requirements**
The transaction function must:
- operate for the authenticated caller
- validate institution membership
- not trust an arbitrary `institution_id` without authorization
- not accept `user_id` as an ownership override
- create `request_items` only from authoritative requirements belonging to the selected requirement profile
- not create consent
- not grant record access
- not bypass record RLS

**6. Request Item Source**
`request_items` must be generated from the authoritative requirements associated with the selected requirement profile. Institutions cannot inject arbitrary requirement definitions during request creation.

**7. Consent Boundary**
Creating an `access_request` and its `request_items` does NOT:
- create consents
- grant access to records
- expose record contents
- mark records verified
- bypass record RLS


**8. Requester Identity**
The request creation architecture MUST derive the `requester_user_id` from the authenticated session (`auth.uid()`).
This value identifies the specific institution member who created the request.
The client MUST NOT supply the `requester_user_id`.
The derived `requester_user_id` MUST be verified as belonging to the target `institution_id` through `institution_members`.



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

### Deterministic Matching Rules

The following deterministic rules define exactly when a user's record satisfies a given requirement. These rules must be implemented in backend logic without reliance on LLM inference.

**1. DOCUMENT TYPE**
A requirement is eligible for matching when `records.document_type` exactly matches one of the values in `requirements.accepted_document_types`.
Do not introduce alias resolution or fuzzy document-type matching into the deterministic matcher.

**2. RECORD PROCESSING STATUS**
Only records with `status = "processed"` are eligible to satisfy a requirement.
Records with `status = "uploaded"` or `"processing"` are not considered ready matches because document processing/classification is incomplete.

**3. EXPIRY**
If `expiry_date` exists and `expiry_date` is before the current date, the record is not eligible.
No grace period is assumed unless explicitly represented in `requirements.rules`.
Records without an `expiry_date` are not rejected solely because the field is null.

**4. EXTERNAL VERIFICATION**
`external_verification_status` is NOT automatically treated as proof of authenticity by LifePass.
- A record with `source_rejected` cannot satisfy a requirement.
- A record with `not_verified` / pending verification may still satisfy a basic document-availability requirement if all other matching conditions pass.
- Its verification state must remain visible separately.
- If a future requirement explicitly requires verified status, that requirement must express this through its `rules` configuration. Do not invent such rules for existing seeded requirements whose rules object is `{}`.

**5. MULTIPLE ACCEPTED DOCUMENT TYPES**
If `accepted_document_types` contains multiple values, any one eligible matching type satisfies the requirement.
Example: `["passport", "national_id"]` means passport OR national_id.

**6. DUPLICATE / MULTIPLE CANDIDATES**
When multiple eligible records satisfy the same requirement, select the deterministic candidate using this order:
a. eligible verification state, preferring a positively verified source over unverified/pending;
b. latest `updated_at`;
c. record `id` as the final stable tie-breaker.
*(A `source_rejected` record is never eligible.)*

**7. MATCHING VS AUTHENTICITY**
The matching engine determines whether an eligible user-owned record satisfies a requirement.
It does NOT determine whether the document or its contents are authentic.
Authenticity remains the responsibility of the authoritative issuer/verification source.

**8. READINESS**
Keep the existing formula:
`required requirements matched / total required requirements × 100`
Optional requirements do not reduce readiness.

**9. SECURITY**
Matching may only consider records belonging to the authenticated user.
A client-supplied `user_id` must never determine ownership.

**10. AI BOUNDARY**
The deterministic matcher does not use an LLM to calculate:
- matched/unmatched status
- readiness percentage
- eligibility
- verification authenticity

AI may later assist with candidate retrieval or explanations, but the final deterministic eligibility rules remain authoritative.

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

**Institution-Side Notifications Rule**
Notifications for `consent approved/denied` target the specific institution member who created the request (the `requester_user_id`).
- They MUST NOT be broadcast to all members of the institution.
- The system MUST NOT rely on `audit_events` to determine the original requester.
- The requester must still be an active member of the request's institution to receive or view the notification.

## 12. AI output handling

All AI outputs must be validated before persistence/use.

Structured AI outputs must conform to schemas.

Free-form LLM output cannot directly modify:
- authorization
- consent
- verification status
- readiness
- institutional decision

## 13. Phone OTP authentication

Supabase Auth owns phone-number OTP authentication. The LifePass backend integrates with the authenticated Supabase session and does not generate or persist OTP codes.

Requirements:
- real SMS delivery through a configured Auth SMS provider
- OTP verification handled by Supabase Auth
- server-side authorization still required after authentication
- no OTP values stored in PostgreSQL or application tables
- no client-controlled authentication/role escalation
- Auth/provider expiration, resend limits, and anti-abuse controls must be respected

OTP success establishes authentication only; it does not grant access to another user's records or bypass RLS/consent rules.
