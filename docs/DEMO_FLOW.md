# LifePass — Demo Flow

**Version:** 1.1  
**Status:** Frozen baseline

## 1. Demo objective

Demonstrate the core differentiation:

**LifePass understands a life-stage task, identifies requirements, maps existing records, finds gaps, and enables consented structured sharing.**

Do not make the demo about document storage alone.

## 1.5 Login authentication

The demo begins with the real LifePass login flow:

1. User enters a phone number.
2. Supabase Auth sends an actual OTP through the configured SMS provider.
3. User enters the received OTP.
4. Supabase Auth verifies it.
5. User enters the authenticated LifePass app.

Do not present a fake OTP, hard-coded OTP, or UI-only “OTP sent” state as a successful authentication flow.

## 2. Demo account

Use a controlled demo account containing a small set of prepared records.

Example categories:
- Identity
- Education
- Finance

These are demo-account records.

Do not claim that the demo records were retrieved from DigiLocker or another external authority unless a real integration has been implemented.

## 3. User-initiated demo

### Step 1
User opens LifePass.

### Step 2
User sees:
> "What are you trying to do?"

### Step 3
User enters:
> "I want to apply for an education loan."

### Step 4
AI returns:
```text
Task: Education Loan
Domain: Finance
Institution type: Bank
```

### Step 5
Requirement Knowledge Layer returns the configured requirement profile.

Example:
- Identity proof
- Address proof
- Academic record
- Income proof
- Admission letter

### Step 6
LifePass searches demo user's records.

Example:
```text
✓ Identity proof
✓ Address proof
✓ Academic record
✓ Income proof
✗ Admission letter
```

### Step 7
Readiness:
`80%`

### Step 8
User opens details.

The system explains:
> "You have 4 of the 5 required records. Your admission letter is missing."

### Step 9
User selects review/share.

### Step 10
Consent screen:
- requesting organization
- purpose
- records
- expiry
- allow/deny

### Step 11
User allows.

### Step 12
Institution portal receives the structured consented package.

## 4. Organization-initiated demo

### Step 1
Institution logs in.

### Step 2
Select:
`Create Request`

### Step 3
Purpose:
`Education Loan Application`

### Step 4
Requirement profile:
`Education Loan`

### Step 5
Request is sent to user.

### Step 6
User opens notification/request.

### Step 7
LifePass maps available records.

### Step 8
User reviews and grants consent.

### Step 9
Institution dashboard updates.

## 5. Institution view

Show:
- applicant
- purpose
- requirement checklist
- matched records
- missing record
- consent status
- request status

Do not display:
> "Verified by LifePass"

Instead display statuses such as:
- processed
- source verification status if available
- missing
- attention needed

## 6. Judge question: "Is this DigiLocker?"

Answer:

> "DigiLocker provides the trusted document ecosystem and access to verified records. LifePass is designed as a context and workflow layer: it understands what the person is trying to accomplish, maps requirements to the records they already have, identifies gaps, and prepares a consented, structured package for the institution."

## 7. Judge question: "Can AI hallucinate?"

Answer:

> "AI is not the authority. It only understands intent, classifies/extracts document information and explains deterministic results. It cannot declare a document authentic, cannot invent requirements, and cannot approve an institutional decision."

## 8. Judge question: "What if the user denies access?"

Answer:

> "The institution receives no protected records. The request remains denied, and the user remains in control."

## 9. Demo failure fallback

If AI service fails:
- use an already-created structured demo request/result only if it is clearly a preconfigured demo state
- do not fabricate a live AI response
- keep the core UI functional

The demo should never depend on pretending a fake external integration is real.
