/**
 * LifePass AI — Temporary Development Fixtures for Consent & Access Requests
 *
 * CAUTION / NOTICE:
 * This file contains strictly labelled development fixtures for UI testing
 * during Review & Sharing and Consent UX implementation.
 *
 * DO NOT represent this fixture data as real backend authorization or claim
 * fixture consent grants real institution access.
 * Authoritative schema: docs/API_CONTRACT.md Section 7, docs/SECURITY_CONSENT.md Section 5,
 * and docs/DEMO_FLOW.md Step 9-11.
 */

import {
  AccessRequestContext,
  ConsentRequestPayload,
  ConsentDecision,
  ApiError,
} from '@lifepass/shared';

/**
 * INTERNAL CLIENT UI TYPE ONLY:
 * docs/API_CONTRACT.md Section 7 does NOT define a response schema for POST /requests/{id}/consent.
 * This interface is strictly an internal mobile UI state representation for displaying the
 * post-decision confirmation view. It makes no claim to be a specification API contract.
 */
export interface ConsentUiResult {
  consent_id?: string;
  request_id: string;
  decision: ConsentDecision;
  status: 'granted' | 'denied';
  institution_name: string;
  purpose: string;
  selected_record_ids: string[];
  expires_at?: string;
  timestamp: string;
}

// Expiry set to 30 days in the future
const DEMO_EXPIRY_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_ACCESS_REQUEST_FIXTURE: AccessRequestContext = {
  request_id: 'req-access-001',
  institution_id: 'inst-001',
  institution_name: 'Demo Bank',
  requirement_profile_id: '00000000-0000-0000-0000-000000000001',
  purpose: 'Education Loan Application',
  status: 'pending_user',
  expires_at: DEMO_EXPIRY_DATE,
  created_at: new Date().toISOString(),
};

/**
 * Fetch simulated access request context
 */
export async function getFixtureAccessRequest(
  requestId: string
): Promise<AccessRequestContext> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!requestId || requestId.trim() === '') {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'A valid request_id is required to fetch consent context.',
    };
    throw error;
  }

  if (requestId === 'sim_expired') {
    return {
      ...DEMO_ACCESS_REQUEST_FIXTURE,
      request_id: 'sim_expired',
      status: 'expired',
      expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  if (requestId === 'sim_error') {
    const error: ApiError = {
      code: 'PROCESSING_FAILED',
      message: 'Failed to retrieve access request information.',
    };
    throw error;
  }

  return { ...DEMO_ACCESS_REQUEST_FIXTURE, request_id: requestId };
}

/**
 * Submit simulated consent decision
 * Contract: POST /requests/{id}/consent
 */
export async function submitFixtureConsent(
  requestId: string,
  payload: ConsentRequestPayload
): Promise<ConsentUiResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!payload || !payload.decision) {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'A decision (grant or deny) must be explicitly supplied.',
    };
    throw error;
  }

  if (payload.decision === 'grant' && (!payload.selected_record_ids || payload.selected_record_ids.length === 0)) {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'At least one record must be selected when granting consent.',
    };
    throw error;
  }

  if (requestId === 'sim_expired') {
    const error: ApiError = {
      code: 'REQUEST_EXPIRED',
      message: 'This access request has expired. Records cannot be shared.',
    };
    throw error;
  }

  return {
    consent_id: `consent-${Date.now()}`,
    request_id: requestId,
    decision: payload.decision,
    status: payload.decision === 'grant' ? 'granted' : 'denied',
    institution_name: 'Demo Bank',
    purpose: 'Education Loan Application',
    selected_record_ids: payload.decision === 'grant' ? payload.selected_record_ids : [],
    expires_at: payload.decision === 'grant' ? DEMO_EXPIRY_DATE : undefined,
    timestamp: new Date().toISOString(),
  };
}
