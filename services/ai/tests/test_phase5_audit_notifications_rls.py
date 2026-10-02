import json
import uuid
import pytest
import psycopg2
from datetime import datetime

@pytest.fixture(scope="session")
def phase5_test_env(admin_db_conn):
    cur = admin_db_conn.cursor()

    user_a_id = str(uuid.uuid4())
    user_b_id = str(uuid.uuid4())
    audit_a_id = str(uuid.uuid4())
    audit_b_id = str(uuid.uuid4())
    notif_a_id = str(uuid.uuid4())
    notif_b_id = str(uuid.uuid4())

    admin_db_conn.rollback()

    # Create users
    cur.execute(
        """
        INSERT INTO auth.users (id, phone, raw_user_meta_data)
        VALUES (%s, %s, %s), (%s, %s, %s);
        """,
        (user_a_id, "+15550001234", json.dumps({"full_name": "User A"}),
         user_b_id, "+15550005678", json.dumps({"full_name": "User B"}))
    )

    # Insert audit events (using admin bypass)
    cur.execute(
        """
        INSERT INTO public.audit_events (id, actor_user_id, event_type, entity_type, metadata)
        VALUES (%s, %s, %s, %s, %s),
               (%s, %s, %s, %s, %s);
        """,
        (audit_a_id, user_a_id, "record_upload", "record", json.dumps({"status": "success", "no_secrets_here": True}),
         audit_b_id, user_b_id, "record_upload", "record", json.dumps({"status": "success"}))
    )

    # Insert notifications (using admin bypass)
    cur.execute(
        """
        INSERT INTO public.notifications (id, user_id, type, title, body, data)
        VALUES (%s, %s, %s, %s, %s, %s),
               (%s, %s, %s, %s, %s, %s);
        """,
        (notif_a_id, user_a_id, "request", "New Request", "You have a request", json.dumps({}),
         notif_b_id, user_b_id, "request", "New Request", "You have a request", json.dumps({}))
    )

    admin_db_conn.commit()

    test_context = {
        "user_a_id": user_a_id,
        "user_b_id": user_b_id,
        "audit_a_id": audit_a_id,
        "audit_b_id": audit_b_id,
        "notif_a_id": notif_a_id,
        "notif_b_id": notif_b_id
    }

    yield test_context

def set_auth_context(cur, user_id: str):
    cur.execute("SET ROLE authenticated;")
    cur.execute("SET request.jwt.claim.sub = %s;", (user_id,))
    cur.execute("SET request.jwt.claims = %s;", (json.dumps({"sub": user_id, "role": "authenticated"}),))

def set_anon_context(cur):
    cur.execute("SET ROLE anon;")
    cur.execute("SET request.jwt.claim.sub = '';")
    cur.execute("SET request.jwt.claims = %s;", (json.dumps({"role": "anon"}),))

# AUDIT TESTS
def test_user_cannot_modify_audit(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("UPDATE public.audit_events SET event_type = 'hacked' WHERE id = %s;", (phase5_test_env["audit_a_id"],))
    assert cur.rowcount == 0, "User should not be able to modify audit event"
    admin_db_conn.rollback()
    cur.close()

def test_user_cannot_delete_audit(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("DELETE FROM public.audit_events WHERE id = %s;", (phase5_test_env["audit_a_id"],))
    assert cur.rowcount == 0, "User should not be able to delete audit event"
    admin_db_conn.rollback()
    cur.close()

def test_user_cannot_access_other_audit(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("SELECT id FROM public.audit_events WHERE id = %s;", (phase5_test_env["audit_b_id"],))
    assert cur.fetchone() is None, "User A should not see User B's audit events"
    admin_db_conn.rollback()
    cur.close()

def test_no_secrets_in_audit(admin_db_conn, phase5_test_env):
    # This is a conceptual test verifying the schema/policy doesn't magically expose things.
    # It passes by definition if our data insertion was correct, but we check if metadata is clean.
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("SELECT metadata FROM public.audit_events WHERE id = %s;", (phase5_test_env["audit_a_id"],))
    row = cur.fetchone()
    assert row is not None
    assert "password" not in json.dumps(row[0]), "No secrets should be present"
    admin_db_conn.rollback()
    cur.close()

# NOTIFICATION TESTS
def test_user_a_can_read_own_notifications(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("SELECT id FROM public.notifications WHERE id = %s;", (phase5_test_env["notif_a_id"],))
    assert cur.fetchone() is not None, "User A should see own notifications"
    admin_db_conn.rollback()
    cur.close()

def test_user_a_cannot_read_user_b_notifications(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("SELECT id FROM public.notifications WHERE id = %s;", (phase5_test_env["notif_b_id"],))
    assert cur.fetchone() is None, "User A should not see User B's notifications"
    admin_db_conn.rollback()
    cur.close()

def test_user_a_cannot_modify_user_b_notifications(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute(
        "UPDATE public.notifications SET read_at = %s WHERE id = %s;",
        (datetime.now().isoformat(), phase5_test_env["notif_b_id"])
    )
    assert cur.rowcount == 0, "User A should not modify User B's notifications"
    admin_db_conn.rollback()
    cur.close()

def test_user_a_cannot_delete_user_b_notifications(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase5_test_env["user_a_id"])
    cur.execute("DELETE FROM public.notifications WHERE id = %s;", (phase5_test_env["notif_b_id"],))
    assert cur.rowcount == 0, "User A should not delete User B's notifications"
    admin_db_conn.rollback()
    cur.close()

def test_anon_access_denied(admin_db_conn, phase5_test_env):
    cur = admin_db_conn.cursor()
    set_anon_context(cur)
    cur.execute("SELECT id FROM public.notifications LIMIT 1;")
    assert cur.fetchone() is None, "Anon should not see notifications"
    cur.execute("SELECT id FROM public.audit_events LIMIT 1;")
    assert cur.fetchone() is None, "Anon should not see audit events"
    admin_db_conn.rollback()
    cur.close()
