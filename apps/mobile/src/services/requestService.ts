/**
 * LifePass AI — Citizen Access Request Client Service
 *
 * Implements the client-side service boundary for retrieving citizen requests.
 *
 * GOVERNANCE RULES:
 * - The client NEVER authorizes access or modifies request ownership directly.
 * - Authorization is strictly server-side.
 * - If backend endpoints are unprovisioned, this service falls back to
 *   isolated development fixtures and marks `isDevFixture: true`.
 * - Never present fixtures as real live backend data.
 */

import { supabase } from '../lib/supabase';
import { ApiError } from '@lifepass/shared';
import {
  CitizenRequest,
  RequestUiStatus,
  getFixtureCitizenRequests,
  getFixtureCitizenRequestById,
} from './fixtures/requestFixtures';

export type {
  CitizenRequest,
  RequestUiStatus,
  CitizenRequestedRequirement,
  CitizenSelectedRecord,
} from './fixtures/requestFixtures';

export interface RequestServiceResult<T> {
  data: T | null;
  error: ApiError | null;
  isDevFixture: boolean;
}

const BACKEND_SERVICE_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_AI_SERVICE_URL ||
  null;

/**
 * Fetch all citizen requests with optional status filtering.
 */
export async function fetchCitizenRequests(
  filterStatus?: RequestUiStatus
): Promise<RequestServiceResult<CitizenRequest[]>> {
  // 1. Try real backend endpoint if configured
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const url = filterStatus
        ? `${BACKEND_SERVICE_BASE_URL}/requests?status=${filterStatus}`
        : `${BACKEND_SERVICE_BASE_URL}/requests`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.requests as CitizenRequest[];
        return { data, error: null, isDevFixture: false };
      }

      const errorJson = await response.json().catch(() => null);
      if (errorJson?.error) {
        return { data: null, error: errorJson.error, isDevFixture: false };
      }
    } catch {
      // Backend not yet reachable, fallback to development fixtures
    }
  }

  // 2. Controlled Development Fixture fallback
  try {
    const fixtureData = await getFixtureCitizenRequests(filterStatus);
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
            message: 'Unable to retrieve citizen access requests.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Fetch a single citizen request by ID.
 */
export async function fetchCitizenRequestById(
  requestId: string
): Promise<RequestServiceResult<CitizenRequest>> {
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

  // 1. Try real backend endpoint if configured
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${BACKEND_SERVICE_BASE_URL}/requests/${trimmedId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (response.ok) {
        const json = await response.json();
        const data = json.request as CitizenRequest;
        return { data, error: null, isDevFixture: false };
      }

      const errorJson = await response.json().catch(() => null);
      if (errorJson?.error) {
        return { data: null, error: errorJson.error, isDevFixture: false };
      }
    } catch {
      // Backend not yet reachable, fallback to development fixtures
    }
  }

  // 2. Controlled Development Fixture fallback
  try {
    const fixtureData = await getFixtureCitizenRequestById(trimmedId);
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
            message: 'Unable to retrieve access request details.',
          },
      isDevFixture: true,
    };
  }
}
