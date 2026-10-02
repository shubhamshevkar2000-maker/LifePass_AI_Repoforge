-- ============================================================
-- LIFEPASS AI — PHASE 3 DATABASE MIGRATION
-- Life-Stage Requirement Knowledge Base
-- ============================================================

-- 1. REQUIREMENT_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.requirement_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    task_code TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_requirement_profiles_task_code_version UNIQUE (task_code, version)
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_requirement_profiles_updated_at ON public.requirement_profiles;
CREATE TRIGGER trg_requirement_profiles_updated_at
    BEFORE UPDATE ON public.requirement_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. REQUIREMENTS TABLE
CREATE TABLE IF NOT EXISTS public.requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.requirement_profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT true,
    accepted_document_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_requirements_profile_code UNIQUE (profile_id, code)
);

-- Index for querying requirements by profile
CREATE INDEX IF NOT EXISTS idx_requirements_profile_id ON public.requirements(profile_id);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.requirement_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

-- Requirement profiles and requirements are controlled knowledge/shared data.
-- Normal authenticated users can READ them, but CANNOT modify them.
-- Modification is restricted to service roles or database administrators bypassing RLS.

-- Read access for authenticated users (and anon if needed, but keeping it to authenticated for now)
CREATE POLICY "requirement_profiles_read_all"
    ON public.requirement_profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "requirements_read_all"
    ON public.requirements
    FOR SELECT
    TO authenticated
    USING (true);

-- No INSERT/UPDATE/DELETE policies are created.
-- Ambiguity Report: The specifications do not define an admin model or specify who may author requirement definitions.
-- Therefore, we enforce strict controlled data rules by omitting write policies entirely.
-- Only service_role keys or direct DB administrators can modify the knowledge base.

-- 4. DEMO SEED DATA (from specifications)
-- Using UUIDs that are randomly generated but we can reference them if we use WITH queries or just standard inserts.

WITH profile_loan AS (
    INSERT INTO public.requirement_profiles (name, domain, task_code, version, description, status)
    VALUES ('Education Loan', 'finance', 'education_loan', '2026.1', 'Standard education loan application requirements', 'active')
    RETURNING id
),
profile_employment AS (
    INSERT INTO public.requirement_profiles (name, domain, task_code, version, description, status)
    VALUES ('Employment Onboarding', 'employment', 'employment_onboarding', '2026.1', 'Standard new employee document verification', 'active')
    RETURNING id
)
INSERT INTO public.requirements (profile_id, code, name, category, required, accepted_document_types, rules, display_order)
SELECT
    id, 'id_proof', 'Identity Proof', 'identity', true, '["passport", "national_id"]'::jsonb, '{}'::jsonb, 1
FROM profile_loan
UNION ALL
SELECT
    id, 'admission_letter', 'University Admission Letter', 'education', true, '["admission_letter"]'::jsonb, '{}'::jsonb, 2
FROM profile_loan
UNION ALL
SELECT
    id, 'id_proof', 'Identity Proof', 'identity', true, '["passport", "national_id"]'::jsonb, '{}'::jsonb, 1
FROM profile_employment
UNION ALL
SELECT
    id, 'degree_certificate', 'Degree Certificate', 'education', true, '["degree_certificate"]'::jsonb, '{}'::jsonb, 2
FROM profile_employment;
