# LifePass AI — Workstream 2 Requests to Backend Owner

**Originating Workstream:** Workstream 2 (AI + Document Intelligence)  
**Target Workstream:** Workstream 1 (Backend + Database + Security)  
**Target Owner:** Nidhi  
**Status:** Formal Request Log  
**Authoritative Source of Truth:** `docs/DATABASE_SCHEMA.md`, `docs/API_CONTRACT.md`, `docs/DOCUMENT_PIPELINE.md`, `docs/BACKEND_SPEC.md`

---

## Protocol Rule

Per the LifePass distributed workstream architecture:
- Workstream 2 (AI) **must not directly modify** database migrations, PostgreSQL schemas, RLS policies, or Supabase Storage configurations.
- Any backend requirement discovered during AI stage planning is logged here with full architectural rationale, specification references, and proposed schemas.
- The Backend Owner (Nidhi) reviews, approves, and implements the requested migrations and APIs within Workstream 1.

---

## 1. Table Migration: `public.record_extractions`

- **Requested Item:** PostgreSQL table `public.record_extractions` and RLS policies.
- **Why AI Needs It:** The AI document processing pipeline (Stage AI-1) produces OCR text, classified document metadata, confidence scores, and pipeline version strings that must be persisted alongside user records.
- **Specification Reference:** `docs/DATABASE_SCHEMA.md` Section 3 (`record_extractions`), `docs/DOCUMENT_PIPELINE.md` Section 2 & 7.
- **Proposed Data Shape:**
  ```sql
  CREATE TABLE IF NOT EXISTS public.record_extractions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      record_id UUID NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
      extracted_text TEXT NOT NULL DEFAULT '',
      extracted_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      classification_confidence NUMERIC(4, 3) NULL,
      processing_version TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
  );

  ALTER TABLE public.record_extractions ENABLE ROW LEVEL SECURITY;

  -- User can read extraction of their own record
  CREATE POLICY "record_extractions_select_own"
      ON public.record_extractions FOR SELECT
      USING (
          EXISTS (
              SELECT 1 FROM public.records
              WHERE records.id = record_extractions.record_id
                AND records.user_id = auth.uid()
          )
      );

  -- Only backend/service_role can insert/update extractions
  -- (No client insert/update policy)
  ```
- **Blocking / Non-Blocking:** **Non-blocking for Stage AI-0**; **Blocking for Stage AI-1** live pipeline persistence.

---

## 2. Storage Capability: Signed Download URLs for AI Processing

- **Requested Item:** Server-side capability or Edge Function to generate time-limited signed download URLs for private document objects in Supabase Storage.
- **Why AI Needs It:** The Python AI service runs in an isolated processing container. When an intake event triggers processing for a record, the AI service needs a secure, short-lived signed URL (e.g. 5-minute expiry) to fetch the binary PDF/image for OCR.
- **Specification Reference:** `docs/SECURITY_CONSENT.md` Section 4 ("Storage security: Documents are private... use signed access rather than public buckets"), `docs/DOCUMENT_PIPELINE.md` Section 4.
- **Proposed Data Shape:**
  - Backend helper or endpoint returning:
    ```json
    {
      "signed_url": "https://<supabase-project>.supabase.co/storage/v1/object/sign/records/user-id/file.pdf?token=...",
      "expires_at": "2026-10-02T09:05:00Z"
    }
    ```
- **Blocking / Non-Blocking:** **Non-blocking for Stage AI-0**; **Blocking for Stage AI-1** real document intake.

---

## 3. Schema & Seed: `requirement_profiles` and `requirements`

- **Requested Item:** PostgreSQL tables `public.requirement_profiles` and `public.requirements` plus canonical MVP seed fixtures.
- **Why AI Needs It:** The AI requirement retrieval and semantic candidate matching engines (Stages AI-2 and AI-3) must query controlled, versioned requirement profiles to identify what documents are needed for a given task.
- **Specification Reference:** `docs/DATABASE_SCHEMA.md` Section 4 (`requirement_profiles`, `requirements`), `docs/DEMO_FLOW.md` Section 1 (Education Loan Golden Path).
- **Proposed Data Shape:**
  - Standard Education Loan profile (`task_code = 'education_loan'`) with 5 requirements:
    1. `ID_PROOF` (Identity Proof) — Required
    2. `ADDRESS_PROOF` (Address Proof) — Required
    3. `ACADEMIC_RECORD` (Academic Certificate / Degree) — Required
    4. `INCOME_PROOF` (Income Proof / Tax Return) — Required
    5. `ADMISSION_LETTER` (University Admission Letter) — Required
- **Blocking / Non-Blocking:** **Non-blocking for Stage AI-0**; **Blocking for Stage AI-3** candidate retrieval.

---

## 4. Backend Matching Engine: `POST /matching/evaluate`

- **Requested Item:** Deterministic readiness evaluation endpoint or module.
- **Why AI Needs It:** AI assists by retrieving candidate records via FAISS semantic search and metadata filters. The final readiness score and match states (`matched`, `missing`, `attention_needed`) must be computed by deterministic backend logic per the product specification.
- **Specification Reference:** `docs/API_CONTRACT.md` Section 5 (`POST /matching/evaluate`), `docs/BACKEND_SPEC.md` Section 3 (`readiness = matched_required / total_required * 100`).
- **Proposed Data Shape:**
  - Input: `{ "user_id": "uuid", "requirement_profile_id": "uuid" }`
  - Output:
    ```json
    {
      "readiness_percent": 80,
      "matched": [...],
      "missing": [...],
      "attention_needed": []
    }
    ```
- **Blocking / Non-Blocking:** **Non-blocking for Stage AI-0**; **Blocking for Stage AI-3 / AI-4** Golden Path demo verification.
