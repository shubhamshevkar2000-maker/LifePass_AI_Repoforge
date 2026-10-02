-- ============================================================
-- LIFEPASS AI — PHASE 5 DATABASE MIGRATION
-- Audit Events and Notifications
-- ============================================================

-- 1. AUDIT_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    request_id UUID REFERENCES public.access_requests(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON public.audit_events(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_institution ON public.audit_events(institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_request ON public.audit_events(request_id);

-- 2. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- AUDIT_EVENTS POLICIES --

-- User access: Can read their own actions
CREATE POLICY "audit_events_select_user"
    ON public.audit_events FOR SELECT TO authenticated
    USING (actor_user_id = auth.uid());

-- Institution access: Can read actions related to their institution
CREATE POLICY "audit_events_select_inst"
    ON public.audit_events FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.institution_members WHERE user_id = auth.uid() AND institution_id = audit_events.institution_id));

-- Note: No INSERT/UPDATE/DELETE policies are created for audit_events.
-- They must be inserted via service roles or internal backend mechanisms.


-- NOTIFICATIONS POLICIES --

-- User access: Can read and update their own notifications (e.g. mark as read)
CREATE POLICY "notifications_select_user"
    ON public.notifications FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "notifications_update_user"
    ON public.notifications FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- Note: No INSERT/DELETE policies are created for notifications.
-- System generates them. No deletion supported.
