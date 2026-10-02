/**
 * LifePass AI — Institution Web Portal Client Service
 *
 * Implements the client-side service boundary for institution endpoints:
 * - GET /institution/dashboard (docs/API_CONTRACT.md Section 6)
 * - POST /institution/requests
 * - GET /institution/requests/{id}
 * - POST /institution/requests/{id}/send
 *
 * GOVERNANCE RULES:
 * - Does NOT invent unsupported backend endpoints.
 * - If backend endpoints are unprovisioned, falls back to isolated, labelled
 *   development fixtures and marks `isDevFixture: true`.
 * - Never present fixtures as real production data.
 */

import { supabase } from '../lib/supabase';
import { ApiError } from '@lifepass/shared';
import {
  InstitutionRequestItem,
  InstitutionDashboardStats,
  AuditEventItem,
  getFixtureInstitutionRequests,
  getFixtureInstitutionRequestById,
  createFixtureInstitutionRequest,
  getFixtureAuditEvents,
} from './fixtures/institutionFixtures';

export type {
  InstitutionRequestItem,
  InstitutionDashboardStats,
  SubmittedDocItem,
  AuditEventItem,
} from './fixtures/institutionFixtures';

export interface InstitutionServiceResult<T> {
  data: T | null;
  error: ApiError | null;
  isDevFixture: boolean;
}

const BACKEND_SERVICE_BASE_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ||
  (import.meta as any).env?.VITE_AI_SERVICE_URL ||
  null;

/**
 * Retrieve institution dashboard operational metrics.
 * Endpoint: GET /institution/dashboard
 */
export async function fetchInstitutionDashboard(): Promise<
  InstitutionServiceResult<InstitutionDashboardStats>
> {
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${BACKEND_SERVICE_BASE_URL}/institution/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (response.ok) {
        const data = (await response.json()) as InstitutionDashboardStats;
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

  try {
    const requests = await getFixtureInstitutionRequests();
    const stats: InstitutionDashboardStats = {
      activeRequests: requests.length,
      underReview: requests.filter((r) => r.status === 'under_review').length,
      awaitingConsent: requests.filter((r) => r.status === 'awaiting_consent').length,
      completed: requests.filter((r) => r.status === 'completed').length,
    };
    return { data: stats, error: null, isDevFixture: true };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to retrieve dashboard metrics.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Retrieve institution applications / requests.
 */
export async function fetchInstitutionRequests(): Promise<
  InstitutionServiceResult<InstitutionRequestItem[]>
> {
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${BACKEND_SERVICE_BASE_URL}/institution/requests`, {
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
      });

      if (response.ok) {
        const data = (await response.json()) as InstitutionRequestItem[];
        return { data, error: null, isDevFixture: false };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const data = await getFixtureInstitutionRequests();
    return { data, error: null, isDevFixture: true };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to retrieve requests.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Retrieve a single request by ID.
 * Endpoint: GET /institution/requests/{id}
 */
export async function fetchInstitutionRequestById(
  requestId: string
): Promise<InstitutionServiceResult<InstitutionRequestItem>> {
  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(
        `${BACKEND_SERVICE_BASE_URL}/institution/requests/${requestId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as InstitutionRequestItem;
        return { data, error: null, isDevFixture: false };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const data = await getFixtureInstitutionRequestById(requestId);
    if (!data) {
      return {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: `Application with ID "${requestId}" not found.`,
        },
        isDevFixture: true,
      };
    }
    return { data, error: null, isDevFixture: true };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to retrieve application details.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Create and send a new access request to a citizen.
 * Endpoints: POST /institution/requests -> POST /institution/requests/{id}/send
 */
export async function createAndSendInstitutionRequest(input: {
  citizenPhone: string;
  purpose: string;
  requirementProfileId: string;
}): Promise<InstitutionServiceResult<InstitutionRequestItem>> {
  if (!input.citizenPhone || !input.purpose || !input.requirementProfileId) {
    return {
      data: null,
      error: {
        code: 'INVALID_INPUT',
        message: 'Applicant phone, purpose, and requirement profile are required.',
      },
      isDevFixture: false,
    };
  }

  if (BACKEND_SERVICE_BASE_URL) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const response = await fetch(`${BACKEND_SERVICE_BASE_URL}/institution/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          citizen_phone: input.citizenPhone,
          purpose: input.purpose,
          requirement_profile_id: input.requirementProfileId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (response.ok) {
        const created = (await response.json()) as InstitutionRequestItem;
        // Trigger dispatch
        await fetch(`${BACKEND_SERVICE_BASE_URL}/institution/requests/${created.id}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
        }).catch(() => null);

        return { data: created, error: null, isDevFixture: false };
      }

      const errorJson = await response.json().catch(() => null);
      if (errorJson?.error) {
        return { data: null, error: errorJson.error, isDevFixture: false };
      }
    } catch {
      // Fallback
    }
  }

  try {
    const created = await createFixtureInstitutionRequest(input);
    return { data: created, error: null, isDevFixture: true };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to create access request.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Retrieve audit log events.
 */
export async function fetchInstitutionAuditEvents(): Promise<
  InstitutionServiceResult<AuditEventItem[]>
> {
  try {
    const data = await getFixtureAuditEvents();
    return { data, error: null, isDevFixture: true };
  } catch (err: unknown) {
    const apiError = err as ApiError;
    return {
      data: null,
      error: apiError.code
        ? apiError
        : {
            code: 'PROCESSING_FAILED',
            message: 'Unable to retrieve audit events.',
          },
      isDevFixture: true,
    };
  }
}
