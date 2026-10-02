import json
import uuid
import pytest
import psycopg2
from datetime import datetime, timedelta

@pytest.fixture(scope="session")
def phase4_test_env(admin_db_conn):
    cur = admin_db_conn.cursor()

    user_a_id = str(uuid.uuid4())
    user_b_id = str(uuid.uuid4())
    inst_a_id = str(uuid.uuid4())
    inst_b_id = str(uuid.uuid4())
    inst_a_member_id = str(uuid.uuid4())
    inst_b_member_id = str(uuid.uuid4())

    profile_id = str(uuid.uuid4())
    req_id = str(uuid.uuid4())

    request_a_id = str(uuid.uuid4())
    request_b_id = str(uuid.uuid4())
    item_a_id = str(uuid.uuid4())
    record_a_id = str(uuid.uuid4())
    record_b_id = str(uuid.uuid4())
    consent_a_id = str(uuid.uuid4())

    # Use timezone aware object as requested by python warning in previous run
    expires_at = (datetime.now() + timedelta(days=7)).isoformat()

    admin_db_conn.rollback()

    cur.execute(
        """
        INSERT INTO auth.users (id, phone, raw_user_meta_data)
        VALUES (%s, %s, %s), (%s, %s, %s), (%s, %s, %s), (%s, %s, %s);
        """,
        (user_a_id, "+15550005555", json.dumps({"full_name": "User A"}),
         user_b_id, "+15550006666", json.dumps({"full_name": "User B"}),
         inst_a_member_id, "+15550007777", json.dumps({"full_name": "Inst A Member"}),
         inst_b_member_id, "+15550008888", json.dumps({"full_name": "Inst B Member"}))
    )

    cur.execute(
        """
        INSERT INTO public.institutions (id, name, type, status)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s);
        """,
        (inst_a_id, "Institution A", "university", "active",
         inst_b_id, "Institution B", "bank", "active")
    )

    cur.execute(
        """
        INSERT INTO public.institution_members (institution_id, user_id, role, status)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s);
        """,
        (inst_a_id, inst_a_member_id, "member", "active",
         inst_b_id, inst_b_member_id, "member", "active")
    )

    cur.execute(
        """
        INSERT INTO public.requirement_profiles (id, name, domain, task_code, version, description, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """,
        (profile_id, "Phase 4 Profile", "test", "p4_test", "1.0", "Test", "active")
    )
    cur.execute(
        """
        INSERT INTO public.requirements (id, profile_id, code, name, category, required)
        VALUES (%s, %s, %s, %s, %s, %s);
        """,
        (req_id, profile_id, "test_req", "Test Req", "identity", True)
    )

    cur.execute(
        """
        INSERT INTO public.records (id, user_id, title, category, document_type, status, external_verification_status, source_type, storage_path, mime_type, file_size)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s),
               (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """,
        (record_a_id, user_a_id, "User A Doc", "identity", "passport", "processed", "none", "upload", "path/a", "application/pdf", 1024,
         record_b_id, user_b_id, "User B Doc", "identity", "passport", "processed", "none", "upload", "path/b", "application/pdf", 1024)
    )

    cur.execute(
        """
        INSERT INTO public.access_requests (id, institution_id, user_id, requirement_profile_id, purpose, status, expires_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """,
        (request_a_id, inst_a_id, user_a_id, profile_id, "Test purpose A", "sent", expires_at)
    )

    cur.execute(
        """
        INSERT INTO public.access_requests (id, institution_id, user_id, requirement_profile_id, purpose, status, expires_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """,
        (request_b_id, inst_b_id, user_b_id, profile_id, "Test purpose B", "sent", expires_at)
    )

    cur.execute(
        """
        INSERT INTO public.request_items (id, request_id, requirement_id, record_id, match_status)
        VALUES (%s, %s, %s, %s, %s);
        """,
        (item_a_id, request_a_id, req_id, record_a_id, "matched")
    )

    cur.execute(
        """
        INSERT INTO public.consents (id, request_id, user_id, institution_id, purpose, status, granted_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s);
        """,
        (consent_a_id, request_a_id, user_a_id, inst_a_id, "Test purpose A", "granted", datetime.now().isoformat())
    )

    admin_db_conn.commit()

    test_context = {
        "user_a_id": user_a_id,
        "user_b_id": user_b_id,
        "inst_a_member_id": inst_a_member_id,
        "inst_b_member_id": inst_b_member_id,
        "request_a_id": request_a_id,
        "request_b_id": request_b_id,
        "record_a_id": record_a_id,
        "record_b_id": record_b_id,
        "consent_a_id": consent_a_id,
        "inst_a_id": inst_a_id
    }

    yield test_context

def set_auth_context(cur, user_id: str):
    cur.execute("SET ROLE authenticated;")
    cur.execute("SET request.jwt.claim.sub = %s;", (user_id,))
    cur.execute("SET request.jwt.claims = %s;", (json.dumps({"sub": user_id, "role": "authenticated"}),))


def test_user_a_can_view_own_request(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["user_a_id"])
    cur.execute("SELECT id FROM public.access_requests WHERE id = %s;", (phase4_test_env["request_a_id"],))
    assert cur.fetchone() is not None, "User A should see request A"
    admin_db_conn.rollback()
    cur.close()

def test_user_a_cannot_view_user_b_request(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["user_a_id"])
    cur.execute("SELECT id FROM public.access_requests WHERE id = %s;", (phase4_test_env["request_b_id"],))
    assert cur.fetchone() is None, "User A should NOT see request B"
    admin_db_conn.rollback()
    cur.close()

def test_inst_a_can_access_own_request(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["inst_a_member_id"])
    cur.execute("SELECT id FROM public.access_requests WHERE id = %s;", (phase4_test_env["request_a_id"],))
    assert cur.fetchone() is not None, "Inst A should see request A"
    admin_db_conn.rollback()
    cur.close()

def test_inst_a_cannot_access_inst_b_request(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["inst_a_member_id"])
    cur.execute("SELECT id FROM public.access_requests WHERE id = %s;", (phase4_test_env["request_b_id"],))
    assert cur.fetchone() is None, "Inst A should NOT see request B"
    admin_db_conn.rollback()
    cur.close()

def test_inst_cannot_create_consent_for_user(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["inst_a_member_id"])
    with pytest.raises(Exception):
        cur.execute(
            "INSERT INTO public.consents (request_id, user_id, institution_id, purpose, status) VALUES (%s, %s, %s, %s, %s);",
            (phase4_test_env["request_a_id"], phase4_test_env["user_a_id"], phase4_test_env["inst_a_id"], "Hacked", "granted")
        )
    admin_db_conn.rollback()
    cur.close()

def test_user_cannot_create_consent_for_another_user(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["user_b_id"])
    with pytest.raises(Exception):
        cur.execute(
            "INSERT INTO public.consents (request_id, user_id, institution_id, purpose, status) VALUES (%s, %s, %s, %s, %s);",
            (phase4_test_env["request_a_id"], phase4_test_env["user_a_id"], phase4_test_env["inst_a_id"], "Hacked", "granted")
        )
    admin_db_conn.rollback()
    cur.close()

def test_user_can_perform_permitted_consent_action(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["user_a_id"])
    cur.execute(
        "UPDATE public.consents SET status = 'revoked' WHERE id = %s;",
        (phase4_test_env["consent_a_id"],)
    )
    assert cur.rowcount == 1, "User A should be able to revoke their consent"
    admin_db_conn.rollback()
    cur.close()

def test_consent_from_user_a_must_not_authorize_user_b_records(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["inst_a_member_id"])
    cur.execute("SELECT id FROM public.records WHERE id = %s;", (phase4_test_env["record_a_id"],))
    assert cur.fetchone() is not None, "Inst A should be able to read Record A via consent"

    cur.execute("SELECT id FROM public.records WHERE id = %s;", (phase4_test_env["record_b_id"],))
    assert cur.fetchone() is None, "Inst A should NOT be able to read Record B"
    admin_db_conn.rollback()
    cur.close()

def test_request_alone_must_not_grant_record_access(admin_db_conn, phase4_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase4_test_env["inst_b_member_id"])
    cur.execute("SELECT id FROM public.records WHERE id = %s;", (phase4_test_env["record_b_id"],))
    assert cur.fetchone() is None, "Inst B should NOT be able to read Record B without consent"
    admin_db_conn.rollback()
    cur.close()
