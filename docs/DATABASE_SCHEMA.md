# LifePass — Database Schema

**Version:** 1.2  
**Status:** REVISED ARCHITECTURAL BASELINE  
**Database:** Supabase PostgreSQL

## 1. Design principles

- UUID primary keys.
- Foreign keys wherever relationships exist.
- Timestamps in UTC.
- RLS on exposed tables.
- User ownership must be explicit.
- Consent is stored as a first-class record.
- Audit events are append-oriented.
- File content is stored in Supabase Storage; database stores metadata and storage references.

## 2. Core tables

### profiles
- `id uuid PK` — references auth user
- `username text unique nullable`
- `full_name text`
- `phone text nullable`
- `role text nullable`
- `avatar_url text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

### institutions
- `id uuid PK`
- `name text`
- `type text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### institution_members
- `id uuid PK`
- `institution_id uuid FK`
- `user_id uuid FK`
- `role text`
- `status text`
- `created_at timestamptz`

## 3. Records

### records
- `id uuid PK`
- `user_id uuid FK`
- `title text`
- `category text`
- `document_type text`
- `issuer_name text nullable`
- `issue_date date nullable`
- `expiry_date date nullable`
- `status text`
- `external_verification_status text`
- `source_type text`
- `storage_path text`
- `mime_type text`
- `file_size bigint`
- `metadata jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

### record_extractions
- `id uuid PK`
- `record_id uuid FK`
- `extracted_text text`
- `extracted_metadata jsonb`
- `classification_confidence numeric nullable`
- `processing_version text`
- `created_at timestamptz`

Never store an LLM claim as an authoritative verification field.

## 4. Requirement knowledge

### requirement_profiles
- `id uuid PK`
- `name text`
- `domain text`
- `task_code text`
- `version text`
- `description text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

### requirements
- `id uuid PK`
- `profile_id uuid FK`
- `code text`
- `name text`
- `category text`
- `required boolean`
- `accepted_document_types jsonb`
- `rules jsonb`
- `display_order int`

The requirement knowledge base is controlled/versioned data. The LLM must not invent requirements.

## 5. Requests and consent

### access_requests
- `id uuid PK`
- `institution_id uuid FK`
- `user_id uuid FK`
- `requirement_profile_id uuid FK`
- `purpose text`
- `status text`
- `expires_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

### request_items
- `id uuid PK`
- `request_id uuid FK`
- `requirement_id uuid FK`
- `record_id uuid nullable FK`
- `match_status text`
- `user_decision text nullable`

### consents
- `id uuid PK`
- `request_id uuid FK`
- `user_id uuid FK`
- `institution_id uuid FK`
- `purpose text`
- `status text`
- `granted_at timestamptz nullable`
- `expires_at timestamptz nullable`
- `revoked_at timestamptz nullable`
- `created_at timestamptz`

## 6. Audit

### audit_events
- `id uuid PK`
- `actor_user_id uuid nullable FK`
- `institution_id uuid nullable FK`
- `event_type text`
- `entity_type text`
- `entity_id uuid nullable`
- `request_id uuid nullable FK`
- `metadata jsonb`
- `created_at timestamptz`

Audit events must not contain unnecessary document contents or secrets.

## 7. Notifications

### notifications
- `id uuid PK`
- `user_id uuid FK`
- `type text`
- `title text`
- `body text`
- `data jsonb`
- `read_at timestamptz nullable`
- `created_at timestamptz`

## 8. Future vector indexing

FAISS index data may live in the AI service/index storage rather than PostgreSQL.

If embeddings are persisted in Postgres later, the change must be explicitly documented.

## 8.5 Authentication data boundary

Authentication is managed by Supabase Auth (or auth adapter during isolated frontend development) using a **Username and Password** model. Do not store plaintext passwords in application tables. The application database stores only profile and application data needed after successful authentication.

*Temporary Consent Verification:* The separate temporary-access verification / OTP mechanism for authorizing institutional access to personal records is managed under consent records and access requests, not as login authentication credentials.

## 9. RLS baseline

Every user-owned table must enforce user ownership.

Institution tables must enforce membership.

Request/consent access must enforce:
- correct user
- correct institution
- correct request
- valid status/expiry

Do not rely on frontend filtering for security.

Supabase recommends enabling RLS on exposed tables and designing policies explicitly.
