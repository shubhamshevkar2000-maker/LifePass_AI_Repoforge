-- ============================================================
-- LIFEPASS AI — PHASE 6 DATABASE MIGRATION
-- Consent and Revoke APIs
-- ============================================================

-- 1. Consent Decision RPC
CREATE OR REPLACE FUNCTION public.submit_consent_decision(
    p_request_id UUID,
    p_decision TEXT,
    p_mapped_items JSONB DEFAULT '[]'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID;
    v_request RECORD;
    v_consent_id UUID;
    v_item JSONB;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'unauthorized: missing auth context';
    END IF;

    -- Fetch request
    SELECT * INTO v_request FROM access_requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found: request does not exist';
    END IF;

    -- Verify ownership
    IF v_request.user_id != v_caller_id THEN
        RAISE EXCEPTION 'not_found: request does not exist'; -- enumeration safe
    END IF;

    -- Verify state
    IF v_request.status != 'pending_user' THEN
        RAISE EXCEPTION 'invalid_state: request is not in pending_user status';
    END IF;

    IF p_decision = 'grant' THEN
        -- Create consent
        INSERT INTO consents (request_id, user_id, institution_id, purpose, status, granted_at, expires_at)
        VALUES (p_request_id, v_caller_id, v_request.institution_id, v_request.purpose, 'granted', now(), v_request.expires_at)
        RETURNING id INTO v_consent_id;

        -- Update request items and verify record ownership
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_mapped_items) LOOP
            IF NOT EXISTS (
                SELECT 1 FROM records
                WHERE id = (v_item->>'record_id')::UUID
                AND user_id = v_caller_id
            ) THEN
                RAISE EXCEPTION 'invalid_input: record % does not belong to user', v_item->>'record_id';
            END IF;

            UPDATE request_items
            SET record_id = (v_item->>'record_id')::UUID,
                user_decision = 'granted',
                match_status = 'matched'
            WHERE request_id = p_request_id
            AND requirement_id = (v_item->>'requirement_id')::UUID;
        END LOOP;

        -- Set request status (we assume approved for MVP when granting)
        UPDATE access_requests SET status = 'approved', updated_at = now() WHERE id = p_request_id;

        -- Audit event
        INSERT INTO audit_events (actor_user_id, institution_id, event_type, entity_type, entity_id, request_id)
        VALUES (v_caller_id, v_request.institution_id, 'consent_granted', 'consent', v_consent_id, p_request_id);

    ELSIF p_decision = 'deny' THEN
        -- Create consent (denied)
        INSERT INTO consents (request_id, user_id, institution_id, purpose, status)
        VALUES (p_request_id, v_caller_id, v_request.institution_id, v_request.purpose, 'denied')
        RETURNING id INTO v_consent_id;

        UPDATE request_items SET user_decision = 'denied' WHERE request_id = p_request_id;
        UPDATE access_requests SET status = 'denied', updated_at = now() WHERE id = p_request_id;

        INSERT INTO audit_events (actor_user_id, institution_id, event_type, entity_type, entity_id, request_id)
        VALUES (v_caller_id, v_request.institution_id, 'consent_denied', 'consent', v_consent_id, p_request_id);
    ELSE
        RAISE EXCEPTION 'invalid_input: invalid decision';
    END IF;

    RETURN v_consent_id;
END;
$$;

-- 2. Revoke Consent RPC
CREATE OR REPLACE FUNCTION public.revoke_consent(p_consent_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID;
    v_consent RECORD;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'unauthorized: missing auth context';
    END IF;

    SELECT * INTO v_consent FROM consents WHERE id = p_consent_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found: consent does not exist';
    END IF;

    IF v_consent.user_id != v_caller_id THEN
        RAISE EXCEPTION 'not_found: consent does not exist';
    END IF;

    IF v_consent.status != 'granted' THEN
        RAISE EXCEPTION 'invalid_state: consent is not active';
    END IF;

    -- Update consent state
    UPDATE consents
    SET status = 'revoked', revoked_at = now()
    WHERE id = p_consent_id;

    -- Update associated request state (if it was approved)
    UPDATE access_requests
    SET status = 'revoked', updated_at = now()
    WHERE id = v_consent.request_id AND status IN ('approved', 'partially_approved');

    -- Audit Event
    INSERT INTO audit_events (actor_user_id, institution_id, event_type, entity_type, entity_id, request_id)
    VALUES (v_caller_id, v_consent.institution_id, 'consent_revoked', 'consent', p_consent_id, v_consent.request_id);

    RETURN p_consent_id;
END;
$$;

-- 3. Execution Privileges
REVOKE EXECUTE ON FUNCTION public.submit_consent_decision(UUID, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_consent_decision(UUID, TEXT, JSONB) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.revoke_consent(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revoke_consent(UUID) TO authenticated;

-- 4. Record Extractions Institution Consent Policy
CREATE POLICY "record_extractions_select_institution_consent"
    ON public.record_extractions FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.consents c
            JOIN public.request_items ri ON c.request_id = ri.request_id
            JOIN public.institution_members im ON c.institution_id = im.institution_id
            WHERE ri.record_id = record_extractions.record_id
            AND im.user_id = auth.uid()
            AND c.status = 'granted'
            AND (c.expires_at IS NULL OR c.expires_at > now())
            AND c.revoked_at IS NULL
            AND c.user_id = (SELECT user_id FROM public.records WHERE id = record_extractions.record_id)
        )
    );
