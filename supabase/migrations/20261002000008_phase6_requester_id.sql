-- ============================================================
-- LIFEPASS AI — PHASE 6 DATABASE MIGRATION
-- Add requester_user_id to access_requests
-- ============================================================

-- 1. Add requester_user_id column
ALTER TABLE public.access_requests
ADD COLUMN IF NOT EXISTS requester_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Update the RPC to store requester_user_id and enforce active membership
CREATE OR REPLACE FUNCTION public.create_institution_access_request(
    p_institution_id UUID,
    p_user_id UUID,
    p_requirement_profile_id UUID,
    p_purpose TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID;
    v_new_request_id UUID;
BEGIN
    -- 1. Validate Caller
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'unauthorized: missing auth context';
    END IF;

    -- 2. Validate Institution Membership (Must be ACTIVE)
    IF NOT EXISTS (
        SELECT 1 FROM institution_members
        WHERE user_id = v_caller_id
        AND institution_id = p_institution_id
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'unauthorized: caller is not an active member of the specified institution';
    END IF;

    -- 3. Validate Recipient
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = p_user_id
    ) THEN
        RAISE EXCEPTION 'invalid_request: specified recipient user does not exist';
    END IF;

    -- 4. Validate Requirement Profile
    IF NOT EXISTS (
        SELECT 1 FROM requirement_profiles WHERE id = p_requirement_profile_id
    ) THEN
        RAISE EXCEPTION 'invalid_request: specified requirement profile does not exist';
    END IF;

    -- 5. Create access_request with requester_user_id
    INSERT INTO access_requests (
        institution_id,
        user_id,
        requirement_profile_id,
        purpose,
        status,
        expires_at,
        requester_user_id
    ) VALUES (
        p_institution_id,
        p_user_id,
        p_requirement_profile_id,
        p_purpose,
        'draft',
        p_expires_at,
        v_caller_id
    ) RETURNING id INTO v_new_request_id;

    -- 6. Create request_items from authoritative requirements
    INSERT INTO request_items (
        request_id,
        requirement_id,
        match_status
    )
    SELECT
        v_new_request_id,
        id,
        'pending'
    FROM requirements
    WHERE profile_id = p_requirement_profile_id;

    -- 7. Audit Event
    INSERT INTO audit_events (
        actor_user_id,
        institution_id,
        event_type,
        entity_type,
        entity_id,
        request_id
    ) VALUES (
        v_caller_id,
        p_institution_id,
        'request_creation',
        'access_request',
        v_new_request_id,
        v_new_request_id
    );

    RETURN v_new_request_id;
END;
$$;

-- 8. Execution Privileges (preserve strict access)
REVOKE EXECUTE ON FUNCTION public.create_institution_access_request(UUID, UUID, UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_institution_access_request(UUID, UUID, UUID, TEXT, TIMESTAMPTZ) TO authenticated;
