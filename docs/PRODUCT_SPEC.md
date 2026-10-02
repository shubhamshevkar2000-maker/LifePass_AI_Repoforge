# LifePass — Product Specification

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE

## 1. Product definition

LifePass AI is a unified life-stage record intelligence and orchestration platform.

It helps people reuse their existing verified/trusted records across tasks such as education, employment and finance without requiring them to manually understand which records are relevant for every workflow.

It is not intended to replace DigiLocker, original issuers, institutional decision systems or authoritative verification systems.

## 2. Core problem

People accumulate records across education, employment, finance, healthcare and identity systems.

The problem LifePass addresses is not simply "where are my documents?"

The problem is:

- What do I need for the task I am trying to complete?
- Which of my existing records are relevant?
- What is missing?
- Which records can I securely share?
- How can an institution receive a structured, requirement-aware package instead of a random collection of files?

## 3. Product promise

### User
**Tell LifePass what you are trying to accomplish; LifePass identifies the relevant requirements, finds the records you already have, highlights gaps and helps you securely use them.**

### Institution
**Define the purpose and requirements; LifePass maps the applicant's available records to those requirements and prepares a structured, consented record package.**

## 4. Target users

### Citizen/user
A person moving through life-stage workflows:
- student
- graduate
- job applicant
- employee
- borrower/applicant
- other users with recurring document workflows

### Institution
Organizations that need structured records for workflows:
- colleges/universities
- employers
- banks/financial institutions
- other authorized organizations

The prototype will demonstrate selected education and finance workflows rather than attempting every possible domain.

## 5. Primary prototype workflows

### Workflow A — User initiated
1. User logs in.
2. User asks LifePass what they need for a task.
3. AI identifies intent.
4. Requirement Knowledge Layer retrieves the applicable requirement profile.
5. LifePass searches the user's records.
6. Deterministic matching calculates found/missing/attention-needed items.
7. User reviews.
8. User consents.
9. Relevant package becomes available to the intended organization.

### Workflow B — Organization initiated
1. Institution logs into portal.
2. Institution selects/creates a workflow purpose.
3. Requirement profile is attached.
4. User receives a request.
5. LifePass maps relevant records.
6. User reviews requested scope.
7. User grants or denies consent.
8. Institution receives only the permitted package.
9. Audit event is recorded.

## 6. MVP features

### Individual responsive web application
*(Active frontend target: `apps/web/**`. Note: The original native mobile app in `apps/mobile/**` is preserved as a legacy prototype reference; all active user feature work is implemented as responsive web).*
- Username and password authentication (with registration)
- Home / Dashboard (greeting, "What are you trying to accomplish?", primary hackathon scenario: College Admission)
- Record Vault / My Records (categories: Identity, Education, Employment, Finance, Healthcare)
- Add/upload record (MIME check, secure storage upload)
- Record details (metadata, processing status, external verification status)
- AI Context Assistant (intent parsing, requirement retrieval, structured matching, explanations)
- Requirements & readiness result display
- Requests & access requests
- Request detail & structured review
- Consent review screen (specific, time-bound, allow/deny)
- Notifications & audit activity
- Settings & profile

### Institution web portal
- Authentication (Username and password login & registration)
- Dashboard
- Applications/requests
- Create verification/request workflow
- Requirement checklist
- Applicant record package
- Request status
- Audit history
- Settings

## 6.5 Authentication requirement

LifePass uses **Username and Password** authentication across both user types:
- **Individual:** Personal registration (full name, username, password, confirm password, contact phone/info) and login (username, password).
- **Institution:** Officer registration (full name, institution name, institution type, official contact phone, portal username, password, confirm password) and login (username, password).
- **No Phone OTP login; No Email login.**
- **Consent OTP Distinction:** The separate temporary-access verification / OTP mechanism for authorizing institutional access to personal records remains part of the consent/security workflow and is distinct from login authentication.
- **Frontend Development Mode:** In frontend development, client-side authentication adapters isolate the UI from backend/Supabase credentials with zero configuration warnings.

## 7. AI features

AI is used for:
- intent understanding
- life-stage/task classification
- document classification
- metadata extraction
- semantic requirement/record retrieval
- explanation

AI is NOT used for:
- authoritative authenticity decisions
- institutional approvals
- arbitrary factual verification
- final legal/compliance decisions

## 8. Readiness

Readiness is a system calculation, not an LLM opinion.

Example:

Required items = 5  
Matched usable items = 4  
Missing = 1  
Readiness = 80%

The exact formula is defined in `BACKEND_SPEC.md`.

## 9. Non-goals

The MVP will not:
- become a replacement for DigiLocker
- issue government/university certificates
- independently certify document authenticity
- make loan/admission/employment decisions
- create fake government integrations
- support every life-stage workflow
- implement unnecessary blockchain infrastructure
- build a custom identity standard from scratch
- use an LLM as the source of truth for requirements

## 10. Product principles

1. User remains in control of sharing.
2. Original issuer remains authoritative.
3. AI assists; deterministic logic decides system state.
4. Requirements come from a controlled knowledge base.
5. Minimum necessary information should be shared.
6. Every sensitive access action should be auditable.
7. Demo integrations must never be represented as real integrations.
8. Simplicity is preferred over unnecessary infrastructure.
