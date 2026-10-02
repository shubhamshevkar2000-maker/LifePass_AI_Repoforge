/**
 * LifePass AI — Matching & Readiness Client Service
 *
 * Implements the client-side service boundary for:
 * - POST /matching/evaluate (docs/API_CONTRACT.md Section 5)
 *
 * GOVERNANCE BOUNDARY:
 * This is client application code only. Matching evaluation and readiness
 * calculation are strictly computed by the backend service. If the backend
 * service is not yet deployed, this client falls back to isolated development
 * fixtures and marks `isDevFixture: true`.
 */

import { supabase } from '../lib/supabase';
import {
  MatchingEvaluateRequest,
  MatchingEvaluateResponse,
  ApiError,
} from '@lifepass/shared';
import { getFixtureMatchingEvaluate } from './fixtures/matchingFixtures';

export interface MatchingServiceResult {
  data: MatchingEvaluateResponse | null;
  error: ApiError | null;
  isDevFixture: boolean;
}

const BACKEND_SERVICE_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_AI_SERVICE_URL ||
  null;

/**
 * Evaluate user's vault records against a requirement profile
 * Contract: POST /matching/evaluate
 */
export async function evaluateRecordMatching(
  requirementProfileId: string
): Promise<MatchingServiceResult> {
  const trimmedProfileId = requirementProfileId?.trim();
  if (!trimmedProfileId) {
    return {
      data: null,
      error: {
        code: 'INVALID_INPUT',
        message: 'A valid requirement_profile_id is required for evaluation.',
      },
      isDevFixture: false,
    };
  }

  // 1. Attempt real backend endpoint if configured
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const userId = session?.user?.id;

      if (!userId) {
        return {
          data: null,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'You must be authenticated to evaluate record readiness.',
          },
          isDevFixture: false,
        };
      }

      const payload: MatchingEvaluateRequest = {
        user_id: userId,
        requirement_profile_id: trimmedProfileId,
      };

      const response = await fetch(`${BACKEND_SERVICE_BASE_URL}/matching/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = (await response.json()) as MatchingEvaluateResponse;
        return { data, error: null, isDevFixture: false };
      }

      const errorJson = await response.json().catch(() => null);
      if (errorJson?.error) {
        return { data: null, error: errorJson.error, isDevFixture: false };
      }
    } catch {
      console.warn(
        '[LifePass Matching Service] Live /matching/evaluate unreachable. Falling back to development fixture.'
      );
    }
  }

  // 2. Controlled Development Fixture fallback for UI verification
  try {
    const fixtureData = await getFixtureMatchingEvaluate(trimmedProfileId);
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
            message: 'Unable to evaluate record readiness.',
          },
      isDevFixture: true,
    };
  }
}
