import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  createAndSendInstitutionRequest,
  InstitutionRequestItem,
} from '../services/institutionService';

interface CreateRequestViewProps {
  institutionName: string;
  onOpenRequest: (requestId: string) => void;
  onNavigateToApplications: () => void;
}

export const CreateRequestView: React.FC<CreateRequestViewProps> = ({
  institutionName,
  onOpenRequest,
  onNavigateToApplications,
}) => {
  // Form fields
  const [citizenPhone, setCitizenPhone] = useState('+15550192834');
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([
    { id: 'db1d65b9-c276-4123-aef8-25ed3c7e4fb5', name: 'Education Loan Application' },
    { id: '03d847f3-37ba-4d0f-9842-dfa4cb945a11', name: 'Employment Onboarding' },
  ]);
  const [selectedProfile, setSelectedProfile] = useState('db1d65b9-c276-4123-aef8-25ed3c7e4fb5');
  const [requestPurpose, setRequestPurpose] = useState('Education Loan Underwriting');
  const [expiryDays] = useState('30');

  useEffect(() => {
    supabase
      .from('requirement_profiles')
      .select('id, name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProfiles(data);
          setSelectedProfile(data[0].id);
        }
      });
  }, []);

  // Multi-step / submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<InstitutionRequestItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenPhone.trim() || !requestPurpose.trim()) {
      setErrorMessage('Please provide both citizen phone number and request purpose.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await createAndSendInstitutionRequest({
      citizenPhone: citizenPhone.trim(),
      purpose: requestPurpose.trim(),
      requirementProfileId: selectedProfile,
    });

    if (result.error) {
      setErrorMessage(result.error.message || 'Unable to create access request.');
    } else if (result.data) {
      setCreatedRequest(result.data);
    }

    setIsSubmitting(false);
  };

  const handleReset = () => {
    setCreatedRequest(null);
    setCitizenPhone('+15550192834');
    setRequestPurpose('Education Loan Underwriting');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageHeading}>Initiate Verification Request</h2>
        <p style={styles.pageSubheading}>
          Request verified records for an official institutional purpose. Citizen must explicitly grant consent before any records become accessible.
        </p>
      </div>

      {/* Success Banner State */}
      {createdRequest ? (
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h3 style={styles.successTitle}>Request Dispatched Successfully</h3>
          <p style={styles.successDesc}>
            Application <strong>{createdRequest.applicationNumber}</strong> was dispatched to citizen{' '}
            <strong>{createdRequest.applicantPhone}</strong> under the{' '}
            <strong>{createdRequest.requirementProfileName}</strong> profile.
          </p>

          <div style={styles.successSummaryBox}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>APPLICATION ID:</span>
              <span style={styles.summaryValMono}>{createdRequest.id}</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>STATUS:</span>
              <span style={styles.summaryValBadge}>Awaiting Citizen Consent</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>ACCESS WINDOW:</span>
              <span style={styles.summaryVal}>30 Days</span>
            </div>
          </div>

          <div style={styles.successActions}>
            <button
              type="button"
              style={styles.primaryActionBtn}
              onClick={() => onOpenRequest(createdRequest.id)}
            >
              Open Request Workspace →
            </button>
            <button
              type="button"
              style={styles.secondaryActionBtn}
              onClick={onNavigateToApplications}
            >
              View All Applications
            </button>
            <button
              type="button"
              style={styles.tertiaryActionBtn}
              onClick={handleReset}
            >
              + Create Another Request
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.formCard}>
          {errorMessage && (
            <div style={styles.errorBanner}>
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* STEP 1: APPLICANT */}
            <div style={styles.formSection}>
              <div style={styles.sectionBadge}>STEP 1</div>
              <h4 style={styles.sectionHeading}>Citizen Applicant</h4>
              <p style={styles.sectionDesc}>
                Enter the citizen's mobile phone number linked to their personal LifePass Vault.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Citizen Mobile Phone *</label>
                <input
                  type="tel"
                  style={styles.formInput}
                  placeholder="+14155552671"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  required
                />
                <span style={styles.formHint}>
                  Include country code with + (e.g. +14155552671). The citizen will receive an in-app verification prompt.
                </span>
              </div>
            </div>

            {/* STEP 2: PURPOSE */}
            <div style={styles.formSection}>
              <div style={styles.sectionBadge}>STEP 2</div>
              <h4 style={styles.sectionHeading}>Verification Purpose</h4>
              <p style={styles.sectionDesc}>
                Explain why your organization requires access. This reason is presented explicitly to the citizen.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Purpose Title *</label>
                <input
                  type="text"
                  style={styles.formInput}
                  placeholder="e.g. Higher Education Loan Underwriting"
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  required
                />
                <span style={styles.formHint}>
                  Requesting organization: <strong>{institutionName}</strong>
                </span>
              </div>
            </div>

            {/* STEP 3: CONTROLLED REQUIREMENT PROFILE */}
            <div style={styles.formSection}>
              <div style={styles.sectionBadge}>STEP 3</div>
              <h4 style={styles.sectionHeading}>Controlled Requirement Profile</h4>
              <p style={styles.sectionDesc}>
                Select the structured requirement profile from the LifePass knowledge base. (Profile selection belongs strictly within request creation).
              </p>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Requirement Profile *</label>
                <select
                  style={styles.formSelect}
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div style={styles.governanceNotice}>
                  <strong>Governance Policy:</strong> In accordance with <code>docs/DATABASE_SCHEMA.md</code> Section 4,
                  institutions cannot dispatch unseeded or arbitrary profiles. Only verified profiles registered in <code>public.requirement_profiles</code> are accepted.
                </div>
              </div>
            </div>

            {/* STEP 4: ACCESS DURATION */}
            <div style={styles.formSection}>
              <div style={styles.sectionBadge}>STEP 4</div>
              <h4 style={styles.sectionHeading}>Access Duration & Expiry</h4>
              <p style={styles.sectionDesc}>
                Institutional access is strictly time-bound per data minimization policy.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Validity Window</label>
                <input
                  type="text"
                  style={styles.formInputDisabled}
                  value={`${expiryDays} Days (Standard Institutional Window)`}
                  disabled
                />
                <span style={styles.formHint}>
                  Access automatically expires after 30 days. Citizen may revoke access earlier at any time.
                </span>
              </div>
            </div>

            {/* STEP 5: REVIEW & DISPATCH */}
            <div style={styles.reviewSummaryCard}>
              <h4 style={styles.reviewTitle}>Step 5: Review & Consent Boundary Notice</h4>
              <p style={styles.reviewDesc}>
                Creating this request will dispatch an access invitation to the citizen.
                <strong> The institution does not receive documents automatically.</strong> The citizen must explicitly select which matched records to share and affirmative grant consent.
              </p>

              <div style={styles.reviewGrid}>
                <div>
                  <span style={styles.reviewLabel}>APPLICANT:</span>
                  <span style={styles.reviewVal}>{citizenPhone}</span>
                </div>
                <div>
                  <span style={styles.reviewLabel}>PURPOSE:</span>
                  <span style={styles.reviewVal}>{requestPurpose}</span>
                </div>
                <div>
                  <span style={styles.reviewLabel}>PROFILE:</span>
                  <span style={styles.reviewVal}>Education Loan Application (5 Requirements)</span>
                </div>
                <div>
                  <span style={styles.reviewLabel}>WINDOW:</span>
                  <span style={styles.reviewVal}>30 Days</span>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div style={styles.formActionRow}>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Dispatching Request...' : 'Send Request to Citizen →'}
              </button>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={onNavigateToApplications}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxWidth: '800px',
  },
  header: {
    marginBottom: '0.5rem',
  },
  pageHeading: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubheading: {
    fontSize: '0.875rem',
    color: '#64748B',
    marginTop: '0.25rem',
    lineHeight: 1.4,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '2rem',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FECACA',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: '#DC2626',
    fontSize: '0.8125rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '1.5rem',
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    fontSize: '0.625rem',
    fontWeight: 800,
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  sectionHeading: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0.25rem 0 0 0',
  },
  sectionDesc: {
    fontSize: '0.8125rem',
    color: '#64748B',
    margin: '0 0 0.75rem 0',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  formLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#334155',
  },
  formInput: {
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  formInputDisabled: {
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#64748B',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
    width: '100%',
  },
  formSelect: {
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '0.875rem',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  formHint: {
    fontSize: '0.75rem',
    color: '#94A3B8',
    marginTop: '0.125rem',
  },
  governanceNotice: {
    fontSize: '0.75rem',
    color: '#0369A1',
    backgroundColor: '#F0F9FF',
    border: '1px solid #BAE6FD',
    borderRadius: '6px',
    padding: '0.625rem 0.875rem',
    marginTop: '0.5rem',
    lineHeight: 1.4,
  },
  reviewSummaryCard: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '1.25rem',
  },
  reviewTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.375rem 0',
  },
  reviewDesc: {
    fontSize: '0.8125rem',
    color: '#64748B',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  reviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '0.75rem',
    backgroundColor: '#FFFFFF',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #E2E8F0',
  },
  reviewLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#94A3B8',
    display: 'block',
  },
  reviewVal: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  formActionRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    paddingTop: '0.5rem',
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#64748B',
    padding: '0.75rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #BBF7D0',
    borderRadius: '8px',
    padding: '2.5rem',
    textAlign: 'center',
  },
  successIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    backgroundColor: '#DCFCE7',
    color: '#059669',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto',
    fontWeight: 800,
  },
  successTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: '0 0 0.5rem 0',
  },
  successDesc: {
    fontSize: '0.875rem',
    color: '#475569',
    maxWidth: '500px',
    margin: '0 auto 1.5rem auto',
    lineHeight: 1.5,
  },
  successSummaryBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '1rem',
    maxWidth: '450px',
    margin: '0 auto 1.5rem auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    textAlign: 'left',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748B',
  },
  summaryValMono: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#0284C7',
    fontWeight: 600,
  },
  summaryValBadge: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    fontSize: '0.6875rem',
    fontWeight: 700,
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
  },
  summaryVal: {
    fontSize: '0.75rem',
    color: '#0F172A',
    fontWeight: 600,
  },
  successActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  primaryActionBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  secondaryActionBtn: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#334155',
    padding: '0.625rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  tertiaryActionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#0284C7',
    padding: '0.625rem 1rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
