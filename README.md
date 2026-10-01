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

- **Current Phase:** Phase 0.1 — Monorepo / Workspace Initialization & Environment Foundation
- **Phase Status:** VERIFIED
- **Business Logic Status:** NOT STARTED (Reserved for Phase 1+)

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
