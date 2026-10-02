/**
 * LifePass AI — Temporary Development Fixtures for Citizen Requests
 *
 * CAUTION / NOTICE:
 * This file contains strictly labelled development fixtures for UI testing
 * during Requests and Request Detail citizen mobile frontend implementation.
 *
 * DO NOT represent this fixture data as real backend access requests or claim
 * that fixture state represents live database grants.
 * Authoritative schema: docs/DATABASE_SCHEMA.md Section 5, docs/FRONTEND_SPEC.md Section 7,
 * and docs/DEMO_FLOW.md Steps 4-9.
 */

import { AccessRequestStatus, ApiError } from '@lifepass/shared';

export type RequestUiStatus = 'pending' | 'active' | 'completed' | 'expired';

export interface CitizenRequestedRequirement {
  id: string;
  name: string;
  code: string;
  category: string;
  matchedRecordId?: string;
  matchedRecordTitle?: string;
  isMissing?: boolean;
}

export interface CitizenSelectedRecord {
  id: string;
  title: string;
  category: string;
  documentType: string;
}

export interface CitizenRequest {
  id: string;
  institution_id: string;
  institution_name: string;
  purpose: string;
  status: RequestUiStatus;
  raw_status: AccessRequestStatus;
  requirement_profile_id: string;
  requirement_profile_name: string;
  requested_requirements: CitizenRequestedRequirement[];
  selected_records: CitizenSelectedRecord[];
  created_at: string;
  expires_at: string;
  consented_at?: string;
  denied_at?: string;
}

// 30 days in the future for pending/active requests
const FUTURE_DATE_30D = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const PAST_DATE_7D = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const PAST_DATE_3D = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const PAST_DATE_45D = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_CITIZEN_REQUESTS: CitizenRequest[] = [
  // 1. PENDING REQUEST (Matches Demo Flow: Education Loan from Demo Financial Institution)
  {
    id: 'req-edu-001',
    institution_id: 'inst-001',
    institution_name: 'Demo Financial Institution (Demo Fixture)',
    purpose: 'Education Loan Application',
    status: 'pending',
    raw_status: 'pending_user',
    requirement_profile_id: '00000000-0000-0000-0000-000000000001',
    requirement_profile_name: 'Education Loan Requirement Profile',
    requested_requirements: [
      {
        id: 'req-001',
        name: 'Identity proof',
        code: 'identity_proof',
        category: 'identity',
        matchedRecordId: 'dev-fix-001',
        matchedRecordTitle: 'Aadhaar Card (National Identity)',
      },
      {
        id: 'req-002',
        name: 'Address proof',
        code: 'address_proof',
        category: 'identity',
        matchedRecordId: 'dev-fix-003',
        matchedRecordTitle: 'Electricity Utility Bill (Residence Proof)',
      },
      {
        id: 'req-003',
        name: 'Academic record',
        code: 'academic_record',
        category: 'education',
        matchedRecordId: 'dev-fix-002',
        matchedRecordTitle: 'B.Tech Degree Certificate',
      },
      {
        id: 'req-004',
        name: 'Income proof',
        code: 'income_proof',
        category: 'finance',
        matchedRecordId: 'dev-fix-004',
        matchedRecordTitle: 'Income Tax Return (ITR-V FY2024)',
      },
      {
        id: 'req-005',
        name: 'Admission letter',
        code: 'admission_letter',
        category: 'education',
        isMissing: true,
      },
    ],
    selected_records: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    expires_at: FUTURE_DATE_30D,
  },

  // 2. ACTIVE REQUEST
  {
    id: 'req-active-002',
    institution_id: 'inst-002',
    institution_name: 'Apex Capital Partners (Demo Fixture)',
    purpose: 'Credit Assessment & Financial Verification',
    status: 'active',
    raw_status: 'approved',
    requirement_profile_id: '00000000-0000-0000-0000-000000000002',
    requirement_profile_name: 'Financial Background Check',
    requested_requirements: [
      {
        id: 'req-001',
        name: 'Identity proof',
        code: 'identity_proof',
        category: 'identity',
        matchedRecordId: 'dev-fix-001',
        matchedRecordTitle: 'Aadhaar Card (National Identity)',
      },
      {
        id: 'req-004',
        name: 'Income proof',
        code: 'income_proof',
        category: 'finance',
        matchedRecordId: 'dev-fix-004',
        matchedRecordTitle: 'Income Tax Return (ITR-V FY2024)',
      },
    ],
    selected_records: [
      {
        id: 'dev-fix-001',
        title: 'Aadhaar Card (National Identity)',
        category: 'identity',
        documentType: 'national_id',
      },
      {
        id: 'dev-fix-004',
        title: 'Income Tax Return (ITR-V FY2024)',
        category: 'finance',
        documentType: 'tax_return_itr',
      },
    ],
    created_at: PAST_DATE_3D,
    expires_at: FUTURE_DATE_30D,
    consented_at: PAST_DATE_3D,
  },

  // 3. COMPLETED REQUEST
  {
    id: 'req-comp-003',
    institution_id: 'inst-003',
    institution_name: 'Metro University Admissions (Demo Fixture)',
    purpose: 'Academic Credential & Transcript Verification',
    status: 'completed',
    raw_status: 'completed',
    requirement_profile_id: '00000000-0000-0000-0000-000000000003',
    requirement_profile_name: "Master's Program Admission",
    requested_requirements: [
      {
        id: 'req-001',
        name: 'Identity proof',
        code: 'identity_proof',
        category: 'identity',
        matchedRecordId: 'dev-fix-001',
        matchedRecordTitle: 'Aadhaar Card (National Identity)',
      },
      {
        id: 'req-003',
        name: 'Academic record',
        code: 'academic_record',
        category: 'education',
        matchedRecordId: 'dev-fix-002',
        matchedRecordTitle: 'B.Tech Degree Certificate',
      },
    ],
    selected_records: [
      {
        id: 'dev-fix-001',
        title: 'Aadhaar Card (National Identity)',
        category: 'identity',
        documentType: 'national_id',
      },
      {
        id: 'dev-fix-002',
        title: 'B.Tech Degree Certificate',
        category: 'education',
        documentType: 'degree_certificate',
      },
    ],
    created_at: PAST_DATE_45D,
    expires_at: PAST_DATE_7D,
    consented_at: PAST_DATE_45D,
  },

  // 4. EXPIRED REQUEST
  {
    id: 'req-exp-004',
    institution_id: 'inst-004',
    institution_name: 'Prime Properties Leasing (Demo Fixture)',
    purpose: 'Tenancy Background Verification',
    status: 'expired',
    raw_status: 'expired',
    requirement_profile_id: '00000000-0000-0000-0000-000000000004',
    requirement_profile_name: 'Rental Apartment Lease',
    requested_requirements: [
      {
        id: 'req-001',
        name: 'Identity proof',
        code: 'identity_proof',
        category: 'identity',
        matchedRecordId: 'dev-fix-001',
        matchedRecordTitle: 'Aadhaar Card (National Identity)',
      },
      {
        id: 'req-002',
        name: 'Address proof',
        code: 'address_proof',
        category: 'identity',
        matchedRecordId: 'dev-fix-003',
        matchedRecordTitle: 'Electricity Utility Bill (Residence Proof)',
      },
    ],
    selected_records: [],
    created_at: PAST_DATE_45D,
    expires_at: PAST_DATE_7D,
  },
];

/**
 * Fixture resolver simulating latency and error states for fetching citizen requests.
 */
export async function getFixtureCitizenRequests(
  filterStatus?: RequestUiStatus
): Promise<CitizenRequest[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (filterStatus) {
    return DEMO_CITIZEN_REQUESTS.filter((req) => req.status === filterStatus);
  }

  return [...DEMO_CITIZEN_REQUESTS];
}

/**
 * Fixture resolver for retrieving a single request by ID.
 */
export async function getFixtureCitizenRequestById(
  requestId: string
): Promise<CitizenRequest> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!requestId || requestId.trim() === '') {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'A valid request_id is required.',
    };
    throw error;
  }

  if (requestId === 'sim_req_error') {
    const error: ApiError = {
      code: 'PROCESSING_FAILED',
      message: 'Failed to retrieve access request information.',
    };
    throw error;
  }

  const found = DEMO_CITIZEN_REQUESTS.find((req) => req.id === requestId);
  if (found) {
    return { ...found };
  }

  const error: ApiError = {
    code: 'NOT_FOUND',
    message: `Access request with ID "${requestId}" not found.`,
  };
  throw error;
}
