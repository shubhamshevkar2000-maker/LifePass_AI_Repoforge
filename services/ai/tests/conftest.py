import pytest
import psycopg2

DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

@pytest.fixture(scope="session")
def admin_db_conn():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    yield conn
    conn.rollback()
    conn.close()
