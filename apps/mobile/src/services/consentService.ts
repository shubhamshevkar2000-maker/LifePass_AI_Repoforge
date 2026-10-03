/**
 * LifePass AI — Consent & Access Request Client Service
 *
 * Implements the client-side service boundary for:
 * - POST /requests/{id}/consent (docs/API_CONTRACT.md Section 7)
 *
 * GOVERNANCE RULES:
 * - The client NEVER authorizes access or updates consent database state directly.
 * - Authorization is strictly server-side.
 * - If backend consent routes are unprovisioned, this service falls back to
 *   isolated development fixtures and marks `isDevFixture: true`.
 */

import { supabase } from '../lib/supabase';
import {
  AccessRequestContext,
  ConsentRequestPayload,
  ApiError,
} from '@lifepass/shared';
import {
  getFixtureAccessRequest,
  submitFixtureConsent,
  ConsentUiResult,
} from './fixtures/consentFixtures';

export type { ConsentUiResult } from './fixtures/consentFixtures';

export interface ConsentServiceResult<T> {
  data: T | null;
  error: ApiError | null;
  isDevFixture: boolean;
}

const BACKEND_SERVICE_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_AI_SERVICE_URL ||
  null;

/**
 * Fetch access request details for citizen review
 */
export async function fetchAccessRequest(
  requestId: string,
  isDemoMode?: boolean
): Promise<ConsentServiceResult<AccessRequestContext>> {
  const trimmedId = requestId?.trim();
  if (!trimmedId) {
    return {
      data: null,
      error: {
        code: 'INVALID_INPUT',
        message: 'A valid request_id is required.',
      },
      isDevFixture: false,
    };
  }

  // 1. Try real backend endpoint if configured and not demo mode
  if (!isDemoMode && BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const fetchPromise = fetch(`${BACKEND_SERVICE_BASE_URL}/requests/${trimmedId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network request timed out')), 2000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (response.ok) {
        const data = (await response.json()) as AccessRequestContext;
        return { data, error: null, isDevFixture: false };
      }

      const errorJson = await response.json().catch(() => null);
      if (errorJson?.error) {
        return { data: null, error: errorJson.error, isDevFixture: false };
      }
    } catch {
      console.warn(
        '[LifePass Consent Service] Live /requests/{id} unreachable. Falling back to development fixture.'
      );
    }
  }

  // 2. Controlled Development Fixture fallback
  try {
    const fixtureData = await getFixtureAccessRequest(trimmedId);
    return {
      data: fixtureData,
      error: null,
      isDevFixture: true,
    };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to retrieve access request context.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Submit citizen consent decision
 * Contract: POST /requests/{id}/consent
 * Body: { decision: "grant" | "deny", selected_record_ids: string[] }
 */
export async function submitConsent(
  requestId: string,
  payload: ConsentRequestPayload,
  isDemoMode?: boolean
): Promise<ConsentServiceResult<ConsentUiResult>> {
  const trimmedId = requestId?.trim();
  if (!trimmedId) {
    return {
      data: null,
      error: {
        code: 'INVALID_INPUT',
        message: 'A valid request_id is required.',
      },
      isDevFixture: false,
    };
  }

  // 1. Try real backend endpoint if configured and not demo mode
  if (!isDemoMode) {
    try {
      const invokePromise = supabase.functions.invoke('consent_decision', {
        body: { request_id: trimmedId, decision: payload.decision, selected_record_ids: payload.selected_record_ids }
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network request timed out')), 2000)
      );

      const { data, error } = (await Promise.race([invokePromise, timeoutPromise])) as any;
      if (error) {
         return { data: null, error: { code: 'PROCESSING_FAILED', message: error.message }, isDevFixture: false };
      }
      return { data: data as ConsentUiResult, error: null, isDevFixture: false };

    } catch {
      console.warn(
        '[LifePass Consent Service] Live /requests/{id}/consent unreachable. Falling back to development fixture.'
      );
    }
  }

  // 2. Controlled Development Fixture fallback
  try {
    const fixtureData = await submitFixtureConsent(trimmedId, payload);
    return {
      data: fixtureData,
      error: null,
      isDevFixture: true,
    };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to submit consent decision.',
          },
      isDevFixture: true,
    };
  }
}


export async function revokeConsent(consentId: string): Promise<ConsentServiceResult<{ success: boolean }>> {
  if (true) {
    const { data, error } = await supabase.functions.invoke('consent_revoke', {
      body: { consent_id: consentId }
    });
    if (error) {
       return { data: null, error: { code: 'PROCESSING_FAILED', message: error.message }, isDevFixture: false };
    }
    return { data: { success: true }, error: null, isDevFixture: false };
  }
  return { data: null, error: null, isDevFixture: true };
}
