# LifePass — Product Specification

**Version:** 1.1  
**Status:** Frozen baseline

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

### User mobile app
- Phone-number authentication with real OTP SMS
- OTP verification through Supabase Auth
- Home/dashboard
- My Records
- Record categories
- Add/upload record
- Record details
- AI assistant
- Requirements/readiness result
- Requests
- Request detail
- Consent screen
- Notifications
- Settings/profile

### Institution web portal
- Authentication
- Dashboard
- Applications/requests
- Create verification/request workflow
- Requirement checklist
- Applicant record package
- Request status
- Audit history
- Settings

## 6.5 Authentication requirement

LifePass authentication uses phone number + OTP through Supabase Auth. A valid authenticated session is required before protected records, requests, consent, or profile data can be accessed.

Real SMS delivery is required for the actual login acceptance path. A frontend-only or hard-coded OTP is not considered implemented authentication.

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
