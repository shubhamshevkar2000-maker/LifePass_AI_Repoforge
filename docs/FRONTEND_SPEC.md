# LifePass — Frontend Specification

**Version:** 1.1  
**Status:** Frozen baseline

# Part 0 — Authentication / Phone OTP

The login experience must support real phone-number OTP authentication.

### Required screens/states
- Enter phone number
- Sending OTP/loading
- OTP verification input
- Resend OTP state according to Auth/provider limits
- Invalid/expired OTP error
- Successful verification/loading session
- Authenticated app entry

The UI must never imply successful authentication before Supabase Auth confirms OTP verification. The client must not contain privileged secrets or implement its own OTP verification logic.

# Part A — User Mobile App

## 1. Technology
- React Native
- Expo
- TypeScript

## 2. Navigation

```text
Auth
  ↓
Home
 ├── My Records
 ├── AI Assistant
 ├── Requests
 ├── Notifications
 └── Profile/Settings
```

## 3. Home

Show:
- greeting
- current requests
- record categories
- AI task entry
- readiness/action cards where applicable

Primary CTA:
**"What are you trying to do?"**

## 4. My Records

Categories:
- Identity
- Education
- Employment
- Finance
- Healthcare

The MVP can initially implement only categories needed by the demo while keeping the data model extensible.

## 5. Record detail

Display:
- document title
- type
- issuer field if extracted
- dates if available
- processing status
- external verification status if available
- source type
- last updated

Never display "Verified" merely because OCR/classification succeeded.

## 6. AI Assistant

Example:
> "I want to apply for an education loan."

Show:
- interpreted task
- relevant requirements
- records found
- missing records
- attention items
- readiness

User can inspect before sharing.

## 7. Requests

Tabs/status:
- Pending
- Active
- Completed
- Expired

Request detail shows:
- organization
- purpose
- requested requirements
- selected records
- expiry
- consent action

## 8. Consent

Consent screen must clearly show:
- who is requesting
- why
- which records
- duration/expiry
- what will happen after approval

Actions:
- Allow
- Deny

No hidden consent.

# Part B — Institution Web Portal

## 9. Technology
- React
- TypeScript
- Desktop-first responsive web UI

Institution login uses the same Supabase Auth phone-number OTP security boundary; successful authentication is required before portal access.

## 10. Navigation

```text
Dashboard
Applications/Requests
Create Request
Verification/Record Package
Audit
Settings
```

## 11. Dashboard

Show:
- pending requests
- active applications
- completed workflows
- attention items

## 12. Create Request

Institution selects:
- applicant/user
- purpose
- requirement profile
- request expiry

The portal should not ask the institution to manually select every individual file if the requirement profile can define the required record categories.

## 13. Application view

Show:
- applicant
- purpose
- requirement checklist
- records matched to requirements
- missing/attention-needed items
- consent state
- access state

## 14. Record package

The institution sees only data permitted by consent and authorization.

The UI must distinguish:
- extracted information
- external verification status
- LifePass processing status

It must not claim LifePass authenticated the document.

## 15. Design principle

The UI should communicate:
**context → requirements → matching → consent → structured package**

rather than:
**upload everything → manually inspect everything**
