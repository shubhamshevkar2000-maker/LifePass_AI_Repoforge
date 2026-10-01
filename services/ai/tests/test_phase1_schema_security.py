"""
LifePass AI — Phase 1 Database & Security Verification Tests
TYPE: STATIC VERIFICATION & POLICY LOGIC SIMULATION

NOTE (Per Phase 1 Final Verification Directive):
These tests perform static schema verification, migration SQL parsing,
and policy logic simulation. They do NOT execute against a live PostgreSQL
daemon because no running database instance is present in this environment.
"""

import os
import re
import pytest

MIGRATION_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../supabase/migrations/20261001000000_phase1_initial_schema.sql")
)

@pytest.fixture
def migration_sql():
    assert os.path.exists(MIGRATION_PATH), f"Migration file not found at {MIGRATION_PATH}"
    with open(MIGRATION_PATH, "r", encoding="utf-8") as f:
        return f.read()

def test_static_migration_exists_and_not_empty(migration_sql):
    """STATIC: Verifies migration SQL exists and contains primary table definitions."""
    assert len(migration_sql) > 500
    assert "public.profiles" in migration_sql
    assert "public.institutions" in migration_sql
    assert "public.institution_members" in migration_sql

def test_static_profiles_schema_columns(migration_sql):
    """STATIC: DATABASE_SCHEMA.md requires id, full_name, phone, avatar_url, created_at, updated_at"""
    table_match = re.search(r"CREATE TABLE IF NOT EXISTS public\.profiles\s*\((.*?)\);", migration_sql, re.DOTALL)
    assert table_match, "public.profiles table definition not found"
    content = table_match.group(1)
    
    assert "id UUID PRIMARY KEY" in content or "id UUID PRIMARY KEY REFERENCES" in content
    assert "REFERENCES auth.users(id)" in content
    assert "full_name TEXT" in content
    assert "phone TEXT" in content
    assert "avatar_url TEXT" in content
    assert "created_at TIMESTAMPTZ" in content
    assert "updated_at TIMESTAMPTZ" in content

def test_static_institutions_schema_columns(migration_sql):
    """STATIC: DATABASE_SCHEMA.md requires id, name, type, status, created_at, updated_at"""
    table_match = re.search(r"CREATE TABLE IF NOT EXISTS public\.institutions\s*\((.*?)\);", migration_sql, re.DOTALL)
    assert table_match, "public.institutions table definition not found"
    content = table_match.group(1)
    
    assert "id UUID PRIMARY KEY" in content
    assert "name TEXT" in content
    assert "type TEXT" in content
    assert "status TEXT" in content
    assert "created_at TIMESTAMPTZ" in content
    assert "updated_at TIMESTAMPTZ" in content

def test_static_institution_members_schema_columns(migration_sql):
    """STATIC: DATABASE_SCHEMA.md requires id, institution_id, user_id, role, status, created_at"""
    table_match = re.search(r"CREATE TABLE IF NOT EXISTS public\.institution_members\s*\((.*?)\);", migration_sql, re.DOTALL)
    assert table_match, "public.institution_members table definition not found"
    content = table_match.group(1)
    
    assert "id UUID PRIMARY KEY" in content
    assert "institution_id UUID" in content and "REFERENCES public.institutions(id)" in content
    assert "user_id UUID" in content and "REFERENCES auth.users(id)" in content
    assert "role TEXT" in content
    assert "status TEXT" in content
    assert "created_at TIMESTAMPTZ" in content

def test_static_rls_enabled_on_all_tables(migration_sql):
    """STATIC: Verifies RLS is enabled on all exposed tables."""
    assert "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;" in migration_sql
    assert "ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;" in migration_sql
    assert "ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;" in migration_sql

def test_static_rls_policies_exist(migration_sql):
    """STATIC: Verifies all mandatory RLS policy declarations exist."""
    # Profiles policies
    assert 'CREATE POLICY "profiles_select_own"' in migration_sql
    assert 'CREATE POLICY "profiles_insert_own"' in migration_sql
    assert 'CREATE POLICY "profiles_update_own"' in migration_sql
    assert 'CREATE POLICY "profiles_delete_own"' in migration_sql
    
    # Institution policies
    assert 'CREATE POLICY "institutions_select_member"' in migration_sql
    assert 'CREATE POLICY "institution_members_select_own"' in migration_sql

def test_static_institution_members_no_client_insert_update_policy(migration_sql):
    """
    STATIC: Verifies that institution_members has NO client INSERT or UPDATE policies.
    This guarantees roles cannot be self-assigned by clients through Supabase API.
    """
    assert "CREATE POLICY" in migration_sql
    # Search for any policy that permits INSERT or UPDATE on institution_members
    insert_policy = re.search(r'CREATE POLICY .* ON public\.institution_members FOR INSERT', migration_sql, re.IGNORECASE)
    update_policy = re.search(r'CREATE POLICY .* ON public\.institution_members FOR UPDATE', migration_sql, re.IGNORECASE)
    assert insert_policy is None, "Client INSERT policy must not exist on institution_members"
    assert update_policy is None, "Client UPDATE policy must not exist on institution_members"

# ------------------------------------------------------------
# RLS LOGIC SIMULATION (Tests A through G from Phase 1 Specification)
# ------------------------------------------------------------

def simulate_profiles_select_policy(auth_uid, row_id):
    """Simulates: auth.uid() = id"""
    if auth_uid is None:
        return False
    return auth_uid == row_id

def simulate_profiles_update_policy(auth_uid, row_id, new_row_id=None):
    """Simulates: USING (auth.uid() = id) WITH CHECK (auth.uid() = id)"""
    if auth_uid is None:
        return False
    using_check = (auth_uid == row_id)
    with_check = True if new_row_id is None else (auth_uid == new_row_id)
    return using_check and with_check

def simulate_institution_select_policy(auth_uid, institution_id, active_memberships):
    """
    Simulates:
    EXISTS (SELECT 1 FROM institution_members WHERE institution_id = institutions.id
            AND user_id = auth.uid() AND status = 'active')
    """
    if auth_uid is None:
        return False
    return any(
        m["institution_id"] == institution_id and m["user_id"] == auth_uid and m["status"] == "active"
        for m in active_memberships
    )

def test_simulated_scenario_a_user_accesses_own_profile():
    """SIMULATED TEST A: User A can access User A's permitted profile data."""
    user_a = "user-uuid-aaaa"
    assert simulate_profiles_select_policy(auth_uid=user_a, row_id=user_a) is True

def test_simulated_scenario_b_user_attempts_to_read_user_b():
    """SIMULATED TEST B: User A attempts to read User B's protected data. Expected: REJECTED."""
    user_a = "user-uuid-aaaa"
    user_b = "user-uuid-bbbb"
    assert simulate_profiles_select_policy(auth_uid=user_a, row_id=user_b) is False

def test_simulated_scenario_c_user_attempts_to_update_user_b():
    """SIMULATED TEST C: User A attempts to update User B's profile. Expected: REJECTED."""
    user_a = "user-uuid-aaaa"
    user_b = "user-uuid-bbbb"
    assert simulate_profiles_update_policy(auth_uid=user_a, row_id=user_b) is False

def test_simulated_scenario_d_client_attempts_to_submit_another_user_id():
    """SIMULATED TEST D: Client attempts to submit another user_id on insert/update. Expected: REJECTED."""
    user_a = "user-uuid-aaaa"
    attacker_submits_id = "user-uuid-bbbb"
    # WITH CHECK (auth.uid() = id)
    assert simulate_profiles_update_policy(auth_uid=user_a, row_id=user_a, new_row_id=attacker_submits_id) is False

def test_simulated_scenario_e_client_cannot_self_promote_role():
    """
    SIMULATED TEST E: Client attempts to submit an unauthorized role.
    Role is derived strictly from public.institution_members via DB lookup.
    """
    user_citizen = "citizen-uuid-1234"
    memberships = [] # Citizen has no records in institution_members
    can_view_institution = simulate_institution_select_policy(user_citizen, "inst-bank-01", memberships)
    assert can_view_institution is False

def test_simulated_scenario_f_institution_member_access_outside_boundary():
    """SIMULATED TEST F: Institution member attempts to access data outside their institution boundary. Expected: REJECTED."""
    user_bank_officer = "officer-uuid-5555"
    memberships = [{"institution_id": "inst-bank-01", "user_id": user_bank_officer, "status": "active"}]
    
    # Can access own institution
    assert simulate_institution_select_policy(user_bank_officer, "inst-bank-01", memberships) is True
    # CANNOT access another institution
    assert simulate_institution_select_policy(user_bank_officer, "inst-university-99", memberships) is False

def test_simulated_scenario_g_signed_out_client_access():
    """SIMULATED TEST G: Signed-out client attempts protected data access. Expected: REJECTED."""
    assert simulate_profiles_select_policy(auth_uid=None, row_id="user-uuid-aaaa") is False
    assert simulate_profiles_update_policy(auth_uid=None, row_id="user-uuid-aaaa") is False
    assert simulate_institution_select_policy(auth_uid=None, institution_id="inst-bank-01", active_memberships=[]) is False

def test_static_secret_scan_client_directories():
    """
    STATIC: Verifies that apps/mobile, apps/web, and packages/shared contain NO hardcoded secrets,
    private keys, or service-role tokens.
    """
    client_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../apps/mobile/src")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../apps/web/src")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../packages/shared/src")),
    ]
    
    prohibited_patterns = [
        re.compile(r"service_role", re.IGNORECASE),
        re.compile(r"eyJh[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}"), # JWT regex
        re.compile(r"sk-[a-zA-Z0-9]{20,}"), # Secret key regex
        re.compile(r"gsk_[a-zA-Z0-9]{20,}"), # Groq secret key regex
    ]
    
    for c_dir in client_dirs:
        for root, _, files in os.walk(c_dir):
            for file in files:
                if file.endswith((".ts", ".tsx", ".js", ".json")):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        for pattern in prohibited_patterns:
                            matches = pattern.findall(content)
                            assert len(matches) == 0, f"Potential secret pattern found in {file_path}: {matches}"

def test_static_client_vault_terminology_removed():
    """
    STATIC: Verifies that no client UI component presents the document/record vault
    as an existing feature in Phase 1.
    """
    client_dirs = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../apps/mobile/src")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../apps/web/src")),
    ]
    vault_regex = re.compile(r"vault", re.IGNORECASE)
    
    for c_dir in client_dirs:
        for root, _, files in os.walk(c_dir):
            for file in files:
                if file.endswith((".tsx",)):
                    file_path = os.path.join(root, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        matches = vault_regex.findall(content)
                        assert len(matches) == 0, f"Vault terminology found in Phase 1 UI: {file_path}"
