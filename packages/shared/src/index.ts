/**
 * LifePass AI — Shared Types & Contracts Package Baseline
 *
 * PHASE 1: IDENTITY, AUTHENTICATION & CORE DATABASE MODEL
 */

export const LIFEPASS_SHARED_VERSION = "0.2.0";

export type UserRole = "citizen" | "institution_member" | "admin";

export interface Profile {
  id: string; // references auth.users.id
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InstitutionMember {
  id: string;
  institution_id: string;
  user_id: string;
  role: string;
  status: string;
  created_at: string;
}

export interface AuthSessionState {
  userId: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  role: UserRole;
  profile: Profile | null;
  institutionMemberships?: InstitutionMember[];
}

export interface SystemStatus {
  phase: string;
  version: string;
  environment: string;
}

export const GET_INITIAL_SYSTEM_STATUS = (): SystemStatus => ({
  phase: "2.0",
  version: LIFEPASS_SHARED_VERSION,
  environment: "development",
});

/**
 * PHASE 2: CITIZEN RECORD VAULT CONTRACTS
 * Authoritative schema: docs/DATABASE_SCHEMA.md Section 3 & docs/BACKEND_SPEC.md Section 4
 */

export type RecordCategory =
  | "identity"
  | "education"
  | "employment"
  | "finance"
  | "healthcare";

export type RecordStatus =
  | "uploaded"
  | "processing"
  | "processed"
  | "needs_review"
  | "expired"
  | "archived";

export type ExternalVerificationStatus =
  | "not_verified"
  | "source_verified"
  | "source_rejected"
  | "verification_unavailable";

export type RecordSourceType =
  | "upload"
  | "issuer_link"
  | "institution_shared";

export interface RecordItem {
  id: string; // uuid PK
  user_id: string; // uuid FK to auth.users
  title: string;
  category: RecordCategory;
  document_type: string;
  issuer_name: string | null;
  issue_date: string | null; // ISO Date YYYY-MM-DD
  expiry_date: string | null; // ISO Date YYYY-MM-DD
  status: RecordStatus;
  external_verification_status: ExternalVerificationStatus;
  source_type: RecordSourceType;
  storage_path: string;
  mime_type: string;
  file_size: number;
  metadata: { [key: string]: unknown }; // JSONB
  created_at: string;
  updated_at: string;
}

export interface CreateRecordInput {
  title: string;
  category: RecordCategory;
  document_type: string;
  issuer_name?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  storage_path: string;
  mime_type: string;
  file_size: number;
  source_type?: RecordSourceType;
  metadata?: { [key: string]: unknown };
}

/**
 * PHASE 3: LIFE-STAGE KNOWLEDGE & REQUIREMENT CONTRACTS
 * Authoritative schema: docs/API_CONTRACT.md Section 4 & docs/DATABASE_SCHEMA.md Section 4
 */

export interface AiIntentRequest {
  message: string;
}

export interface AiIntentResponse {
  intent: string;
  task: string;
  domain: string;
  institution_type: string;
  confidence?: number;
}

export type RequirementState =
  | 'required'
  | 'optional'
  | 'found'
  | 'missing'
  | 'attention_needed';

export interface RequirementItem {
  id: string; // uuid PK
  profile_id?: string;
  code: string;
  name: string;
  category?: string;
  required: boolean;
  accepted_document_types?: string[];
  rules?: { [key: string]: unknown };
  display_order?: number;
  state?: RequirementState;
}

export interface AiRequirementsRequest {
  task: string;
}

export interface RequirementProfile {
  profile_id: string; // uuid
  name: string;
  domain?: string;
  task_code?: string;
  version: string;
  description?: string;
  status?: string;
  requirements: RequirementItem[];
}

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'CONSENT_REQUIRED'
  | 'REQUEST_EXPIRED'
  | 'RECORD_PROCESSING'
  | 'AI_UNAVAILABLE'
  | 'REQUIREMENT_PROFILE_NOT_FOUND'
  | 'PROCESSING_FAILED'
  | 'NETWORK_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  request_id?: string;
}

/**
 * MATCHING & READINESS CONTRACTS
 * Authoritative schema: docs/API_CONTRACT.md Section 5
 */

export interface MatchedRequirementItem {
  requirement_id: string;
  requirement_name: string;
  requirement_code?: string;
  record_id?: string;
  record_title?: string;
  processing_status?: RecordStatus;
  external_verification_status?: ExternalVerificationStatus;
}

export interface MissingRequirementItem {
  requirement_id: string;
  requirement_name: string;
  requirement_code?: string;
  category?: RecordCategory;
  reason?: string;
}

export interface AttentionNeededRequirementItem {
  requirement_id: string;
  requirement_name: string;
  requirement_code?: string;
  record_id?: string;
  record_title?: string;
  state?: string;
  reason?: string;
}

export interface MatchingEvaluateRequest {
  user_id: string;
  requirement_profile_id: string;
}

export interface MatchingEvaluateResponse {
  readiness_percent: number;
  matched: MatchedRequirementItem[];
  missing: MissingRequirementItem[];
  attention_needed: AttentionNeededRequirementItem[];
}

/**
 * AI EXPLANATION CONTRACT (SEPARATE ENDPOINT)
 * Authoritative schema: docs/API_CONTRACT.md Section 4 (POST /ai/explain)
 */
export interface AiExplainRequest {
  result_data: { [key: string]: unknown };
}

export interface AiExplainResponse {
  explanation: string;
}

/**
 * PHASE 7: CONSENT & ACCESS REQUEST CONTRACTS
 * Authoritative schema: docs/API_CONTRACT.md Section 7 & docs/SECURITY_CONSENT.md Section 5
 */

export type ConsentDecision = 'grant' | 'deny';

export interface ConsentRequestPayload {
  decision: ConsentDecision;
  selected_record_ids: string[];
}

export type AccessRequestStatus =
  | 'draft'
  | 'sent'
  | 'pending_user'
  | 'approved'
  | 'partially_approved'
  | 'denied'
  | 'expired'
  | 'completed'
  | 'revoked';

export interface AccessRequestContext {
  request_id: string;
  institution_id: string;
  institution_name: string;
  requirement_profile_id: string;
  purpose: string;
  status: AccessRequestStatus;
  expires_at: string;
  created_at: string;
}




