"""
LifePass AI — Phase 1 Database & Security Verification Tests
TYPE: RUNTIME POSTGRESQL & SUPABASE AUTH RUNTIME VERIFICATION

This test suite executes against the running local Supabase stack
(PostgreSQL daemon on port 54322, GoTrue Auth on port 54321).
It runs actual SQL queries under separate authenticated contexts
(SET ROLE authenticated, SET request.jwt.claim.sub = ...) to verify
Row Level Security (RLS) enforcement at the PostgreSQL engine level.
"""

import json
import uuid
import pytest
import psycopg2
import httpx

DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
SUPABASE_URL = "http://127.0.0.1:54321"
ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9."
    "CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
)


# ============================================================
# FIXTURES
# ============================================================

@pytest.fixture(scope="session")
def admin_db_conn():
    """Provides a raw admin/superuser connection to the local PostgreSQL database."""
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    yield conn
    conn.close()


@pytest.fixture
def rls_test_env(admin_db_conn):
    """
    Sets up isolated test identities and institutions for RLS testing,
    and cleans them up after each test.

    Identities:
    - User A (Alice): Member of Institution One (compliance_officer)
    - User B (Bob): Citizen without any institution membership
    - Inst 1: Institution One (bank)
    - Inst 2: Institution Two (university)
    """
    cur = admin_db_conn.cursor()

    user_a_id = str(uuid.uuid4())
    user_b_id = str(uuid.uuid4())
    inst_1_id = str(uuid.uuid4())
    inst_2_id = str(uuid.uuid4())
    member_id = str(uuid.uuid4())

    # Clean any stale test rows
    admin_db_conn.rollback()

    # 1. Insert test institutions
    cur.execute(
        """
        INSERT INTO public.institutions (id, name, type, status)
        VALUES (%s, %s, %s, %s), (%s, %s, %s, %s);
        """,
        (inst_1_id, "Test Institution One", "bank", "active",
         inst_2_id, "Test Institution Two", "university", "active")
    )

    # 2. Insert test auth users (triggers handle_new_auth_user -> profiles)
    cur.execute(
        """
        INSERT INTO auth.users (id, phone, raw_user_meta_data)
        VALUES (%s, %s, %s), (%s, %s, %s);
        """,
        (user_a_id, "+15550001111", json.dumps({"full_name": "Alice Citizen"}),
         user_b_id, "+15550002222", json.dumps({"full_name": "Bob Citizen"}))
    )

    # 3. Insert membership for User A in Inst 1 only
    cur.execute(
        """
        INSERT INTO public.institution_members (id, institution_id, user_id, role, status)
        VALUES (%s, %s, %s, %s, %s);
        """,
        (member_id, inst_1_id, user_a_id, "compliance_officer", "active")
    )

    admin_db_conn.commit()

    test_context = {
        "user_a_id": user_a_id,
        "user_b_id": user_b_id,
        "inst_1_id": inst_1_id,
        "inst_2_id": inst_2_id,
        "member_id": member_id,
    }

    yield test_context

    # Teardown: delete users and institutions (cascades to profiles and members)
    admin_db_conn.rollback()
    cur.execute("DELETE FROM auth.users WHERE id IN (%s, %s);", (user_a_id, user_b_id))
    cur.execute("DELETE FROM public.institutions WHERE id IN (%s, %s);", (inst_1_id, inst_2_id))
    admin_db_conn.commit()
    cur.close()


def set_auth_context(cur, user_id: str):
    """Configures the PostgreSQL session as authenticated role with specific auth.uid()."""
    cur.execute("SET ROLE authenticated;")
    cur.execute("SET request.jwt.claim.sub = %s;", (user_id,))


def set_anon_context(cur):
    """Configures the PostgreSQL session as anon role."""
    cur.execute("SET ROLE anon;")
    cur.execute("SET request.jwt.claim.sub = '';")


# ============================================================
# CATEGORY A: DATABASE CONNECTIVITY & SCHEMA VERIFICATION
# ============================================================

def test_runtime_database_connectivity(admin_db_conn):
    """A1: Verifies real PostgreSQL connection succeeds and queries server version."""
    cur = admin_db_conn.cursor()
    cur.execute("SELECT version();")
    row = cur.fetchone()
    assert row is not None
    assert "PostgreSQL" in row[0]
    cur.close()


def test_runtime_migration_applied(admin_db_conn):
    """A2: Verifies Phase 1 migration record is recorded in supabase_migrations table."""
    cur = admin_db_conn.cursor()
    cur.execute(
        """
        SELECT version FROM supabase_migrations.schema_migrations
        WHERE version = '20261001000000';
        """
    )
    row = cur.fetchone()
    assert row is not None, "Migration 20261001000000 must be present in schema_migrations"
    cur.close()


def test_runtime_tables_exist(admin_db_conn):
    """A3: Verifies all Phase 1 tables exist in public schema."""
    cur = admin_db_conn.cursor()
    cur.execute(
        """
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
        """
    )
    tables = [r[0] for r in cur.fetchall()]
    assert "profiles" in tables
    assert "institutions" in tables
    assert "institution_members" in tables
    cur.close()


def test_runtime_rls_enabled_on_all_tables(admin_db_conn):
    """A4: Verifies rowsecurity is enabled ('t') on profiles, institutions, institution_members."""
    cur = admin_db_conn.cursor()
    cur.execute(
        """
        SELECT tablename, rowsecurity FROM pg_tables
        WHERE schemaname = 'public' AND tablename IN ('profiles', 'institutions', 'institution_members');
        """
    )
    rows = dict(cur.fetchall())
    assert rows.get("profiles") is True, "RLS must be enabled on profiles"
    assert rows.get("institutions") is True, "RLS must be enabled on institutions"
    assert rows.get("institution_members") is True, "RLS must be enabled on institution_members"
    cur.close()


# ============================================================
# CATEGORY B: REAL AUTHENTICATED POSTGRESQL-LEVEL RLS EXECUTION
# ============================================================

def test_runtime_rls_01_user_a_selects_own_profile(admin_db_conn, rls_test_env):
    """
    RLS 1: User A selects own profile.
    Policy: profiles_select_own (auth.uid() = id).
    Expected: Allowed, returns User A's profile row.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    cur.execute("SELECT id, full_name FROM public.profiles WHERE id = %s;", (rls_test_env["user_a_id"],))
    row = cur.fetchone()
    assert row is not None
    assert row[0] == rls_test_env["user_a_id"]
    assert row[1] == "Alice Citizen"

    # Also test unqualified SELECT: User A sees only their own profile
    cur.execute("SELECT id FROM public.profiles;")
    rows = cur.fetchall()
    profile_ids = [r[0] for r in rows]
    assert rls_test_env["user_a_id"] in profile_ids
    assert rls_test_env["user_b_id"] not in profile_ids

    cur.execute("RESET ROLE;")
    cur.close()


def test_runtime_rls_02_user_a_selects_user_b_profile(admin_db_conn, rls_test_env):
    """
    RLS 2: User A selects User B profile.
    Policy: profiles_select_own (auth.uid() = id).
    Expected: Denied / returns 0 rows (silent RLS row filter).
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    cur.execute("SELECT id, full_name FROM public.profiles WHERE id = %s;", (rls_test_env["user_b_id"],))
    rows = cur.fetchall()
    assert len(rows) == 0, "User A must not be able to read User B profile"

    cur.execute("RESET ROLE;")
    cur.close()


def test_runtime_rls_03_user_a_updates_user_b_profile(admin_db_conn, rls_test_env):
    """
    RLS 3: User A attempts to UPDATE User B profile.
    Policy: profiles_update_own (USING auth.uid() = id).
    Expected: Denied / 0 rows affected. User B profile remains unchanged.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    cur.execute(
        "UPDATE public.profiles SET full_name = 'Hacked Bob' WHERE id = %s;",
        (rls_test_env["user_b_id"],)
    )
    assert cur.rowcount == 0, "Update on User B profile must affect 0 rows under User A context"

    # Reset role and verify User B profile was NOT modified
    cur.execute("RESET ROLE;")
    cur.execute("SELECT full_name FROM public.profiles WHERE id = %s;", (rls_test_env["user_b_id"],))
    assert cur.fetchone()[0] == "Bob Citizen"

    cur.close()


def test_runtime_rls_04_spoofed_user_id_insert_and_update(admin_db_conn, rls_test_env):
    """
    RLS 4: User A attempts to INSERT / UPDATE with a spoofed user_id.
    Policy: profiles_insert_own & profiles_update_own (WITH CHECK auth.uid() = id).
    Expected: Denied / InsufficientPrivilege exception raised by PostgreSQL.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    spoofed_id = str(uuid.uuid4())

    # 4a: Spoofed INSERT (User A passes spoofed id != auth.uid())
    with pytest.raises(psycopg2.errors.InsufficientPrivilege) as exc_info:
        cur.execute(
            "INSERT INTO public.profiles (id, full_name) VALUES (%s, %s);",
            (spoofed_id, "Spoofed User")
        )
    assert "violates row-level security policy" in str(exc_info.value)
    admin_db_conn.rollback()

    # Re-establish auth session after rollback
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    # 4b: Spoofed UPDATE (User A attempts to change own id to User B's id)
    with pytest.raises(psycopg2.errors.InsufficientPrivilege) as exc_info:
        cur.execute(
            "UPDATE public.profiles SET id = %s WHERE id = %s;",
            (rls_test_env["user_b_id"], rls_test_env["user_a_id"])
        )
    assert "violates row-level security policy" in str(exc_info.value)
    admin_db_conn.rollback()

    cur.close()


def test_runtime_rls_05_user_without_membership_selects_institutions(admin_db_conn, rls_test_env):
    """
    RLS 5: User without institution membership (Bob) selects institutions.
    Policy: institutions_select_member (EXISTS in institution_members with status = 'active').
    Expected: Denied / returns 0 rows.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_b_id"])

    cur.execute("SELECT id, name FROM public.institutions;")
    rows = cur.fetchall()
    assert len(rows) == 0, "User without membership must see 0 institutions"

    cur.execute("RESET ROLE;")
    cur.close()


def test_runtime_rls_06_user_with_active_membership_selects_own_institution(admin_db_conn, rls_test_env):
    """
    RLS 6: User with active membership (Alice in Inst 1) selects own institution.
    Policy: institutions_select_member.
    Expected: Allowed, returns Institution One row.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    cur.execute("SELECT id, name FROM public.institutions WHERE id = %s;", (rls_test_env["inst_1_id"],))
    rows = cur.fetchall()
    assert len(rows) == 1
    assert rows[0][0] == rls_test_env["inst_1_id"]
    assert rows[0][1] == "Test Institution One"

    cur.execute("RESET ROLE;")
    cur.close()


def test_runtime_rls_07_institution_a_member_selects_institution_b(admin_db_conn, rls_test_env):
    """
    RLS 7: Institution A member (Alice) selects Institution B (where she has no membership).
    Policy: institutions_select_member.
    Expected: Denied / returns 0 rows.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    cur.execute("SELECT id, name FROM public.institutions WHERE id = %s;", (rls_test_env["inst_2_id"],))
    rows = cur.fetchall()
    assert len(rows) == 0, "Institution One member must not see Institution Two"

    cur.execute("RESET ROLE;")
    cur.close()


def test_runtime_rls_08_client_cannot_insert_institution_members(admin_db_conn, rls_test_env):
    """
    RLS 8: Authenticated client attempts to INSERT into institution_members.
    Policy: NO client INSERT policy exists.
    Expected: Denied / InsufficientPrivilege exception raised by PostgreSQL.
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    new_member_id = str(uuid.uuid4())
    with pytest.raises(psycopg2.errors.InsufficientPrivilege) as exc_info:
        cur.execute(
            """
            INSERT INTO public.institution_members (id, institution_id, user_id, role, status)
            VALUES (%s, %s, %s, %s, %s);
            """,
            (new_member_id, rls_test_env["inst_2_id"], rls_test_env["user_a_id"], "admin", "active")
        )
    assert "violates row-level security policy" in str(exc_info.value)
    admin_db_conn.rollback()
    cur.close()


def test_runtime_rls_09_client_cannot_update_institution_members_or_role(admin_db_conn, rls_test_env):
    """
    RLS 9: Authenticated client attempts to UPDATE institution_members (e.g. self-assign 'owner' role).
    Policy: NO client UPDATE policy exists.
    Expected: Denied / 0 rows affected (or InsufficientPrivilege).
    """
    cur = admin_db_conn.cursor()
    set_auth_context(cur, rls_test_env["user_a_id"])

    cur.execute(
        "UPDATE public.institution_members SET role = 'owner' WHERE user_id = %s;",
        (rls_test_env["user_a_id"],)
    )
    assert cur.rowcount == 0, "Client update on institution_members must affect 0 rows"

    # Reset role and verify role in DB was NOT changed
    cur.execute("RESET ROLE;")
    cur.execute(
        "SELECT role FROM public.institution_members WHERE id = %s;",
        (rls_test_env["member_id"],)
    )
    assert cur.fetchone()[0] == "compliance_officer"
    cur.close()


def test_runtime_rls_10_anonymous_user_cannot_select_protected_tables(admin_db_conn, rls_test_env):
    """
    RLS 10: Anonymous client attempts to SELECT from profiles, institutions, institution_members.
    Policy: auth.uid() evaluates to NULL; all policies require non-null matching auth.uid().
    Expected: Denied / returns 0 rows across all protected tables.
    """
    cur = admin_db_conn.cursor()
    set_anon_context(cur)

    # 10a: profiles
    cur.execute("SELECT * FROM public.profiles;")
    assert len(cur.fetchall()) == 0, "Anon user must see 0 profiles"

    # 10b: institutions
    cur.execute("SELECT * FROM public.institutions;")
    assert len(cur.fetchall()) == 0, "Anon user must see 0 institutions"

    # 10c: institution_members
    cur.execute("SELECT * FROM public.institution_members;")
    assert len(cur.fetchall()) == 0, "Anon user must see 0 institution_members"

    cur.execute("RESET ROLE;")
    cur.close()


# ============================================================
# CATEGORY C: REAL SUPABASE AUTH RUNTIME VERIFICATION
# ============================================================

def test_runtime_auth_health_endpoint():
    """C1: Verifies GoTrue/Auth service is reachable and healthy at /auth/v1/health."""
    response = httpx.get(f"{SUPABASE_URL}/auth/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data
    assert data.get("name") == "GoTrue"


def test_runtime_auth_otp_channel_status():
    """
    C2: Verifies whether SMS provider is configured locally.
    GoTrue returns 400 'phone_provider_disabled' when no live SMS gateway is configured.
    This test verifies the local authentication service behavior and confirms that
    live SMS OTP delivery acceptance gate is BLOCKED in the local dev environment.
    """
    headers = {
        "apikey": ANON_KEY,
        "Content-Type": "application/json",
    }
    response = httpx.post(
        f"{SUPABASE_URL}/auth/v1/otp",
        headers=headers,
        json={"phone": "+15555550123", "channel": "sms"},
    )
    # Confirm local GoTrue responds with phone_provider_disabled
    assert response.status_code == 400
    data = response.json()
    assert data.get("error_code") == "phone_provider_disabled" or "unsupported" in data.get("msg", "").lower()


def test_runtime_postgrest_anon_isolation():
    """C3: Verifies PostgREST HTTP REST API enforces RLS on anon requests."""
    headers = {"apikey": ANON_KEY}

    r_profiles = httpx.get(f"{SUPABASE_URL}/rest/v1/profiles", headers=headers)
    assert r_profiles.status_code == 200
    assert r_profiles.json() == []

    r_institutions = httpx.get(f"{SUPABASE_URL}/rest/v1/institutions", headers=headers)
    assert r_institutions.status_code == 200
    assert r_institutions.json() == []

    r_members = httpx.get(f"{SUPABASE_URL}/rest/v1/institution_members", headers=headers)
    assert r_members.status_code == 200
    assert r_members.json() == []
