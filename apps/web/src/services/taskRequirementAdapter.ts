/**
 * LifePass AI — Individual Task & Requirement Adapter (Frontend Mock)
 *
 * Architecture Boundary:
 * Frontend-only structured adapter for demo task understanding and requirement mapping.
 * Pure deterministic logic mapping user goals to structured document requirements,
 * evaluated against the in-memory demo Record Vault.
 *
 * ZERO Groq, FastAPI AI, LangChain, FAISS, Supabase, or PostgreSQL dependencies.
 * Designed to be replaced with a live API client during final cross-workstream integration
 * without rewriting the UI components.
 */

import { VaultRecord, RecordCategory } from './recordVaultRepository';

export type TaskType =
  | 'college_admission'
  | 'job_application'
  | 'loan_application'
  | 'hospital_admission'
  | 'unsupported';

export type TaskConfidence = 'High' | 'Medium' | 'Low';

export type ReadinessStatus =
  | 'READY'
  | 'MOSTLY_READY'
  | 'NEEDS_ATTENTION'
  | 'NOT_READY';

export interface RequirementDefinition {
  id: string;
  label: string;
  documentType: string;
  category: RecordCategory;
  required: boolean; // true = configured/required, false = potentially useful
  description: string;
  matchingAliases: string[];
}

export interface MatchedRequirement {
  requirement: RequirementDefinition;
  matchedRecord: VaultRecord;
  isVerified: boolean;
}

export interface MissingRequirement {
  requirement: RequirementDefinition;
  suggestedAction: string;
  existingPendingRecord?: VaultRecord;
}

export interface TaskProfile {
  type: TaskType;
  label: string;
  keywords: string[];
  description: string;
  requirements: RequirementDefinition[];
}

export interface TaskAnalysisResult {
  task: {
    type: TaskType;
    label: string;
    userInput: string;
    confidence: TaskConfidence;
    confidenceNote: string;
    profileDescription: string;
  };
  readiness: {
    status: ReadinessStatus;
    percentage: number;
    label: string;
    badgeVariant: 'success' | 'info' | 'warning' | 'danger';
    explanation: string;
  };
  summary: {
    matchedCount: number;
    totalRequired: number;
    totalPotentiallyUseful: number;
    factualText: string;
    advisoryText: string;
    nextActionTitle: string;
    nextActionDescription: string;
  };
  requiredMatches: MatchedRequirement[];
  requiredMissing: MissingRequirement[];
  usefulMatches: MatchedRequirement[];
  usefulMissing: MissingRequirement[];
  profileFound: boolean;
}

/**
 * Pre-configured deterministic demo task profiles.
 * College Admission is the primary polished hackathon scenario.
 */
export const DEMO_TASK_PROFILES: TaskProfile[] = [
  {
    type: 'college_admission',
    label: 'College & University Admission',
    keywords: ['college', 'university', 'admission', 'degree', 'study', 'academic', 'enroll', 'higher education'],
    description: 'General academic qualification & identity verification profile for university admissions.',
    requirements: [
      {
        id: 'req-ca-10th',
        label: '10th Secondary School Marksheet',
        documentType: 'School Certificate',
        category: 'Education',
        required: true,
        description: 'Standardized proof of secondary education completion and date of birth verification.',
        matchingAliases: ['secondary school', '10th', 'icse', 'cbse 10', 'class 10', 'passing certificate'],
      },
      {
        id: 'req-ca-12th',
        label: '12th Higher Secondary Marksheet',
        documentType: 'Academic Marksheet',
        category: 'Education',
        required: true,
        description: 'Higher secondary school transcripts and subject grade eligibility record.',
        matchingAliases: ['higher secondary', '12th', 'cbse 12', 'class 12', 'marksheet', 'academic transcript'],
      },
      {
        id: 'req-ca-id',
        label: 'National Identity Proof (Aadhaar / National ID)',
        documentType: 'National ID',
        category: 'Identity',
        required: true,
        description: 'Government-issued citizen identification card for personal KYC match.',
        matchingAliases: ['national id', 'aadhaar', 'identity card', 'citizenship'],
      },
      {
        id: 'req-ca-address',
        label: 'Proof of Domicile & Permanent Address',
        documentType: 'Domicile Proof',
        category: 'Address',
        required: true,
        description: 'State domicile certificate establishing residency status for admission quotas.',
        matchingAliases: ['domicile', 'address proof', 'residence certificate', 'permanent address'],
      },
      {
        id: 'req-ca-offer',
        label: 'Provisional University Admission Letter',
        documentType: 'Admission Letter',
        category: 'Education',
        required: true,
        description: 'Official allotment or provisional acceptance letter issued by the admitting university.',
        matchingAliases: ['admission letter', 'acceptance letter', 'offer letter', 'allotment letter'],
      },
      {
        id: 'req-ca-income',
        label: 'Annual Income Tax Assessment Statement',
        documentType: 'Income Certificate',
        category: 'Finance',
        required: false,
        description: 'Family income certificate for fee concession, scholarship, or quota evaluation.',
        matchingAliases: ['income certificate', 'tax assessment', 'financial declaration', 'salary slip'],
      },
      {
        id: 'req-ca-health',
        label: 'Health Insurance / Medical Fitness Card',
        documentType: 'Health Insurance Card',
        category: 'Healthcare',
        required: false,
        description: 'Medical coverage proof for campus infirmary and student health coverage.',
        matchingAliases: ['health insurance', 'medical fitness', 'health card'],
      },
    ],
  },
  {
    type: 'job_application',
    label: 'Employment & Job Application',
    keywords: ['job', 'employment', 'work', 'hire', 'career', 'resume', 'company', 'developer', 'engineer', 'salary'],
    description: 'Professional onboarding background verification and educational background check.',
    requirements: [
      {
        id: 'req-job-id',
        label: 'National Identity Card (Aadhaar)',
        documentType: 'National ID',
        category: 'Identity',
        required: true,
        description: 'Primary legal identity proof for employer KYC and background checks.',
        matchingAliases: ['national id', 'aadhaar', 'identity card'],
      },
      {
        id: 'req-job-edu',
        label: 'Senior Academic Marksheet or Degree',
        documentType: 'Academic Marksheet',
        category: 'Education',
        required: true,
        description: 'Highest academic credential certifying educational qualifications.',
        matchingAliases: ['academic marksheet', 'class 12', 'degree', 'transcript'],
      },
      {
        id: 'req-job-exp',
        label: 'Prior Employment Experience Certificate',
        documentType: 'Experience Certificate',
        category: 'Employment',
        required: true,
        description: 'Relieving letter or formal employment verification from previous employers.',
        matchingAliases: ['experience certificate', 'relieving letter', 'employment verification'],
      },
      {
        id: 'req-job-address',
        label: 'Proof of Permanent Address',
        documentType: 'Domicile Proof',
        category: 'Address',
        required: false,
        description: 'Proof of residential address for payroll and background check correspondence.',
        matchingAliases: ['domicile', 'address proof', 'residence certificate'],
      },
    ],
  },
  {
    type: 'loan_application',
    label: 'Educational & Personal Loan Application',
    keywords: ['loan', 'credit', 'bank', 'borrow', 'financing', 'education loan', 'mortgage', 'fund'],
    description: 'Financial assessment and KYC verification for bank credit underwriting.',
    requirements: [
      {
        id: 'req-loan-id',
        label: 'National Identity Proof (Aadhaar)',
        documentType: 'National ID',
        category: 'Identity',
        required: true,
        description: 'Government identity proof mandated for banking KYC compliance.',
        matchingAliases: ['national id', 'aadhaar', 'identity card'],
      },
      {
        id: 'req-loan-income',
        label: 'Annual Income Tax Assessment Statement',
        documentType: 'Income Certificate',
        category: 'Finance',
        required: true,
        description: 'Proof of recurring income for repayment capacity assessment.',
        matchingAliases: ['income certificate', 'tax assessment', 'financial declaration'],
      },
      {
        id: 'req-loan-address',
        label: 'Proof of Residential Domicile',
        documentType: 'Domicile Proof',
        category: 'Address',
        required: true,
        description: 'Valid permanent address proof for loan documentation and legal notices.',
        matchingAliases: ['domicile', 'address proof'],
      },
      {
        id: 'req-loan-edu',
        label: 'Admission Letter or Higher Secondary Marksheet',
        documentType: 'Academic Marksheet',
        category: 'Education',
        required: false,
        description: 'Academic documentation for educational loan disbursal verification.',
        matchingAliases: ['admission letter', 'academic marksheet', 'class 12'],
      },
    ],
  },
  {
    type: 'hospital_admission',
    label: 'Hospital Admission & Healthcare Coverage',
    keywords: ['hospital', 'medical', 'health', 'clinic', 'surgery', 'patient', 'doctor', 'treatment'],
    description: 'Inpatient admission verification and cashless insurance claim processing.',
    requirements: [
      {
        id: 'req-hosp-id',
        label: 'National Identity Proof (Aadhaar)',
        documentType: 'National ID',
        category: 'Identity',
        required: true,
        description: 'Patient identity verification for hospital registration records.',
        matchingAliases: ['national id', 'aadhaar', 'identity card'],
      },
      {
        id: 'req-hosp-health',
        label: 'National Health Insurance Card',
        documentType: 'Health Insurance Card',
        category: 'Healthcare',
        required: true,
        description: 'Active health policy card for cashless hospital admission coverage.',
        matchingAliases: ['health insurance', 'health card', 'policy'],
      },
      {
        id: 'req-hosp-address',
        label: 'Proof of Local Residence',
        documentType: 'Domicile Proof',
        category: 'Address',
        required: false,
        description: 'Local address documentation for billing and health registry records.',
        matchingAliases: ['domicile', 'address proof'],
      },
    ],
  },
];

/**
 * Demo suggestion buttons displayed in Ask LifePass.
 */
export const DEMO_TASK_SUGGESTIONS = [
  { label: 'College Admission', prompt: 'I want to apply for university admission' },
  { label: 'Job Application', prompt: 'I am applying for a software engineering job' },
  { label: 'Educational Loan', prompt: 'I need to apply for an educational loan for college' },
  { label: 'Hospital Inpatient', prompt: 'I need to arrange hospital admission and insurance' },
];

/**
 * Deterministically detects task type and confidence based on keywords.
 */
export function detectTaskType(input: string): {
  profile: TaskProfile | null;
  confidence: TaskConfidence;
  confidenceNote: string;
} {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return {
      profile: null,
      confidence: 'Low',
      confidenceNote: 'No task description provided.',
    };
  }

  let bestMatch: TaskProfile | null = null;
  let maxScore = 0;

  for (const profile of DEMO_TASK_PROFILES) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length > 5 ? 2 : 1;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = profile;
    }
  }

  if (!bestMatch || maxScore === 0) {
    return {
      profile: null,
      confidence: 'Low',
      confidenceNote: 'Task understanding: Low confidence. No matching demo profile found.',
    };
  }

  const confidence: TaskConfidence = maxScore >= 3 ? 'High' : maxScore >= 1 ? 'Medium' : 'Low';
  const confidenceNote = `Task understanding: ${confidence} confidence (Matched demo profile: ${bestMatch.label})`;

  return {
    profile: bestMatch,
    confidence,
    confidenceNote,
  };
}

/**
 * Deterministic matching engine between a requirement and a list of vault records.
 * Rules:
 * 1. Checks matchingAliases against record type, name, and description.
 * 2. Matches with status === 'VERIFIED' count as fully verified.
 * 3. Matches with status === 'PENDING' are identified as pending in demo state.
 */
function findMatchingRecord(
  req: RequirementDefinition,
  vaultRecords: VaultRecord[]
): { record: VaultRecord; isVerified: boolean } | null {
  for (const record of vaultRecords) {
    // 1. Check exact category match or relevant cross-category
    if (record.category !== req.category && req.category !== 'Identity') {
      continue;
    }

    const recordTypeLower = record.type.toLowerCase();
    const recordNameLower = record.name.toLowerCase();
    const recordDescLower = (record.description || '').toLowerCase();

    // 2. Check aliases
    const matchesAlias = req.matchingAliases.some(
      (alias) =>
        recordTypeLower.includes(alias.toLowerCase()) ||
        recordNameLower.includes(alias.toLowerCase()) ||
        recordDescLower.includes(alias.toLowerCase())
    );

    if (matchesAlias) {
      // Deterministic acceptance: record is matched
      return {
        record,
        isVerified: record.status === 'VERIFIED',
      };
    }
  }

  return null;
}

/**
 * Calculates readiness status and semantic badge variants deterministically.
 */
export function calculateReadiness(
  verifiedMatchesCount: number,
  totalRequiredCount: number
): {
  status: ReadinessStatus;
  percentage: number;
  label: string;
  badgeVariant: 'success' | 'info' | 'warning' | 'danger';
  explanation: string;
} {
  if (totalRequiredCount === 0) {
    return {
      status: 'READY',
      percentage: 100,
      label: 'Ready',
      badgeVariant: 'success',
      explanation: 'No mandatory requirements configured for this task.',
    };
  }

  const percentage = Math.round((verifiedMatchesCount / totalRequiredCount) * 100);

  if (percentage === 100) {
    return {
      status: 'READY',
      percentage: 100,
      label: 'Ready',
      badgeVariant: 'success',
      explanation: 'All required records are available and verified in your vault.',
    };
  } else if (percentage >= 70) {
    return {
      status: 'MOSTLY_READY',
      percentage,
      label: 'Mostly Ready',
      badgeVariant: 'info',
      explanation: 'Most required records are available. Complete the missing item to proceed.',
    };
  } else if (percentage >= 40) {
    return {
      status: 'NEEDS_ATTENTION',
      percentage,
      label: 'Needs Attention',
      badgeVariant: 'warning',
      explanation: 'Multiple required records are missing from your vault.',
    };
  } else {
    return {
      status: 'NOT_READY',
      percentage,
      label: 'Not Ready',
      badgeVariant: 'danger',
      explanation: 'Key required records have not been uploaded yet.',
    };
  }
}

/**
 * Main structured mock adapter function.
 * Evaluates user input and returns a complete TaskAnalysisResult.
 */
export function analyzeTaskRequirements(
  userInput: string,
  vaultRecords: VaultRecord[]
): TaskAnalysisResult {
  const trimmed = userInput.trim();

  // 1. Detect task profile
  const { profile, confidence, confidenceNote } = detectTaskType(trimmed);

  if (!profile) {
    return {
      task: {
        type: 'unsupported',
        label: 'Unrecognized Task',
        userInput: trimmed,
        confidence: 'Low',
        confidenceNote: 'Task understanding: Low confidence. No demo requirement profile found.',
        profileDescription: 'We do not have a configured demo requirement profile for this task yet.',
      },
      readiness: {
        status: 'NOT_READY',
        percentage: 0,
        label: 'No Profile Available',
        badgeVariant: 'danger',
        explanation: 'Please try one of the recommended demo scenarios (e.g. College Admission).',
      },
      summary: {
        matchedCount: 0,
        totalRequired: 0,
        totalPotentiallyUseful: 0,
        factualText: 'No matching demo requirement profile configured for this query.',
        advisoryText: 'Try entering "I want to apply for university admission" or select a suggested task.',
        nextActionTitle: 'Select a Supported Demo Scenario',
        nextActionDescription: 'Click any suggested prompt above to evaluate requirement matching.',
      },
      requiredMatches: [],
      requiredMissing: [],
      usefulMatches: [],
      usefulMissing: [],
      profileFound: false,
    };
  }

  // 2. Separate required vs potentially useful requirements
  const requiredDefs = profile.requirements.filter((r) => r.required);
  const usefulDefs = profile.requirements.filter((r) => !r.required);

  const requiredMatches: MatchedRequirement[] = [];
  const requiredMissing: MissingRequirement[] = [];
  const usefulMatches: MatchedRequirement[] = [];
  const usefulMissing: MissingRequirement[] = [];

  // Match required requirements
  for (const req of requiredDefs) {
    const match = findMatchingRecord(req, vaultRecords);
    if (match && match.isVerified) {
      requiredMatches.push({
        requirement: req,
        matchedRecord: match.record,
        isVerified: true,
      });
    } else {
      requiredMissing.push({
        requirement: req,
        suggestedAction: `Add ${req.label} to your vault`,
        existingPendingRecord: match && !match.isVerified ? match.record : undefined,
      });
    }
  }

  // Match potentially useful requirements
  for (const req of usefulDefs) {
    const match = findMatchingRecord(req, vaultRecords);
    if (match && match.isVerified) {
      usefulMatches.push({
        requirement: req,
        matchedRecord: match.record,
        isVerified: true,
      });
    } else {
      usefulMissing.push({
        requirement: req,
        suggestedAction: `Optionally add ${req.label}`,
        existingPendingRecord: match && !match.isVerified ? match.record : undefined,
      });
    }
  }

  // 3. Compute readiness
  const readiness = calculateReadiness(requiredMatches.length, requiredDefs.length);

  // 4. Formulate structured factual and advisory copy
  const factualText = `LifePass matched ${requiredMatches.length} of ${requiredDefs.length} required records in your demo vault.`;
  let advisoryText = '';
  let nextActionTitle = '';
  let nextActionDescription = '';

  if (requiredMissing.length === 0) {
    advisoryText = 'All configured mandatory records are available and verified. You are ready to share with the institution when requested.';
    nextActionTitle = 'All Required Records Ready';
    nextActionDescription = 'You can review shared access permissions or proceed with institutional verification.';
  } else if (requiredMissing.length === 1) {
    const missingName = requiredMissing[0].requirement.label;
    advisoryText = `One required record is still missing or pending: ${missingName}.`;
    nextActionTitle = `Add "${missingName}" to Your Vault`;
    nextActionDescription = 'Upload and verify this document in your vault to reach 100% readiness.';
  } else {
    advisoryText = `${requiredMissing.length} required records are currently missing or unverified.`;
    nextActionTitle = 'Add Missing Required Records';
    nextActionDescription = 'Upload the missing records to complete your admission preparation.';
  }

  return {
    task: {
      type: profile.type,
      label: profile.label,
      userInput: trimmed,
      confidence,
      confidenceNote,
      profileDescription: profile.description,
    },
    readiness,
    summary: {
      matchedCount: requiredMatches.length,
      totalRequired: requiredDefs.length,
      totalPotentiallyUseful: usefulDefs.length,
      factualText,
      advisoryText,
      nextActionTitle,
      nextActionDescription,
    },
    requiredMatches,
    requiredMissing,
    usefulMatches,
    usefulMissing,
    profileFound: true,
  };
}
