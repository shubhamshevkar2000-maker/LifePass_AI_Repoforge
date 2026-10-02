-- ============================================================
-- LIFEPASS AI — PHASE 6 DATABASE MIGRATION
-- Consent Notifications Update
-- ============================================================

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

    -- Handle idempotency for repeated submissions
    IF v_request.status != 'pending_user' THEN
        IF v_request.status = 'approved' AND p_decision = 'grant' THEN
            SELECT id INTO v_consent_id FROM consents WHERE request_id = p_request_id AND status = 'granted';
            RETURN v_consent_id;
        ELSIF v_request.status = 'denied' AND p_decision = 'deny' THEN
            SELECT id INTO v_consent_id FROM consents WHERE request_id = p_request_id AND status = 'denied';
            RETURN v_consent_id;
        ELSE
            RAISE EXCEPTION 'invalid_state: request is not in pending_user status';
        END IF;
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

        -- Set request status
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

    -- Institution-side Notification Logic
    IF v_request.requester_user_id IS NOT NULL THEN
        -- Verify active membership before notifying
        IF EXISTS (
            SELECT 1 FROM institution_members
            WHERE user_id = v_request.requester_user_id
            AND institution_id = v_request.institution_id
            AND status = 'active'
        ) THEN
            INSERT INTO notifications (user_id, type, title, body, data)
            VALUES (
                v_request.requester_user_id,
                'consent_' || p_decision,
                'Consent ' || CASE WHEN p_decision = 'grant' THEN 'Approved' ELSE 'Denied' END,
                'User has ' || CASE WHEN p_decision = 'grant' THEN 'approved' ELSE 'denied' END || ' your access request.',
                jsonb_build_object('request_id', p_request_id, 'institution_id', v_request.institution_id)
            );
        END IF;
    END IF;

    RETURN v_consent_id;
END;
$$;
