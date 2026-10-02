-- ============================================================
-- LIFEPASS AI — PHASE 2 DATABASE MIGRATION
-- Records and Record Extractions
-- ============================================================

-- ------------------------------------------------------------
-- 1. RECORDS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    document_type TEXT NOT NULL,
    issuer_name TEXT,
    issue_date DATE,
    expiry_date DATE,
    status TEXT NOT NULL,
    external_verification_status TEXT NOT NULL,
    source_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_records_user_id ON public.records(user_id);

DROP TRIGGER IF EXISTS trg_records_updated_at ON public.records;
CREATE TRIGGER trg_records_updated_at
    BEFORE UPDATE ON public.records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------
-- 2. RECORD_EXTRACTIONS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.record_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.records(id) ON DELETE CASCADE,
    extracted_text TEXT NOT NULL,
    extracted_metadata JSONB DEFAULT '{}'::jsonb,
    classification_confidence NUMERIC,
    processing_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_record_extractions_record_id ON public.record_extractions(record_id);

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_extractions ENABLE ROW LEVEL SECURITY;

-- RECORDS POLICIES
CREATE POLICY "records_select_own"
    ON public.records
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "records_insert_own"
    ON public.records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "records_update_own"
    ON public.records
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "records_delete_own"
    ON public.records
    FOR DELETE
    USING (auth.uid() = user_id);

-- RECORD_EXTRACTIONS POLICIES
CREATE POLICY "record_extractions_select_own"
    ON public.record_extractions
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.records WHERE id = public.record_extractions.record_id AND user_id = auth.uid()));

CREATE POLICY "record_extractions_insert_own"
    ON public.record_extractions
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.records WHERE id = public.record_extractions.record_id AND user_id = auth.uid()));

CREATE POLICY "record_extractions_update_own"
    ON public.record_extractions
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.records WHERE id = public.record_extractions.record_id AND user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.records WHERE id = public.record_extractions.record_id AND user_id = auth.uid()));

CREATE POLICY "record_extractions_delete_own"
    ON public.record_extractions
    FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.records WHERE id = public.record_extractions.record_id AND user_id = auth.uid()));
