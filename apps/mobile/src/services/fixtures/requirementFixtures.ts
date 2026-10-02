/**
 * LifePass AI — Temporary Development Fixtures
 *
 * CAUTION / NOTICE:
 * This file contains strictly labelled development fixtures for UI/client testing
 * during Phase 3 frontend implementation.
 *
 * DO NOT represent this fixture data as real backend data or claim backend
 * integration is complete.
 * Authoritative schema: docs/DEMO_FLOW.md Section 3, docs/API_CONTRACT.md Section 4,
 * and docs/DATABASE_SCHEMA.md Section 4.
 */

import {
  AiIntentResponse,
  RequirementProfile,
  ApiError,
} from '@lifepass/shared';

export const EDUCATION_LOAN_INTENT_FIXTURE: AiIntentResponse = {
  intent: 'loan_application',
  task: 'education_loan',
  domain: 'finance',
  institution_type: 'bank',
  confidence: 0.94,
};

export const EDUCATION_LOAN_REQUIREMENT_PROFILE_FIXTURE: RequirementProfile = {
  profile_id: '00000000-0000-0000-0000-000000000001',
  name: 'Education Loan Requirement Profile',
  domain: 'finance',
  task_code: 'education_loan',
  version: '2026.1',
  description: 'Controlled requirement profile for higher education loan applications.',
  status: 'active',
  requirements: [
    {
      id: 'req-001',
      profile_id: '00000000-0000-0000-0000-000000000001',
      code: 'identity_proof',
      name: 'Identity proof',
      category: 'identity',
      required: true,
      accepted_document_types: ['passport', 'national_id', 'aadhaar', 'pan_card'],
      display_order: 1,
      state: 'required',
    },
    {
      id: 'req-002',
      profile_id: '00000000-0000-0000-0000-000000000001',
      code: 'address_proof',
      name: 'Address proof',
      category: 'identity',
      required: true,
      accepted_document_types: ['utility_bill', 'passport', 'voter_id'],
      display_order: 2,
      state: 'required',
    },
    {
      id: 'req-003',
      profile_id: '00000000-0000-0000-0000-000000000001',
      code: 'academic_record',
      name: 'Academic record',
      category: 'education',
      required: true,
      accepted_document_types: ['transcript', 'degree_certificate'],
      display_order: 3,
      state: 'required',
    },
    {
      id: 'req-004',
      profile_id: '00000000-0000-0000-0000-000000000001',
      code: 'income_proof',
      name: 'Income proof',
      category: 'finance',
      required: true,
      accepted_document_types: ['salary_slip', 'tax_return_itr', 'bank_statement'],
      display_order: 4,
      state: 'required',
    },
    {
      id: 'req-005',
      profile_id: '00000000-0000-0000-0000-000000000001',
      code: 'admission_letter',
      name: 'Admission letter',
      category: 'education',
      required: true,
      accepted_document_types: ['university_offer_letter', 'admission_letter'],
      display_order: 5,
      state: 'required',
    },
  ],
};

/**
 * Fixture resolver simulating backend response latency and error conditions.
 */
export async function getFixtureIntent(message: string): Promise<AiIntentResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const trimmed = message.trim().toLowerCase();
  if (!trimmed) {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'Please describe what you are trying to accomplish.',
    };
    throw error;
  }

  if (trimmed.includes('sim_ai_offline') || trimmed.includes('error')) {
    const error: ApiError = {
      code: 'AI_UNAVAILABLE',
      message: 'LifePass AI task understanding service is temporarily unreachable.',
    };
    throw error;
  }

  if (
    trimmed.includes('loan') ||
    trimmed.includes('education') ||
    trimmed.includes('college') ||
    trimmed.includes('university') ||
    trimmed.includes('study')
  ) {
    return { ...EDUCATION_LOAN_INTENT_FIXTURE };
  }

  // Unknown task scenario
  return {
    intent: 'unknown_intent',
    task: 'unknown_task',
    domain: 'general',
    institution_type: 'unspecified',
  };
}

export async function getFixtureRequirements(task: string): Promise<RequirementProfile> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!task || task.trim() === '') {
    const error: ApiError = {
      code: 'INVALID_INPUT',
      message: 'A valid task identifier is required to retrieve requirements.',
    };
    throw error;
  }

  if (task === 'education_loan') {
    return { ...EDUCATION_LOAN_REQUIREMENT_PROFILE_FIXTURE };
  }

  // Profile not found error
  const error: ApiError = {
    code: 'REQUIREMENT_PROFILE_NOT_FOUND',
    message: `No controlled requirement profile found for task: "${task}". LifePass requires controlled knowledge seed before evaluating requirements.`,
  };
  throw error;
}
