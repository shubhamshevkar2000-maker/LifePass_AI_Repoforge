# LifePass — Security & Consent

**Version:** 1.1  
**Status:** Frozen baseline

## 1. Security principles

1. Least privilege.
2. Explicit user consent.
3. Server-side authorization.
4. Private document storage.
5. RLS for database isolation.
6. No secrets in client applications.
7. Auditable access.
8. AI cannot grant access.
9. AI cannot establish authenticity.
10. Only necessary records should be shared.

## 2. Authentication

Supabase Auth manages authentication.

The application must distinguish:
- citizen/user
- institution member
- authorized service/admin role

Role claims must not be trusted merely because the frontend sends them.

## 2.5 Phone OTP security

Supabase Auth manages phone-number OTP authentication.

Security requirements:
- OTP is delivered via an actually configured SMS provider.
- OTP verification is performed by Supabase Auth, not by frontend business logic.
- LifePass does not store OTP codes in PostgreSQL, client storage, or logs.
- OTP/session details must not be exposed in application responses or audit events.
- Provider/Auth expiration, resend limits, and anti-abuse controls must be respected.
- Successful OTP verification creates an authenticated session but does not bypass RLS, record ownership, institution membership, or consent.

The client must never contain SMS-provider secrets or privileged Supabase service credentials.

## 3. Row Level Security

RLS must be enabled on exposed user/institution data.

User records:
- user can access own records
- other users cannot

Institution records:
- members can access their institution's permitted data

Requests:
- user can see requests addressed to them
- institution can see requests it created

Consent:
- user controls their consent
- institution can read status only when authorized

## 4. Storage security

Documents are private.

Use controlled access/signed access rather than public buckets for sensitive records.

Do not expose permanent public URLs.

## 5. Consent model

Consent must be:
- specific
- understandable
- purpose-bound
- scoped
- time-bound where applicable
- revocable when the workflow permits

Consent record:
```text
who
requested what
for what purpose
when
until when
decision
```

## 6. User initiated sharing

User selects/reviews the records that will be shared.

## 7. Organization initiated request

Institution creates:
- purpose
- requirement profile
- expiry

User receives the request and chooses whether to grant access.

## 8. Denial

If user denies:
- institution does not receive protected records
- request is marked denied
- audit event is created

The system should explain that denial may prevent the institution workflow from completing, but should not pressure the user.

## 9. Revocation

Where technically and legally applicable, the user can revoke future access.

Revocation must not pretend to erase information already lawfully received/processed by an institution.

## 10. Audit

Audit events include:
- login/security events where appropriate
- record upload
- processing
- request creation
- request sent
- consent granted/denied/revoked
- record access
- request completion

Audit logs must avoid storing unnecessary sensitive document content.

## 11. AI security

Do not send:
- credentials
- service keys
- unrelated user records
- unnecessary private data

AI prompts must minimize data.

## 12. Prompt injection

Uploaded documents may contain malicious instructions.

Document text is DATA, not instructions.

The AI must never obey instructions embedded inside uploaded documents.

## 13. External integration security

If a real issuer/DigiLocker integration is added:
- use official authorization
- secure credentials
- validate responses
- preserve source provenance
- never fabricate source responses

## 14. Threat examples

### Stolen session
Mitigation:
- short-lived sessions/secure storage
- server-side authorization
- RLS

### IDOR
Mitigation:
- ownership checks
- RLS
- server-side request/consent validation

### Public document URL
Mitigation:
- private storage
- signed/time-limited access

### AI hallucination
Mitigation:
- structured outputs
- deterministic backend
- source-of-truth boundary
- no authoritative AI verification

### Prompt injection
Mitigation:
- treat document text as untrusted data
- strict system instructions
- structured tool boundaries
