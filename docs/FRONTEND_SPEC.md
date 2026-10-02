# LifePass — Frontend Specification

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE

# Part 0 — Landing & Authentication

## 1. Landing & Role Selection Screen
The entry point of the LifePass web application exposes the two-sided nature of the platform:
- **INDIVIDUAL PATH:**
  - Title: *"Personal Records & Life Tasks"*
  - Description: *"Manage your records, understand what you need, and share only what you approve."*
  - Action: **"Continue as Individual"**
- **INSTITUTION PATH:**
  - Title: *"Institution Access Portal"*
  - Description: *"Request and access authorized records from applicants through LifePass."*
  - Action: **"Continue as Institution"**

## 2. Authentication Model (Username & Password)
Both sides use straightforward, secure username/password credentials. Phone OTP login and Email-based login are retired.

### Individual Authentication:
- **Login:**
  - Portal Username
  - Password
- **Registration:**
  - Full Name
  - Official Contact Phone / Email
  - Identity / Account Details
  - Portal Username
  - Password & Confirm Password

### Institution Authentication:
- **Login:**
  - Portal Username
  - Password
- **Registration:**
  - Officer Full Name
  - Institution Name
  - Institution Type (Bank, University, Government Agency, Healthcare, Other)
  - Official Contact Phone
  - Portal Username
  - Password & Confirm Password

### Frontend Development Mode:
- The web application executes without live Supabase credentials (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) or backend network dependencies.
- Authentication state is isolated within a client-side `IAuthAdapter` (`MockAuthAdapter`).
- Non-sensitive session display data is saved to `localStorage` (`lifepass_mock_session`) so reloads persist the session without storing plaintext passwords.
- No Supabase configuration warnings or fake backend claims are rendered.

### Consent OTP Distinction:
- Login authentication operates via username and password.
- The separate temporary-access verification / OTP mechanism for authorizing institutional access to personal records remains part of the consent/security workflow and is distinct from login authentication.

# Part A — Individual Responsive Web Application

*(Active Target: `apps/web/**`. Note: The original native mobile app in `apps/mobile/**` is preserved as a legacy prototype reference; all active user feature work is implemented as responsive web).*

## 1. Technology & Design System
- React
- TypeScript
- Responsive Web CSS (`apps/web/**`)
- App-like layout adapting seamlessly to mobile web browsers, tablets, and desktop displays.
- Shared UI primitives: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, `Spinner`.

## 2. Navigation Architecture
```text
Landing Screen (Role Selection)
  ↓
Individual Auth (Login / Register)
  ↓
Individual Web Shell
 ├── Dashboard (Home & AI Task Entry)
 ├── Record Vault (My Records & Uploads)
 ├── AI Assistant & Requirements
 ├── Access Requests & Consent
 ├── Active Permissions & Audit
 └── Profile / Settings
```

## 3. Individual Dashboard
Primary entry screen for the record owner:
- **Greeting & Identity:** Personalized welcome with user handle and verified status indicator.
- **AI Task Input (Primary Interaction):**
  - Prompt: **"What are you trying to accomplish?"**
  - Input field with quick action prompts.
- **Suggested Life-Stage Tasks:**
  - **College Admission** *(Primary Hackathon Scenario)*
  - Job Application
  - Education Loan Application
  - Hospital Admission
- **Record & Verification Summary:** Quick count of active records, pending extractions, and verification statuses.
- **Active Permissions & Recent Activity:** List of institutions currently holding authorized access and recent audit events.

## 4. Record Vault (My Records)
Categories:
- Identity
- Education
- Employment
- Finance
- Healthcare

Features:
- Categorized record grid and list views.
- Upload UX supporting PDF, PNG, JPEG with file validation and progress feedback.
- Clear record statuses: `VERIFIED` (authoritative source only), `PENDING`, `UNVERIFIED`, `EXPIRED`, `REVOKED`.
- Never claim "Verified" merely because OCR or classification succeeded.

## 5. Record Detail View
Display:
- Document title & category
- Issuer field (if extracted)
- Issue date & expiry date (if available)
- LifePass processing status (`uploaded`, `processing`, `processed`, `needs_review`)
- External verification status (`not_verified`, `source_verified`, `verification_unavailable`)
- Source type and upload timestamp

## 6. AI Context Assistant & Requirements
Flow:
1. User enters life goal (e.g. *"I want to apply for university admission"*).
2. AI identifies structured task and retrieves requirement profile.
3. System matches against vault records.
4. UI displays:
   - Interpreted intent and requirement profile
   - Matched records (green badge)
   - Missing records (amber badge)
   - Attention items (expired or low confidence)
   - Readiness score (e.g. `80%`)
   - Human explanation of remaining steps
   - Primary action: "Review & Share" or "Upload Missing Records"

## 7. Requests & Consent
- **Request List:** Pending, Active, Completed, Expired.
- **Consent Review Screen:**
  - Clearly identifies requesting organization and purpose.
  - Displays exactly which records will be shared.
  - Expiry and duration terms.
  - Actions: **Allow** (grants temporary scoped access) or **Deny** (records remain private).
  - Explicit user consent only; no hidden or automated grants.

# Part B — Institution Web Portal

## 8. Technology
- React
- TypeScript
- Desktop and tablet optimized responsive web UI (`apps/web/**`).
- Authentication uses username and password model.

## 9. Navigation
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
