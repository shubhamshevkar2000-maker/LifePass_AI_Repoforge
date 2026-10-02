/**
 * LifePass AI — Institution Demo Data Service (W-2)
 *
 * Provides a structured mock dataset of institution verification workflows
 * and dynamically derived metrics for the W-2 Institution Web Portal.
 * Frontend-only mock state with zero backend/database dependencies.
 */

export type InstitutionRequestStatus =
  | 'DRAFT'
  | 'SENT'
  | 'AWAITING_APPLICANT'
  | 'APPROVED'
  | 'ACTIVE_ACCESS'
  | 'EXPIRED'
  | 'REJECTED';

export interface InstitutionRequestSummary {
  id: string;
  applicantName: string;
  applicantIdentifier: string;
  purpose: string;
  requirementProfile: string;
  requestedRecordsCount: number;
  status: InstitutionRequestStatus;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

export interface InstitutionMetrics {
  pendingRequests: number;
  activeApplications: number;
  awaitingApplicantAction: number;
  activeAuthorizedAccess: number;
}

export const INITIAL_INSTITUTION_REQUESTS: InstitutionRequestSummary[] = [
  {
    id: 'req-101',
    applicantName: 'Demo Applicant A (Rohan Sharma)',
    applicantIdentifier: 'rohan.sharma@demo.lifepass',
    purpose: 'Home Loan KYC & Income Verification',
    requirementProfile: 'Standard Retail Loan Package (ID + Income)',
    requestedRecordsCount: 3,
    status: 'AWAITING_APPLICANT',
    updatedAt: '12 minutes ago',
    createdAt: '2026-10-02T10:15:00Z',
    notes: 'Citizen notified. Awaiting user consent and record release.',
  },
  {
    id: 'req-102',
    applicantName: 'Demo Applicant B (Priya Patel)',
    applicantIdentifier: 'priya.patel@demo.lifepass',
    purpose: 'Employment Background Check',
    requirementProfile: 'Professional Credential & Identity Verification',
    requestedRecordsCount: 2,
    status: 'SENT',
    updatedAt: '45 minutes ago',
    createdAt: '2026-10-02T09:30:00Z',
    notes: 'Request dispatched to candidate web inbox.',
  },
  {
    id: 'req-103',
    applicantName: 'Demo Applicant C (Amit Verma)',
    applicantIdentifier: 'amit.verma@demo.lifepass',
    purpose: 'Student Identity & Academic Degree Verification',
    requirementProfile: 'Higher Education Verification Pack',
    requestedRecordsCount: 2,
    status: 'AWAITING_APPLICANT',
    updatedAt: '2 hours ago',
    createdAt: '2026-10-02T08:00:00Z',
    notes: 'Applicant opened request; pending record selection.',
  },
  {
    id: 'req-104',
    applicantName: 'Demo Applicant D (Sneha Kulkarni)',
    applicantIdentifier: 'sneha.k@demo.lifepass',
    purpose: 'Credit Facility Assessment',
    requirementProfile: 'Comprehensive Financial & Tax Records',
    requestedRecordsCount: 4,
    status: 'ACTIVE_ACCESS',
    updatedAt: 'Yesterday',
    createdAt: '2026-10-01T14:20:00Z',
    notes: 'Consent granted. Active audit-logged view window (valid for 48h).',
  },
  {
    id: 'req-105',
    applicantName: 'Demo Applicant E (Vikram Rao)',
    applicantIdentifier: 'vikram.rao@demo.lifepass',
    purpose: 'Merchant Onboarding Verification',
    requirementProfile: 'Business Registration & Tax Identification',
    requestedRecordsCount: 3,
    status: 'APPROVED',
    updatedAt: '2 days ago',
    createdAt: '2026-09-30T11:00:00Z',
    notes: 'Verification finalized by compliance officer.',
  },
  {
    id: 'req-106',
    applicantName: 'Demo Applicant F (Ananya Iyer)',
    applicantIdentifier: 'ananya.iyer@demo.lifepass',
    purpose: 'Residential Tenancy Background Check',
    requirementProfile: 'Basic Identity & Address Verification',
    requestedRecordsCount: 2,
    status: 'EXPIRED',
    updatedAt: '5 days ago',
    createdAt: '2026-09-27T09:10:00Z',
    notes: 'Consent request window expired without citizen disclosure.',
  },
];

/**
 * Computes dashboard summary metrics from a list of institution requests.
 */
export function computeInstitutionMetrics(requests: InstitutionRequestSummary[]): InstitutionMetrics {
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

  return {
    pendingRequests,
    activeApplications,
    awaitingApplicantAction,
    activeAuthorizedAccess,
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
