/**
 * LifePass AI — Individual Record Vault Data Model & Mock Repository
 *
 * Architecture Boundary:
 * Frontend-only mock repository for personal record management.
 * In-memory React state for session lifetime.
 * Zero Supabase, PostgreSQL, S3, or real storage dependencies.
 */

export type RecordCategory =
  | 'Identity'
  | 'Education'
  | 'Employment'
  | 'Finance'
  | 'Healthcare'
  | 'Address';

export type RecordStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'NEEDS_REVIEW'
  | 'EXPIRED'
  | 'REJECTED';

export interface VaultRecord {
  id: string;
  name: string;
  category: RecordCategory;
  type: string;
  status: RecordStatus;
  source: string;
  addedAt: string;
  updatedAt?: string;
  description?: string;
  fileName: string;
  fileSize?: string;
  format?: string;
}

export interface VaultSummary {
  total: number;
  verified: number;
  pending: number;
  needsReview: number;
}

/**
 * Initial canonical demo records for the LifePass hackathon scenarios.
 * Note: Statuses are frontend demo designations and do not imply legal verification.
 */
export const INITIAL_DEMO_RECORDS: VaultRecord[] = [
  {
    id: 'rec-aadhaar-01',
    name: 'National Identity Card (Aadhaar)',
    category: 'Identity',
    type: 'National ID',
    status: 'VERIFIED',
    source: 'User Uploaded',
    addedAt: '12 Jan 2026',
    updatedAt: '12 Jan 2026',
    description: 'Primary government-issued proof of identity and citizenship for KYC validation.',
    fileName: 'Aadhaar_Card_2025.pdf',
    fileSize: '1.2 MB',
    format: 'PDF',
  },
  {
    id: 'rec-cbse12-02',
    name: 'Class 12 Higher Secondary Marksheet',
    category: 'Education',
    type: 'Academic Marksheet',
    status: 'VERIFIED',
    source: 'CBSE Board',
    addedAt: '10 Jan 2026',
    updatedAt: '10 Jan 2026',
    description: 'Senior secondary graduation certificate with standardized subject transcripts.',
    fileName: 'CBSE_Class12_Marksheet.pdf',
    fileSize: '2.4 MB',
    format: 'PDF',
  },
  {
    id: 'rec-icse10-03',
    name: 'Class 10 Secondary School Certificate',
    category: 'Education',
    type: 'School Certificate',
    status: 'VERIFIED',
    source: 'ICSE Board',
    addedAt: '08 Jan 2026',
    updatedAt: '08 Jan 2026',
    description: 'Secondary education completion certificate and official proof of date of birth.',
    fileName: 'ICSE_Class10_Passing.pdf',
    fileSize: '1.8 MB',
    format: 'PDF',
  },
  {
    id: 'rec-domicile-04',
    name: 'Permanent Domicile Certificate',
    category: 'Address',
    type: 'Domicile Proof',
    status: 'VERIFIED',
    source: 'State Revenue Authority',
    addedAt: '18 Jan 2026',
    updatedAt: '18 Jan 2026',
    description: 'Official residency certificate validating state domicile and local address.',
    fileName: 'Domicile_Certificate_2024.pdf',
    fileSize: '950 KB',
    format: 'PDF',
  },
  {
    id: 'rec-income-05',
    name: 'Annual Income Tax Assessment Statement',
    category: 'Finance',
    type: 'Income Certificate',
    status: 'VERIFIED',
    source: 'Finance Department',
    addedAt: '15 Jan 2026',
    updatedAt: '15 Jan 2026',
    description: 'Annual family income declaration and tax assessment statement.',
    fileName: 'Income_Certificate_2025.pdf',
    fileSize: '1.5 MB',
    format: 'PDF',
  },
  {
    id: 'rec-health-07',
    name: 'National Health Insurance Card',
    category: 'Healthcare',
    type: 'Health Insurance Card',
    status: 'VERIFIED',
    source: 'Health Insurance Agency',
    addedAt: '05 Jan 2026',
    updatedAt: '05 Jan 2026',
    description: 'Active health policy card covering cashless diagnostic and inpatient care.',
    fileName: 'Health_Insurance_Policy.pdf',
    fileSize: '640 KB',
    format: 'PDF',
  },
  {
    id: 'rec-experience-08',
    name: 'Prior Employment Experience Certificate',
    category: 'Employment',
    type: 'Experience Certificate',
    status: 'NEEDS_REVIEW',
    source: 'Previous Employer HR',
    addedAt: '25 Jan 2026',
    updatedAt: '25 Jan 2026',
    description: 'Relieving letter and employment duration verification awaiting manager sign-off.',
    fileName: 'Experience_Relieving_Letter.pdf',
    fileSize: '1.1 MB',
    format: 'PDF',
  },
];

/**
 * Calculates vault summary metrics from a records list.
 */
export function calculateVaultMetrics(records: VaultRecord[]): VaultSummary {
  return {
    total: records.length,
    verified: records.filter((r) => r.status === 'VERIFIED').length,
    pending: records.filter((r) => r.status === 'PENDING').length,
    needsReview: records.filter((r) => r.status === 'NEEDS_REVIEW').length,
  };
}

/**
 * Filters records by search query and category.
 */
export function filterVaultRecords(
  records: VaultRecord[],
  searchQuery: string,
  category: string
): VaultRecord[] {
  const query = searchQuery.trim().toLowerCase();

  return records.filter((record) => {
    // 1. Category Filter
    if (category !== 'All' && record.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // 2. Search Query Filter
    if (!query) return true;

    return (
      record.name.toLowerCase().includes(query) ||
      record.category.toLowerCase().includes(query) ||
      record.type.toLowerCase().includes(query) ||
      (record.description && record.description.toLowerCase().includes(query)) ||
      (record.source && record.source.toLowerCase().includes(query))
    );
  });
}
