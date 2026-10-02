import json
import uuid
import pytest
import psycopg2

@pytest.fixture(scope="session")
def phase3_test_env(admin_db_conn):
    cur = admin_db_conn.cursor()

    user_id = str(uuid.uuid4())
    admin_db_conn.rollback()

    cur.execute(
        "INSERT INTO auth.users (id, phone, raw_user_meta_data) VALUES (%s, %s, %s);",
        (user_id, "+15550009999", json.dumps({"full_name": "Test User Phase 3"}))
    )

    admin_db_conn.commit()

    test_context = {
        "user_id": user_id
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

def test_authenticated_user_can_read_requirements(admin_db_conn, phase3_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase3_test_env["user_id"])

    cur.execute("SELECT id FROM public.requirement_profiles LIMIT 1;")
    assert cur.fetchone() is not None, "Authenticated user should see requirement profiles"

    cur.execute("SELECT id FROM public.requirements LIMIT 1;")
    assert cur.fetchone() is not None, "Authenticated user should see requirements"

    admin_db_conn.rollback()
    cur.close()

def test_authenticated_user_cannot_modify_requirements(admin_db_conn, phase3_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase3_test_env["user_id"])

    # Try UPDATE
    cur.execute("UPDATE public.requirement_profiles SET description = 'Hacked' WHERE task_code = 'education_loan';")
    assert cur.rowcount == 0, "Authenticated user should not be able to modify profiles"

    cur.execute("UPDATE public.requirements SET required = false WHERE category = 'identity';")
    assert cur.rowcount == 0, "Authenticated user should not be able to modify requirements"

    # Try INSERT
    with pytest.raises(Exception):
        cur.execute(
            "INSERT INTO public.requirement_profiles (name, domain, task_code, version, description, status) VALUES (%s, %s, %s, %s, %s, %s)",
            ('Hacked', 'finance', 'hack', '1.0', 'Hacked', 'active')
        )
    admin_db_conn.rollback()
    cur.close()

def test_authenticated_user_cannot_delete_requirements(admin_db_conn, phase3_test_env):
    cur = admin_db_conn.cursor()
    set_auth_context(cur, phase3_test_env["user_id"])

    cur.execute("DELETE FROM public.requirement_profiles WHERE task_code = 'education_loan';")
    assert cur.rowcount == 0, "Authenticated user should not be able to delete profiles"

    cur.execute("DELETE FROM public.requirements WHERE category = 'identity';")
    assert cur.rowcount == 0, "Authenticated user should not be able to delete requirements"

    admin_db_conn.rollback()
    cur.close()
