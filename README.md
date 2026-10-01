# LifePass AI

Unified Life-Stage Digital Identity & Record Network

Enterprise-oriented, AI-assisted, consent-driven, two-sided digital record and verification platform.

---

## Specification Source of Truth

The 13 frozen specification files in [`docs/`](./docs) are the authoritative source of truth for LifePass AI:

1. `MASTER_README.md`
2. `PRODUCT_SPEC.md`
3. `ARCHITECTURE.md`
4. `FRONTEND_SPEC.md`
5. `BACKEND_SPEC.md`
6. `API_CONTRACT.md`
7. `DATABASE_SCHEMA.md`
8. `DOCUMENT_PIPELINE.md`
9. `AI_AGENT_SPEC.md`
10. `SECURITY_CONSENT.md`
11. `DEMO_FLOW.md`
12. `IMPLEMENTATION_PLAN.md`
13. `TESTING_QA.md`

Every architectural decision, API contract, security rule, and implementation detail must conform strictly to these specification documents.

---

## Workspace Directory Structure

```text
LifePass_AI_RepoForge/
├── apps/
│   ├── mobile/         # Citizen Mobile App (React Native, Expo, TypeScript)
│   └── web/            # Institution Web Portal (React, Vite, TypeScript)
├── services/
│   └── ai/             # Document Intelligence & AI Service (Python 3.11, FastAPI)
├── supabase/           # PostgreSQL Migrations, Edge Functions, Config
├── packages/
│   └── shared/         # Shared TypeScript Types & Data Contracts
├── docs/               # 13 Authoritative Specification Markdown Files
├── .env.example        # Environment variable template
├── README.md           # Master project documentation
└── LIFEPASS_BUILD_STATE.md  # Permanent project handoff & build state log
```

---

## Current Status

- **Baseline Phase:** Phase 1 — Authentication + Database Foundation
- **Phase Status:** VERIFIED & PUSHED TO MAIN (Commit `1f86c36`)
- **Shared Baseline:** All team members pull `main` to branch into their respective workstreams.

---

## Team Workstreams & Ownership Model

The project has transitioned to parallel, independent workstreams built upon the Phase 1 shared baseline:

### Workstream 1: Backend + Database + Security
- **Owner:** Nidhi
- **Scope:** Supabase PostgreSQL, migrations, auth integration, RLS, storage/security, backend APIs, record management, requirement data, deterministic matching/readiness logic, access requests, consent, permission management, audit events.
- **Rule:** Database changes must be version-controlled strictly through Supabase migrations.

### Workstream 2: AI + Document Intelligence
- **Owner:** AI Teammate
- **Scope:** Intent understanding, life-stage/task understanding, requirement retrieval/RAG, OCR/document processing, classification, metadata extraction, AI orchestration, structured outputs, prompt-injection defense.
- **Rule:** Must follow `AI_AGENT_SPEC.md`; AI never makes authoritative verification, consent, or deterministic readiness decisions.

### Workstream 3: Client Applications (Mobile + Web)
- **Owner:** Frontend Teammate
- **Scope:** Citizen Mobile App (React Native/Expo) and Institution Web Portal (React/Vite).
- **Rule:** Both clients share the same backend, database, auth model, and API contracts. Follow `FRONTEND_SPEC.md`.

### Workstream 4: Integration + QA + DevOps
- **Owner:** Integration/QA Teammate
- **Scope:** Connect clients to backend, backend to AI, end-to-end integration tests, RLS verification, Docker environment management, regression testing.

### Git Branching Model
```text
main (Phase 1 Baseline)
 ├── feature/backend  (Workstream 1: Nidhi)
 ├── feature/ai       (Workstream 2: AI Teammate)
 ├── feature/client   (Workstream 3: Frontend Teammate)
 └── feature/qa       (Workstream 4: Integration/QA)
```
- Pull latest `main` baseline before starting.
- Create feature branches per task/workstream.
- Open PRs with automated tests passing.
- The 13 Markdown specifications in `docs/` remain the single source of truth.

---

## Development & Verification Commands

### JS/TS Workspace Dependencies Installation
```bash
cmd /c npm install
```

### Citizen Mobile App Check (`apps/mobile`)
```bash
cmd /c npm run mobile:check
```

### Institution Web Portal Build Check (`apps/web`)
```bash
cmd /c npm run web:build
```

### Shared Package Build (`packages/shared`)
```bash
cmd /c npm run shared:build
```

### Python AI Service Verification (`services/ai`)
```bash
cd services/ai
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
pytest
```
