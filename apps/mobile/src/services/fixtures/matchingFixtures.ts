/**
 * LifePass AI — Temporary Development Fixtures for Matching & Readiness
 *
 * CAUTION / NOTICE:
 * This file contains strictly labelled development fixtures for UI/client testing
 * during Phase 3 / Phase 6 matching results frontend implementation.
 *
 * DO NOT represent this fixture data as real backend evaluation or claim backend
 * matching integration is complete.
 * Authoritative schema: docs/DEMO_FLOW.md Section 3, docs/API_CONTRACT.md Section 5,
 * and docs/BACKEND_SPEC.md Section 3.
 */

import {
  MatchingEvaluateResponse,
  ApiError,
} from '@lifepass/shared';

export const EDUCATION_LOAN_MATCHING_FIXTURE: MatchingEvaluateResponse = {
  readiness_percent: 80,
  matched: [
    {
      requirement_id: 'req-001',
      requirement_name: 'Identity proof',
      requirement_code: 'identity_proof',
      record_id: 'dev-fix-001',
      record_title: 'Aadhaar Card (National Identity)',
      processing_status: 'processed',
      external_verification_status: 'not_verified',
    },
    {
      requirement_id: 'req-002',
      requirement_name: 'Address proof',
      requirement_code: 'address_proof',
      record_id: 'dev-fix-003',
      record_title: 'Electricity Utility Bill (Residence Proof)',
      processing_status: 'processed',
      external_verification_status: 'not_verified',
    },
    {
      requirement_id: 'req-003',
      requirement_name: 'Academic record',
      requirement_code: 'academic_record',
      record_id: 'dev-fix-002',
      record_title: 'B.Tech Degree Certificate',
      processing_status: 'processed',
      external_verification_status: 'not_verified',
    },
    {
      requirement_id: 'req-004',
      requirement_name: 'Income proof',
      requirement_code: 'income_proof',
      record_id: 'dev-fix-004',
      record_title: 'Income Tax Return (ITR-V FY2024)',
      processing_status: 'processed',
      external_verification_status: 'not_verified',
    },
  ],
  missing: [
    {
      requirement_id: 'req-005',
      requirement_name: 'Admission letter',
      requirement_code: 'admission_letter',
      category: 'education',
      reason: 'No matching university admission or offer letter found in your personal record vault.',
    },
  ],
  attention_needed: [],
};

/**
 * Fixture resolver simulating latency and error handling for evaluate
 */
export async function getFixtureMatchingEvaluate(
  profileId: string
): Promise<MatchingEvaluateResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!profileId || profileId.trim() === '') {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'A valid requirement_profile_id is required to evaluate records.',
    };
    throw error;
  }

  if (profileId === 'sim_matching_offline' || profileId.includes('error')) {
    const error: ApiError = {
      code: 'PROCESSING_FAILED',
      message: 'The LifePass deterministic matching engine failed to evaluate records.',
    };
    throw error;
  }

  // Canonical Education Loan profile ID
  if (
    profileId === '00000000-0000-0000-0000-000000000001' ||
    profileId.toLowerCase().includes('education') ||
    profileId.toLowerCase().includes('loan')
  ) {
    return { ...EDUCATION_LOAN_MATCHING_FIXTURE };
  }

  // Fallback scenario for other profiles
  const error: ApiError = {
    code: 'REQUIREMENT_PROFILE_NOT_FOUND',
    message: `No active requirement profile matching ID: ${profileId}`,
  };
  throw error;
}
