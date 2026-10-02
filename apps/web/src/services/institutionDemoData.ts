/**
 * LifePass AI — Institution Demo Data & Request Service (W-3 & W-4)
 *
 * Provides structured mock datasets for institution verification workflows,
 * demo applicants, requirement profiles, TTL options, requirement checklists,
 * and dynamically derived metrics.
 * Strictly frontend-only mock state with zero backend/database dependencies.
 */

export type InstitutionRequestStatus =
  | 'DRAFT'
  | 'SENT'
  | 'AWAITING_APPLICANT'
  | 'APPROVED'
  | 'ACTIVE_ACCESS'
  | 'EXPIRED'
  | 'REJECTED';

export type RequestedRecordDemoState = 'REQUESTED' | 'DEMO_AVAILABLE' | 'DEMO_MISSING';

export interface RequestedRecord {
  id: string;
  label: string;
  category: string;
  description?: string;
}

export interface ChecklistItem extends RequestedRecord {
  demoState: RequestedRecordDemoState;
  demoStateLabel: string;
  demoStateDescription: string;
  itemSpecification: string;
}

export interface DemoApplicant {
  id: string;
  displayName: string;
  referenceLabel: string;
  context: string;
  applicantIdentifier: string;
}

export interface RequirementProfile {
  id: string;
  name: string;
  description: string;
  tag: string;
  records: RequestedRecord[];
}

export interface AccessDurationOption {
  hours: number;
  label: string;
  description: string;
}

export interface InstitutionRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantIdentifier: string;
  referenceLabel: string;
  purpose: string;
  requirementProfileId: string;
  requirementProfile: string;
  requestedRecords: RequestedRecord[];
  requestedRecordsCount: number;
  accessDurationHours: number;
  requestedExpiryLabel: string;
  status: InstitutionRequestStatus;
  updatedAt: string;
  createdAt: string;
  notes?: string;
  isDemo: boolean;
}

// Backwards compatibility alias
export type InstitutionRequestSummary = InstitutionRequest;

export interface InstitutionMetrics {
  totalRequests: number;
  pendingRequests: number;
  activeApplications: number;
  awaitingApplicantAction: number;
  activeAuthorizedAccess: number;
  sentRequests: number;
  expiredRequests: number;
}

/**
 * 4 Demo Synthetic Applicants
 */
export const DEMO_APPLICANTS: DemoApplicant[] = [
  {
    id: 'app-1001',
    displayName: 'Demo Applicant A (Rohan Sharma)',
    referenceLabel: 'APP-1001',
    context: 'College Admission',
    applicantIdentifier: 'rohan.sharma@demo.lifepass',
  },
  {
    id: 'app-1002',
    displayName: 'Demo Applicant B (Priya Patel)',
    referenceLabel: 'APP-1002',
    context: 'Employment Verification',
    applicantIdentifier: 'priya.patel@demo.lifepass',
  },
  {
    id: 'app-1003',
    displayName: 'Demo Applicant C (Amit Verma)',
    referenceLabel: 'APP-1003',
    context: 'Education Loan',
    applicantIdentifier: 'amit.verma@demo.lifepass',
  },
  {
    id: 'app-1004',
    displayName: 'Demo Applicant D (Sneha Kulkarni)',
    referenceLabel: 'APP-1004',
    context: 'Identity Verification',
    applicantIdentifier: 'sneha.k@demo.lifepass',
  },
];

/**
 * 4 Configuration-Driven Demo Requirement Profiles
 */
export const DEMO_REQUIREMENT_PROFILES: RequirementProfile[] = [
  {
    id: 'profile-kyc',
    name: 'Standard KYC',
    description: 'Basic identity, residential address, and tax identification records',
    tag: 'Demo requirement profile',
    records: [
      { id: 'rec-kyc-1', label: 'Identity Proof (Aadhaar / Passport)', category: 'Identity' },
      { id: 'rec-kyc-2', label: 'Address Proof (Utility Bill / Rent Agreement)', category: 'Identity' },
      { id: 'rec-kyc-3', label: 'PAN / Tax Identification Card', category: 'Finance' },
    ],
  },
  {
    id: 'profile-loan',
    name: 'Loan Application Pack',
    description: 'Comprehensive financial, income, and enrollment verification records',
    tag: 'Demo requirement profile',
    records: [
      { id: 'rec-loan-1', label: 'Identity Proof (National ID)', category: 'Identity' },
      { id: 'rec-loan-2', label: 'Address Proof (Current Residence)', category: 'Identity' },
      { id: 'rec-loan-3', label: 'Income Statement (Salary Slips / Bank Statement)', category: 'Finance' },
      { id: 'rec-loan-4', label: 'Admission / Employment Evidence', category: 'Education' },
    ],
  },
  {
    id: 'profile-employment',
    name: 'Employment Background',
    description: 'Professional credentials, academic degree, and experience verification',
    tag: 'Demo requirement profile',
    records: [
      { id: 'rec-emp-1', label: 'Identity Proof (National ID / Passport)', category: 'Identity' },
      { id: 'rec-emp-2', label: 'Degree / Academic Graduation Record', category: 'Education' },
      { id: 'rec-emp-3', label: 'Experience Certificate / Relieving Letter', category: 'Employment' },
    ],
  },
  {
    id: 'profile-degree',
    name: 'Degree Verification',
    description: 'Higher education credentials and academic marksheet records',
    tag: 'Demo requirement profile',
    records: [
      { id: 'rec-deg-1', label: 'Identity Proof (Student ID / National ID)', category: 'Identity' },
      { id: 'rec-deg-2', label: 'Degree Certificate (B.Tech / B.Sc / M.S)', category: 'Education' },
      { id: 'rec-deg-3', label: 'Official Academic Marksheet / Transcript', category: 'Education' },
    ],
  },
];

/**
 * Standard Demo Purposes
 */
export const DEMO_PURPOSES = [
  'College Admission',
  'Loan Application',
  'Employment Verification',
  'Degree Verification',
  'Identity Verification',
  'Custom Purpose',
] as const;

/**
 * Standard Temporary Access Duration Options
 */
export const DEMO_ACCESS_DURATIONS: AccessDurationOption[] = [
  { hours: 1, label: '1 hour', description: 'Brief real-time verification session' },
  { hours: 6, label: '6 hours', description: 'Same-day evaluation window' },
  { hours: 24, label: '24 hours', description: 'Standard 1-day evaluation window (Default)' },
  { hours: 72, label: '3 days', description: 'Multi-day review cycle' },
  { hours: 168, label: '7 days', description: 'Extended institutional audit window' },
];

/**
 * Calculates human-readable expiry label given duration hours
 */
export function calculateExpiryLabel(hours: number): string {
  const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);
  
  if (hours <= 24) {
    const timeStr = expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (hours === 24) {
      return `Tomorrow at ${timeStr}`;
    }
    return `Today at ${timeStr} (${hours}h window)`;
  }
  
  return `${expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Derives deterministic requirement checklist items for a request in the demo state
 */
export function getChecklistItemsForRequest(request: InstitutionRequest): ChecklistItem[] {
  return request.requestedRecords.map((rec, index) => {
    let demoState: RequestedRecordDemoState = 'REQUESTED';
    let demoStateLabel = 'Requested';
    let demoStateDescription = 'Requested in verification package; awaiting candidate action in citizen web inbox';

    if (request.status === 'ACTIVE_ACCESS' || request.status === 'APPROVED') {
      demoState = 'DEMO_AVAILABLE';
      demoStateLabel = 'Available in demo state';
      demoStateDescription = 'Available in demo package under active temporary access window';
    } else if (request.status === 'SENT' || request.status === 'DRAFT') {
      demoState = 'REQUESTED';
      demoStateLabel = 'Requested';
      demoStateDescription = 'Requested — dispatched to candidate web inbox; awaiting response';
    } else if (request.status === 'AWAITING_APPLICANT') {
      if (index === 0) {
        demoState = 'DEMO_AVAILABLE';
        demoStateLabel = 'Available in demo state';
        demoStateDescription = 'Available in demo candidate profile; pending consent confirmation';
      } else if (index === 1) {
        demoState = 'REQUESTED';
        demoStateLabel = 'Requested';
        demoStateDescription = 'Requested — candidate notified to review and select record';
      } else {
        demoState = 'DEMO_MISSING';
        demoStateLabel = 'Missing in demo state';
        demoStateDescription = 'Missing in demo state — record item not present in candidate vault';
      }
    } else if (request.status === 'EXPIRED') {
      demoState = 'DEMO_MISSING';
      demoStateLabel = 'Missing in demo state';
      demoStateDescription = 'Missing in demo state — request expired prior to document grant';
    } else if (request.status === 'REJECTED') {
      demoState = 'DEMO_MISSING';
      demoStateLabel = 'Missing in demo state';
      demoStateDescription = 'Disclosure declined by citizen; item not accessible';
    }

    return {
      ...rec,
      demoState,
      demoStateLabel,
      demoStateDescription,
      itemSpecification: `Canonical record specification: ${rec.label} (${rec.category} category). Required for ${request.purpose}.`,
    };
  });
}

/**
 * Computes breakdown counts for a checklist
 */
export function getChecklistSummary(items: ChecklistItem[]): {
  total: number;
  requested: number;
  demoAvailable: number;
  demoMissing: number;
} {
  const total = items.length;
  const requested = items.filter((i) => i.demoState === 'REQUESTED').length;
  const demoAvailable = items.filter((i) => i.demoState === 'DEMO_AVAILABLE').length;
  const demoMissing = items.filter((i) => i.demoState === 'DEMO_MISSING').length;
  return { total, requested, demoAvailable, demoMissing };
}

/**
 * Returns badge configuration and icon for a checklist item's demo state
 */
export function getChecklistStateBadgeConfig(state: RequestedRecordDemoState): {
  label: string;
  variant: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  icon: string;
} {
  switch (state) {
    case 'DEMO_AVAILABLE':
      return {
        label: 'Available in demo state',
        variant: 'success',
        icon: '✓',
      };
    case 'REQUESTED':
      return {
        label: 'Requested',
        variant: 'info',
        icon: '⏳',
      };
    case 'DEMO_MISSING':
      return {
        label: 'Missing in demo state',
        variant: 'warning',
        icon: '○',
      };
  }
}

/**
 * Initial Seed Requests for Institution Portal
 */
export const INITIAL_INSTITUTION_REQUESTS: InstitutionRequest[] = [
  {
    id: 'req-101',
    applicantId: 'app-1001',
    applicantName: 'Demo Applicant A (Rohan Sharma)',
    applicantIdentifier: 'rohan.sharma@demo.lifepass',
    referenceLabel: 'APP-1001',
    purpose: 'Home Loan KYC & Income Verification',
    requirementProfileId: 'profile-loan',
    requirementProfile: 'Standard Retail Loan Package (ID + Income)',
    requestedRecords: [
      { id: 'rec-1', label: 'Identity Proof (Aadhaar / Passport)', category: 'Identity' },
      { id: 'rec-2', label: 'Address Proof (Current Residence)', category: 'Identity' },
      { id: 'rec-3', label: 'Income Statement (Salary Slips)', category: 'Finance' },
    ],
    requestedRecordsCount: 3,
    accessDurationHours: 24,
    requestedExpiryLabel: 'Tomorrow at 10:15 AM',
    status: 'AWAITING_APPLICANT',
    updatedAt: '12 minutes ago',
    createdAt: '2026-10-02T10:15:00Z',
    notes: 'Citizen notified. Awaiting user consent and record release.',
    isDemo: true,
  },
  {
    id: 'req-102',
    applicantId: 'app-1002',
    applicantName: 'Demo Applicant B (Priya Patel)',
    applicantIdentifier: 'priya.patel@demo.lifepass',
    referenceLabel: 'APP-1002',
    purpose: 'Employment Background Check',
    requirementProfileId: 'profile-employment',
    requirementProfile: 'Professional Credential & Identity Verification',
    requestedRecords: [
      { id: 'rec-4', label: 'Identity Proof (Passport)', category: 'Identity' },
      { id: 'rec-5', label: 'Degree Certificate', category: 'Education' },
    ],
    requestedRecordsCount: 2,
    accessDurationHours: 24,
    requestedExpiryLabel: 'Tomorrow at 09:30 AM',
    status: 'SENT',
    updatedAt: '45 minutes ago',
    createdAt: '2026-10-02T09:30:00Z',
    notes: 'Request dispatched to candidate web inbox.',
    isDemo: true,
  },
  {
    id: 'req-103',
    applicantId: 'app-1003',
    applicantName: 'Demo Applicant C (Amit Verma)',
    applicantIdentifier: 'amit.verma@demo.lifepass',
    referenceLabel: 'APP-1003',
    purpose: 'Student Identity & Academic Degree Verification',
    requirementProfileId: 'profile-degree',
    requirementProfile: 'Higher Education Verification Pack',
    requestedRecords: [
      { id: 'rec-6', label: 'Student Identity Proof', category: 'Identity' },
      { id: 'rec-7', label: 'B.Tech Degree Certificate', category: 'Education' },
    ],
    requestedRecordsCount: 2,
    accessDurationHours: 6,
    requestedExpiryLabel: 'Today at 02:00 PM',
    status: 'AWAITING_APPLICANT',
    updatedAt: '2 hours ago',
    createdAt: '2026-10-02T08:00:00Z',
    notes: 'Applicant opened request; pending record selection.',
    isDemo: true,
  },
  {
    id: 'req-104',
    applicantId: 'app-1004',
    applicantName: 'Demo Applicant D (Sneha Kulkarni)',
    applicantIdentifier: 'sneha.k@demo.lifepass',
    referenceLabel: 'APP-1004',
    purpose: 'Credit Facility Assessment',
    requirementProfileId: 'profile-loan',
    requirementProfile: 'Comprehensive Financial & Tax Records',
    requestedRecords: [
      { id: 'rec-8', label: 'National Identity Proof', category: 'Identity' },
      { id: 'rec-9', label: 'Address Proof', category: 'Identity' },
      { id: 'rec-10', label: 'ITR Filing FY25-26', category: 'Finance' },
      { id: 'rec-11', label: 'Bank Statement 6 Months', category: 'Finance' },
    ],
    requestedRecordsCount: 4,
    accessDurationHours: 72,
    requestedExpiryLabel: 'Oct 4 at 02:20 PM',
    status: 'ACTIVE_ACCESS',
    updatedAt: 'Yesterday',
    createdAt: '2026-10-01T14:20:00Z',
    notes: 'Consent granted. Active audit-logged view window (valid for 48h).',
    isDemo: true,
  },
  {
    id: 'req-105',
    applicantId: 'app-1001',
    applicantName: 'Demo Applicant E (Vikram Rao)',
    applicantIdentifier: 'vikram.rao@demo.lifepass',
    referenceLabel: 'APP-1005',
    purpose: 'Merchant Onboarding Verification',
    requirementProfileId: 'profile-kyc',
    requirementProfile: 'Business Registration & Tax Identification',
    requestedRecords: [
      { id: 'rec-12', label: 'PAN Card', category: 'Finance' },
      { id: 'rec-13', label: 'Identity Proof', category: 'Identity' },
      { id: 'rec-14', label: 'Business Address Proof', category: 'Identity' },
    ],
    requestedRecordsCount: 3,
    accessDurationHours: 24,
    requestedExpiryLabel: 'Expired',
    status: 'APPROVED',
    updatedAt: '2 days ago',
    createdAt: '2026-09-30T11:00:00Z',
    notes: 'Verification finalized by compliance officer.',
    isDemo: true,
  },
  {
    id: 'req-106',
    applicantId: 'app-1002',
    applicantName: 'Demo Applicant F (Ananya Iyer)',
    applicantIdentifier: 'ananya.iyer@demo.lifepass',
    referenceLabel: 'APP-1006',
    purpose: 'Residential Tenancy Background Check',
    requirementProfileId: 'profile-kyc',
    requirementProfile: 'Basic Identity & Address Verification',
    requestedRecords: [
      { id: 'rec-15', label: 'Passport Identity Proof', category: 'Identity' },
      { id: 'rec-16', label: 'Utility Bill Address Proof', category: 'Identity' },
    ],
    requestedRecordsCount: 2,
    accessDurationHours: 24,
    requestedExpiryLabel: 'Expired',
    status: 'EXPIRED',
    updatedAt: '5 days ago',
    createdAt: '2026-09-27T09:10:00Z',
    notes: 'Consent request window expired without citizen disclosure.',
    isDemo: true,
  },
];

/**
 * Computes dashboard and applications summary metrics from a list of institution requests.
 */
export function computeInstitutionMetrics(requests: InstitutionRequest[]): InstitutionMetrics {
  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (r) => r.status === 'SENT' || r.status === 'AWAITING_APPLICANT'
  ).length;

  const activeApplications = requests.filter(
    (r) => r.status !== 'EXPIRED' && r.status !== 'REJECTED' && r.status !== 'DRAFT'
  ).length;

  const awaitingApplicantAction = requests.filter(
    (r) => r.status === 'AWAITING_APPLICANT'
  ).length;

  const activeAuthorizedAccess = requests.filter(
    (r) => r.status === 'ACTIVE_ACCESS'
  ).length;

  const sentRequests = requests.filter(
    (r) => r.status === 'SENT'
  ).length;

  const expiredRequests = requests.filter(
    (r) => r.status === 'EXPIRED'
  ).length;

  return {
    totalRequests,
    pendingRequests,
    activeApplications,
    awaitingApplicantAction,
    activeAuthorizedAccess,
    sentRequests,
    expiredRequests,
  };
}

/**
 * Maps request status to display badge styling metadata
 */
export function getStatusBadgeConfig(status: InstitutionRequestStatus): {
  label: string;
  variant: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  description: string;
} {
  switch (status) {
    case 'DRAFT':
      return {
        label: 'Draft',
        variant: 'neutral',
        description: 'Saved locally; not yet dispatched to applicant',
      };
    case 'SENT':
      return {
        label: 'Sent',
        variant: 'info',
        description: 'Dispatched to applicant; awaiting initial response',
      };
    case 'AWAITING_APPLICANT':
      return {
        label: 'Awaiting Applicant',
        variant: 'warning',
        description: 'Applicant opened request; awaiting consent & record grant',
      };
    case 'APPROVED':
      return {
        label: 'Approved',
        variant: 'success',
        description: 'Verification completed and approved by institution',
      };
    case 'ACTIVE_ACCESS':
      return {
        label: 'Active Access',
        variant: 'success',
        description: 'Authorized access active with compliance auditing',
      };
    case 'EXPIRED':
      return {
        label: 'Expired',
        variant: 'neutral',
        description: 'Request time window has lapsed',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        variant: 'danger',
        description: 'Declined by applicant or canceled by institution',
      };
  }
}
