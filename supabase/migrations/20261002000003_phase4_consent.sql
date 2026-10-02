-- ============================================================
-- LIFEPASS AI — PHASE 4 DATABASE MIGRATION
-- Access Requests, Request Items, Consents
-- ============================================================

-- 1. ACCESS_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requirement_profile_id UUID NOT NULL REFERENCES public.requirement_profiles(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_access_requests_updated_at ON public.access_requests;
CREATE TRIGGER trg_access_requests_updated_at
    BEFORE UPDATE ON public.access_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON public.access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_institution_id ON public.access_requests(institution_id);

-- 2. REQUEST_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.access_requests(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES public.requirements(id) ON DELETE CASCADE,
    record_id UUID REFERENCES public.records(id) ON DELETE SET NULL,
    match_status TEXT NOT NULL,
    user_decision TEXT
);

CREATE INDEX IF NOT EXISTS idx_request_items_request_id ON public.request_items(request_id);

-- 3. CONSENTS TABLE
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.access_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL,
    granted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_consents_user_id ON public.consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_request_id ON public.consents(request_id);
CREATE INDEX IF NOT EXISTS idx_consents_institution_id ON public.consents(institution_id);

-- 4. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- ACCESS_REQUESTS POLICIES --

-- User access
CREATE POLICY "access_requests_select_user"
    ON public.access_requests FOR SELECT TO authenticated
    USING (user_id = auth.uid());
CREATE POLICY "access_requests_update_user"
    ON public.access_requests FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Institution access
CREATE POLICY "access_requests_select_inst"
    ON public.access_requests FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = auth.uid() AND institution_id = access_requests.institution_id));
CREATE POLICY "access_requests_insert_inst"
    ON public.access_requests FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = auth.uid() AND institution_id = access_requests.institution_id));
CREATE POLICY "access_requests_update_inst"
    ON public.access_requests FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = auth.uid() AND institution_id = access_requests.institution_id));


-- REQUEST_ITEMS POLICIES --

-- User access
CREATE POLICY "request_items_select_user"
    ON public.request_items FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.access_requests WHERE id = request_items.request_id AND user_id = auth.uid()));
CREATE POLICY "request_items_update_user"
    ON public.request_items FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.access_requests WHERE id = request_items.request_id AND user_id = auth.uid()));

-- Institution access
CREATE POLICY "request_items_select_inst"
    ON public.request_items FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.access_requests ar
        JOIN public.institution_members im ON ar.institution_id = im.institution_id
        WHERE ar.id = request_items.request_id AND im.user_id = auth.uid()
    ));
CREATE POLICY "request_items_insert_inst"
    ON public.request_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.access_requests ar
        JOIN public.institution_members im ON ar.institution_id = im.institution_id
        WHERE ar.id = request_items.request_id AND im.user_id = auth.uid()
    ));
CREATE POLICY "request_items_update_inst"
    ON public.request_items FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.access_requests ar
        JOIN public.institution_members im ON ar.institution_id = im.institution_id
        WHERE ar.id = request_items.request_id AND im.user_id = auth.uid()
    ));


-- CONSENTS POLICIES --

-- User access
CREATE POLICY "consents_select_user"
    ON public.consents FOR SELECT TO authenticated
    USING (user_id = auth.uid());
CREATE POLICY "consents_insert_user"
    ON public.consents FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "consents_update_user"
    ON public.consents FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Institution access
CREATE POLICY "consents_select_inst"
    ON public.consents FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = auth.uid() AND institution_id = consents.institution_id));

-- 5. RECORD SHARING POLICY
-- Allows institution members to access a user's records if a valid consent exists.
-- A valid consent must be granted, not expired, not revoked, and the record must be
-- explicitly attached to the corresponding request as a request item.
CREATE POLICY "records_select_institution_consent"
    ON public.records FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.consents c
            JOIN public.request_items ri ON c.request_id = ri.request_id
            JOIN public.institution_members im ON c.institution_id = im.institution_id
            WHERE ri.record_id = records.id
            AND im.user_id = auth.uid()
            AND c.status = 'granted'
            AND (c.expires_at IS NULL OR c.expires_at > now())
            AND c.revoked_at IS NULL
            AND c.user_id = records.user_id -- CRITICAL: consent must be from the record owner
        )
    );
