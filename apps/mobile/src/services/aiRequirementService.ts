/**
 * LifePass AI — AI & Requirement Knowledge Client Service
 *
 * Implements the client-side service boundary for:
 * - POST /ai/intent (docs/API_CONTRACT.md Section 4)
 * - POST /ai/requirements (docs/API_CONTRACT.md Section 4)
 *
 * BOUNDARY RULE:
 * This is client application code only. If the backend Python / Edge Function
 * service is not yet deployed, this service falls back to isolated development
 * fixtures and marks `isDevFixture: true`.
 */

import { supabase } from '../lib/supabase';
import {
  AiIntentRequest,
  AiIntentResponse,
  AiRequirementsRequest,
  RequirementProfile,
  ApiError,
} from '@lifepass/shared';
import {
  getFixtureIntent,
  getFixtureRequirements,
} from './fixtures/requirementFixtures';

export interface ServiceResult<T> {
  data: T | null;
  error: ApiError | null;
  isDevFixture: boolean;
}

// Optional API Base URL from environment (e.g., EXPO_PUBLIC_AI_SERVICE_URL)
const AI_SERVICE_BASE_URL = process.env.EXPO_PUBLIC_AI_SERVICE_URL || null;

/**
 * Interpret Citizen Goal / Task Intent
 * Contract: POST /ai/intent
 * Request: { "message": "I want to apply for an education loan." }
 */
export async function interpretTaskIntent(
  message: string
): Promise<ServiceResult<AiIntentResponse>> {
  const trimmed = message?.trim();
  if (!trimmed) {
    return {
      data: null,
      error: {
        code: 'INVALID_INPUT',
        message: 'Please enter a goal or task description.',
      },
      isDevFixture: false,
    };
  }

  // 1. Try real backend endpoint if configured
  if (true) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const { data, error } = await supabase.functions.invoke('ai_intent', {
        body: { message: trimmed }
      });
      if (error) {
         return { data: null, error: { code: 'PROCESSING_FAILED', message: error.message }, isDevFixture: false };
      }
      return { data, error: null, isDevFixture: false };
    } catch {
      // Backend request failed; fall through to development fixture
      console.warn(
        '[LifePass AI Service] Live /ai/intent unreachable. Falling back to development fixture.'
      );
    }
  }

  // 2. Controlled Development Fixture fallback for UI verification
  try {
    const fixtureData = await getFixtureIntent(trimmed);
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
            code: 'AI_UNAVAILABLE',
            message: 'Unable to analyze goal intent.',
          },
      isDevFixture: true,
    };
  }
}

/**
 * Fetch Requirement Profile for an understood task
 * Contract: POST /ai/requirements
 * Request: { "task": "education_loan" }
 */
export async function fetchRequirementProfile(
  task: string
): Promise<ServiceResult<RequirementProfile>> {
  const trimmed = task?.trim();
  if (!trimmed) {
    return {
      data: null,
      error: {
        code: 'INVALID_INPUT',
        message: 'A valid task identifier is required.',
      },
      isDevFixture: false,
    };
  }

  // 1. Try real backend endpoint if configured
  if (true) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const { data: profile, error: profileErr } = await supabase
        .from('requirement_profiles')
        .select('id, name, domain, task_code, version, description, status')
        .eq('task_code', trimmed)
        .eq('status', 'active')
        .single();

      if (profileErr || !profile) {
        return { data: null, error: { code: 'REQUIREMENT_PROFILE_NOT_FOUND', message: 'Profile not found.' }, isDevFixture: false };
      }

      const { data: reqs, error: reqsErr } = await supabase
        .from('requirements')
        .select('*')
        .eq('profile_id', profile.id);

      if (reqsErr) {
        return { data: null, error: { code: 'PROCESSING_FAILED', message: reqsErr.message }, isDevFixture: false };
      }

      const requirementProfile: RequirementProfile = {
        profile_id: profile.id,
        name: profile.name,
        domain: profile.domain,
        task_code: profile.task_code,
        version: profile.version,
        description: profile.description,
        status: profile.status,
        requirements: reqs
      };

      return { data: requirementProfile, error: null, isDevFixture: false };
    } catch {
      console.warn(
        '[LifePass AI Service] Live /ai/requirements unreachable. Falling back to development fixture.'
      );
    }
  }

  // 2. Controlled Development Fixture fallback for UI verification
  try {
    const fixtureData = await getFixtureRequirements(trimmed);
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
            code: 'REQUIREMENT_PROFILE_NOT_FOUND',
            message: `Requirement profile not found for task: ${trimmed}`,
          },
      isDevFixture: true,
    };
  }
}
