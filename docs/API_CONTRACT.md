# LifePass — API Contract

**Version:** 1.1  
**Status:** Frozen baseline

## 1. Contract principles

- JSON request/response format.
- Authenticated endpoints require a valid Supabase session.
- Authorization is enforced server-side.
- Stable error codes.
- No secret values in responses.
- API contract changes require updating this file first.

## 2. Authentication

Authentication is handled by Supabase Auth using phone-number OTP.

### Phone OTP flow

1. Client submits a phone number to Supabase Auth OTP sign-in.
2. Supabase Auth requests delivery through the configured SMS provider.
3. The user enters the OTP received by SMS.
4. Supabase Auth verifies the OTP and establishes the authenticated session.
5. Protected LifePass server-side functions/services receive the authenticated session token.

LifePass must not expose a custom OTP verification authority or store OTP codes in the application database.

The LifePass API does not require separate custom `/auth/otp/*` endpoints; authentication remains owned by Supabase Auth.

Clients send the authenticated session token to protected server-side functions/services.

## 3. User endpoints

### GET /profile
Returns current user profile.

### PATCH /profile
Updates allowed profile fields.

### GET /records
Returns the authenticated user's records.

### POST /records
Creates record metadata after upload initialization.

### GET /records/{id}
Returns record metadata and permitted processing status.

### POST /records/{id}/process
Starts document processing.

### DELETE /records/{id}
Archives/removes the user's record according to retention policy.

### GET /requests
Purpose:
Return access requests addressed to the authenticated citizen.

- Authentication: Supabase Auth JWT required.
- Authorization: Enforced securely via PostgreSQL RLS `user_id = auth.uid()`.
- Ownership isolation: Returns only requests assigned to the authenticated user.
- Response shape:
```json
{
  "requests": [
    {
      "id": "uuid",
      "institution_id": "uuid",
      "institution_name": "string",
      "purpose": "string",
      "status": "string",
      "raw_status": "string",
      "requirement_profile_id": "uuid",
      "requirement_profile_name": "string",
      "requested_requirements": [],
      "selected_records": [],
      "created_at": "timestamp",
      "expires_at": "timestamp"
    }
  ]
}
```

### GET /requests/{id}
Purpose:
Return one access request only when it belongs to the authenticated citizen.

- Authentication: Supabase Auth JWT required.
- Authorization: Enforced securely via PostgreSQL RLS `user_id = auth.uid()`.
- Ownership isolation: If a citizen requests another citizen's ID, returns `NOT_FOUND` (404).
- Response shape:
```json
{
  "request": {
    "id": "uuid",
    "institution_id": "uuid",
    "institution_name": "string",
    ...
  }
}
```

## 4. AI endpoints

### POST /ai/intent

Request:
```json
{
  "message": "I want to apply for an education loan."
}
```

Response:
```json
{
  "intent": "loan_application",
  "task": "education_loan",
  "domain": "finance",
  "institution_type": "bank",
  "confidence": 0.94
}
```

### POST /ai/requirements

Request:
```json
{
  "task": "education_loan"
}
```

Response:
```json
{
  "profile_id": "uuid",
  "version": "2026.1",
  "requirements": []
}
```

### POST /ai/explain

Request contains deterministic result data.

The service returns user-readable explanation only.

## 5. Matching endpoint

### POST /matching/evaluate

Request:
```json
{
  "user_id": "uuid",
  "requirement_profile_id": "uuid"
}
```

The authenticated service derives authorized records.

Response:
```json
{
  "readiness_percent": 80,
  "matched": [],
  "missing": [],
  "attention_needed": []
}
```

The readiness value is calculated by backend logic.

## 6. Institution endpoints

### GET /institution/dashboard

### POST /institution/requests

Request:
```json
{
  "user_id": "uuid",
  "requirement_profile_id": "uuid",
  "purpose": "Education loan application",
  "expires_at": "timestamp"
}
```

### GET /institution/requests/{id}

Returns request state and only information authorized by policy.

### POST /institution/requests/{id}/send

Sends a request to the user.

## 7. Consent endpoints

### POST /requests/{id}/consent

Request:
```json
{
  "decision": "grant",
  "selected_record_ids": ["uuid"]
}
```

### POST /consents/{id}/revoke

No client may directly modify database consent state without authorization checks.

## 8. Errors

Example:
```json
{
  "error": {
    "code": "CONSENT_REQUIRED",
    "message": "User consent is required before accessing the requested records.",
    "request_id": "uuid"
  }
}
```

Common codes:
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `NOT_FOUND`
- `INVALID_INPUT`
- `CONSENT_REQUIRED`
- `REQUEST_EXPIRED`
- `RECORD_PROCESSING`
- `AI_UNAVAILABLE`
- `REQUIREMENT_PROFILE_NOT_FOUND`
- `PROCESSING_FAILED`

## 9. API security

Never trust:
- user_id supplied by client
- institution_id supplied by client
- role supplied by client
- record ownership supplied by client
- verification status supplied by client

Derive/validate these server-side.

## 10. External integrations

No endpoint may claim a real external integration unless it is actually configured and authorized.

Demo endpoints must be clearly namespaced or documented as demo functionality.
