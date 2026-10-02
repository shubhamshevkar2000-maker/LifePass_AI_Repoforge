import pytest
import requests
import json
import uuid
import psycopg2
from datetime import datetime

DB_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
API_URL = "http://127.0.0.1:54321/functions/v1"
ANON_KEY = "" # I will fetch this
SERVICE_KEY = "" # I will fetch this
