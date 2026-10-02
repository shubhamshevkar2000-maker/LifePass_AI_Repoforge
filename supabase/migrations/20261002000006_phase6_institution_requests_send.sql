-- ============================================================
-- LIFEPASS AI — PHASE 6 DATABASE MIGRATION
-- Send Institution Request RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.send_institution_access_request(p_request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID;
    v_institution_id UUID;
    v_user_id UUID;
    v_status TEXT;
    v_expires_at TIMESTAMPTZ;
    v_item_count INT;
BEGIN
    -- 1. Validate Caller
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'unauthorized: missing auth context';
    END IF;

    -- 2. Fetch Request Details
    SELECT institution_id, user_id, status, expires_at
    INTO v_institution_id, v_user_id, v_status, v_expires_at
    FROM access_requests
    WHERE id = p_request_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found: request does not exist';
    END IF;

    -- 3. Check Caller Authorization (Must be an active member of the request's institution)
    IF NOT EXISTS (
        SELECT 1 FROM institution_members
        WHERE user_id = v_caller_id
        AND institution_id = v_institution_id
    ) THEN
        -- Return identical not_found error to prevent enumeration of unrelated requests
        RAISE EXCEPTION 'not_found: request does not exist';
    END IF;

    -- 4. Check State Transition Validity
    IF v_status != 'draft' THEN
        RAISE EXCEPTION 'invalid_state: request is not in draft status';
    END IF;

    IF v_expires_at <= now() THEN
        RAISE EXCEPTION 'invalid_state: request has already expired';
    END IF;

    -- 5. Ensure Request has Items
    SELECT count(*) INTO v_item_count FROM request_items WHERE request_id = p_request_id;
    IF v_item_count = 0 THEN
        RAISE EXCEPTION 'invalid_state: request cannot be sent without request items';
    END IF;

    -- 6. Perform State Transition (Atomically update status)
    UPDATE access_requests
    SET status = 'pending_user', updated_at = now()
    WHERE id = p_request_id;

    -- 7. Create Notification for the Recipient User
    INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        data
    ) VALUES (
        v_user_id,
        'new_request',
        'New Access Request',
        'An institution has requested access to your records.',
        jsonb_build_object('request_id', p_request_id, 'institution_id', v_institution_id)
    );

    -- 8. Create Audit Event
    INSERT INTO audit_events (
        actor_user_id,
        institution_id,
        event_type,
        entity_type,
        entity_id,
        request_id
    ) VALUES (
        v_caller_id,
        v_institution_id,
        'request_sent',
        'access_request',
        p_request_id,
        p_request_id
    );

    RETURN p_request_id;
END;
$$;

-- 9. Execution Privileges (Strictly locked down)
REVOKE EXECUTE ON FUNCTION public.send_institution_access_request(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_institution_access_request(UUID) TO authenticated;
