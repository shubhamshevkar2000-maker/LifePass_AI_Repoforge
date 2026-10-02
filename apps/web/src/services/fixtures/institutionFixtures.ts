/**
 * LifePass AI — Temporary Development Fixtures for Institution Portal
 *
 * CAUTION / NOTICE:
 * This file contains strictly labelled development fixtures for UI testing
 * in the Institution Web Portal (apps/web).
 *
 * DO NOT represent this fixture data as real production statistics or claim
 * that fixture records represent real external financial/academic authorizations.
 * Authoritative schema: docs/DATABASE_SCHEMA.md Sections 2, 5, 6; docs/API_CONTRACT.md Section 6;
 * and docs/DEMO_FLOW.md Sections 3 & 4.
 */

export interface SubmittedDocItem {
  id: string;
  requirementName: string;
  requirementCode: string;
  docTitle: string;
  category: 'identity' | 'education' | 'finance' | 'healthcare';
  isSourceVerified: boolean;
  status: 'verified' | 'missing' | 'attention';
  isConsented: boolean;
  submittedDate: string;
  fileSize?: string;
  mimeType?: string;
}

export interface InstitutionRequestItem {
  id: string;
  applicationNumber: string;
  applicantName: string;
  applicantPhone: string;
  purpose: string;
  requirementProfileId: string;
  requirementProfileName: string;
  status: 'under_review' | 'awaiting_consent' | 'completed' | 'expired';
  consentStatus: 'granted' | 'awaiting' | 'denied' | 'expired' | 'revoked';
  readinessScore: number; // Provided by backend matching engine; never computed by frontend
  satisfiedCount: number;
  totalCount: number;
  createdAt: string;
  expiresAt: string;
  consentedAt?: string;
  documents: SubmittedDocItem[];
}

export interface InstitutionDashboardStats {
  activeRequests: number;
  underReview: number;
  awaitingConsent: number;
  completed: number;
}

export interface AuditEventItem {
  id: string;
  timestamp: string;
  actor: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  details: string;
}

/**
 * Canonical Golden Demo Documents (Education Loan Underwriting for Alex Morgan)
 * Per docs/DEMO_FLOW.md Section 3: 4 of 5 satisfied, admission letter missing.
 */
export const DEMO_EDUCATION_LOAN_DOCS: SubmittedDocItem[] = [
  {
    id: 'doc-1',
    requirementName: 'Identity Proof',
    requirementCode: 'identity_proof',
    docTitle: 'Passport (passport_us.pdf)',
    category: 'identity',
    isSourceVerified: true,
    status: 'verified',
    isConsented: true,
    submittedDate: '2026-10-24 10:14 UTC',
    fileSize: '1.8 MB',
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-2',
    requirementName: 'Address Proof',
    requirementCode: 'address_proof',
    docTitle: 'Electricity Utility Bill (utility_bill.pdf)',
    category: 'identity',
    isSourceVerified: true,
    status: 'verified',
    isConsented: true,
    submittedDate: '2026-10-24 10:15 UTC',
    fileSize: '840 KB',
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-3',
    requirementName: 'Academic Record',
    requirementCode: 'academic_record',
    docTitle: 'Degree Certificate (degree_cert.pdf)',
    category: 'education',
    isSourceVerified: true,
    status: 'verified',
    isConsented: true,
    submittedDate: '2026-10-24 10:16 UTC',
    fileSize: '2.4 MB',
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-4',
    requirementName: 'Income Proof',
    requirementCode: 'income_proof',
    docTitle: 'Form 16 / Tax Summary (form_16.pdf)',
    category: 'finance',
    isSourceVerified: true,
    status: 'verified',
    isConsented: true,
    submittedDate: '2026-10-24 10:18 UTC',
    fileSize: '1.2 MB',
    mimeType: 'application/pdf',
  },
  {
    id: 'doc-5',
    requirementName: 'Admission Letter',
    requirementCode: 'admission_letter',
    docTitle: 'Not Provided',
    category: 'education',
    isSourceVerified: false,
    status: 'missing',
    isConsented: false,
    submittedDate: '—',
  },
];

/**
 * Controlled In-Memory Fixture List for Applications / Requests
 */
export const INITIAL_DEMO_REQUESTS: InstitutionRequestItem[] = [
  // 1. The Golden Demo Request (Under Review)
  {
    id: 'req-edu-001',
    applicationNumber: '#LP-2026-8841 (Demo)',
    applicantName: 'Alex Morgan',
    applicantPhone: '+1 (415) 555-2671',
    purpose: 'Education Loan Underwriting',
    requirementProfileId: '00000000-0000-0000-0000-000000000001',
    requirementProfileName: 'Education Loan Application (v2026.1)',
    status: 'under_review',
    consentStatus: 'granted',
    readinessScore: 80,
    satisfiedCount: 4,
    totalCount: 5,
    createdAt: '2026-10-24 10:10 UTC',
    expiresAt: '2026-11-23 10:10 UTC',
    consentedAt: '2026-10-24 10:20 UTC',
    documents: [...DEMO_EDUCATION_LOAN_DOCS],
  },
  // 2. Fully Completed Application
  {
    id: 'req-comp-002',
    applicationNumber: '#LP-2026-7290 (Demo)',
    applicantName: 'Priya Sharma',
    applicantPhone: '+1 (415) 555-8912',
    purpose: 'Higher Education Loan Underwriting',
    requirementProfileId: '00000000-0000-0000-0000-000000000001',
    requirementProfileName: 'Education Loan Application (v2026.1)',
    status: 'completed',
    consentStatus: 'granted',
    readinessScore: 100,
    satisfiedCount: 5,
    totalCount: 5,
    createdAt: '2026-10-18 09:30 UTC',
    expiresAt: '2026-11-17 09:30 UTC',
    consentedAt: '2026-10-18 10:05 UTC',
    documents: [
      ...DEMO_EDUCATION_LOAN_DOCS.slice(0, 4),
      {
        id: 'doc-priya-5',
        requirementName: 'Admission Letter',
        requirementCode: 'admission_letter',
        docTitle: 'Stanford University Acceptance Letter (admission.pdf)',
        category: 'education',
        isSourceVerified: true,
        status: 'verified',
        isConsented: true,
        submittedDate: '2026-10-18 09:55 UTC',
        fileSize: '950 KB',
        mimeType: 'application/pdf',
      },
    ],
  },
  // 3. Newly Dispatched Request Awaiting Citizen Consent
  {
    id: 'req-await-003',
    applicationNumber: '#LP-2026-9102 (Demo)',
    applicantName: 'Rohan Mehta',
    applicantPhone: '+1 (415) 555-3478',
    purpose: 'Education Loan Application',
    requirementProfileId: '00000000-0000-0000-0000-000000000001',
    requirementProfileName: 'Education Loan Application (v2026.1)',
    status: 'awaiting_consent',
    consentStatus: 'awaiting',
    readinessScore: 0,
    satisfiedCount: 0,
    totalCount: 5,
    createdAt: '2026-10-25 14:00 UTC',
    expiresAt: '2026-11-24 14:00 UTC',
    documents: [],
  },
  // 4. Timed-out / Expired Request
  {
    id: 'req-exp-004',
    applicationNumber: '#LP-2026-6411 (Demo)',
    applicantName: 'David Chen',
    applicantPhone: '+1 (415) 555-4421',
    purpose: 'Education Loan Verification',
    requirementProfileId: '00000000-0000-0000-0000-000000000001',
    requirementProfileName: 'Education Loan Application (v2026.1)',
    status: 'expired',
    consentStatus: 'expired',
    readinessScore: 0,
    satisfiedCount: 0,
    totalCount: 5,
    createdAt: '2026-09-15 11:20 UTC',
    expiresAt: '2026-10-15 11:20 UTC',
    documents: [],
  },
];

let mutableRequests: InstitutionRequestItem[] = [...INITIAL_DEMO_REQUESTS];

/**
 * Fixture resolver for institution requests list.
 */
export async function getFixtureInstitutionRequests(): Promise<InstitutionRequestItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return [...mutableRequests];
}

/**
 * Fixture resolver for a single request.
 */
export async function getFixtureInstitutionRequestById(
  requestId: string
): Promise<InstitutionRequestItem | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const found = mutableRequests.find((r) => r.id === requestId);
  return found ? { ...found } : null;
}

/**
 * Fixture resolver to create a new request.
 */
export async function createFixtureInstitutionRequest(input: {
  citizenPhone: string;
  purpose: string;
  requirementProfileId: string;
}): Promise<InstitutionRequestItem> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const newId = `req-inst-${Date.now()}`;
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const newRequest: InstitutionRequestItem = {
    id: newId,
    applicationNumber: `#LP-2026-${randomNum} (Demo)`,
    applicantName: `Applicant (${input.citizenPhone})`,
    applicantPhone: input.citizenPhone,
    purpose: input.purpose,
    requirementProfileId: input.requirementProfileId,
    requirementProfileName: 'Education Loan Application (v2026.1)',
    status: 'awaiting_consent',
    consentStatus: 'awaiting',
    readinessScore: 0,
    satisfiedCount: 0,
    totalCount: 5,
    createdAt: now.toISOString(),
    expiresAt,
    documents: [],
  };

  mutableRequests = [newRequest, ...mutableRequests];
  return { ...newRequest };
}

/**
 * Demo Audit Events Aligned with PostgreSQL public.audit_events (Section 6)
 */
export const DEMO_AUDIT_LOG_FIXTURES: AuditEventItem[] = [
  {
    id: 'ae-001',
    timestamp: '2026-10-24 10:20:00 UTC',
    actor: 'Citizen (Demo Account: Alex Morgan)',
    eventType: 'consent_granted',
    entityType: 'consent',
    entityId: 'consent-001',
    details: 'Granted 30-day purpose-bound access for Education Loan Underwriting',
  },
  {
    id: 'ae-002',
    timestamp: '2026-10-24 10:22:15 UTC',
    actor: 'Institution Officer',
    eventType: 'record_viewed',
    entityType: 'record',
    entityId: 'doc-1',
    details: 'Viewed metadata: Passport (Demo Fixture)',
  },
  {
    id: 'ae-003',
    timestamp: '2026-10-24 10:23:40 UTC',
    actor: 'Institution Officer',
    eventType: 'record_viewed',
    entityType: 'record',
    entityId: 'doc-3',
    details: 'Viewed metadata: Degree Certificate (Demo Fixture)',
  },
  {
    id: 'ae-004',
    timestamp: '2026-10-24 10:25:02 UTC',
    actor: 'LifePass Policy Engine',
    eventType: 'readiness_evaluated',
    entityType: 'access_request',
    entityId: 'req-edu-001',
    details: '4/5 requirements satisfied (80% readiness). Admission letter missing.',
  },
  {
    id: 'ae-005',
    timestamp: '2026-10-25 14:00:10 UTC',
    actor: 'Institution Officer',
    eventType: 'request_created',
    entityType: 'access_request',
    entityId: 'req-await-003',
    details: 'Created access request for applicant +1 (415) 555-3478 under Education Loan profile',
  },
];

export async function getFixtureAuditEvents(): Promise<AuditEventItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [...DEMO_AUDIT_LOG_FIXTURES];
}
