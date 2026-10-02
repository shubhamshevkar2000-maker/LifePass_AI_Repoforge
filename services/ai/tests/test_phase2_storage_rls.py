import json
import uuid
import pytest
import psycopg2
from psycopg2.errors import InsufficientPrivilege, CheckViolation

DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
