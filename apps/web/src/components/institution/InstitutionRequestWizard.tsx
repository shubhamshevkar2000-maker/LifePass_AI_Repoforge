import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEMO_APPLICANTS,
  DEMO_REQUIREMENT_PROFILES,
  DEMO_PURPOSES,
  DEMO_ACCESS_DURATIONS,
  DemoApplicant,
  RequirementProfile,
  RequestedRecord,
  calculateExpiryLabel,
} from '../../services/institutionDemoData';
import { useInstitutionRequests } from '../../context/InstitutionRequestContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

export interface InstitutionRequestWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionRequestWizard: React.FC<InstitutionRequestWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { createRequest, lastCreatedRequest, resetLastCreatedRequest } = useInstitutionRequests();

  // Wizard Step: 1 = Applicant, 2 = Profile & Records, 3 = Purpose & Duration, 4 = Review, 5 = Dispatched
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedApplicant, setSelectedApplicant] = useState<DemoApplicant | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<RequirementProfile | null>(null);
  const [records, setRecords] = useState<RequestedRecord[]>([]);
  const [purpose, setPurpose] = useState<string>('College Admission');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [accessDurationHours, setAccessDurationHours] = useState<number>(24);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Custom Record Input State
  const [isAddingCustomRecord, setIsAddingCustomRecord] = useState<boolean>(false);
  const [customRecordLabel, setCustomRecordLabel] = useState<string>('');
  const [customRecordCategory, setCustomRecordCategory] = useState<string>('Identity');

  // Reset form when opened fresh
  useEffect(() => {
    if (isOpen && !lastCreatedRequest) {
      setStep(1);
      setSelectedApplicant(null);
      setSelectedProfile(null);
      setRecords([]);
      setPurpose('College Admission');
      setCustomPurpose('');
      setAccessDurationHours(24);
      setValidationError(null);
      setIsAddingCustomRecord(false);
      setCustomRecordLabel('');
    } else if (isOpen && lastCreatedRequest) {
      // If opened and there's a last created request that hasn't been dismissed, go to success step
      setStep(5);
    }
  }, [isOpen]);

  // Handle Profile Selection
  const handleSelectProfile = (profile: RequirementProfile) => {
    setSelectedProfile(profile);
    // Clone records to allow editing
    setRecords([...profile.records]);
    setValidationError(null);
  };

  // Remove a requested record
  const handleRemoveRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Add custom record
  const handleAddCustomRecord = () => {
    if (!customRecordLabel.trim()) return;
    const newRecord: RequestedRecord = {
      id: `custom-${Date.now()}`,
      label: customRecordLabel.trim(),
      category: customRecordCategory,
    };
    setRecords((prev) => [...prev, newRecord]);
    setCustomRecordLabel('');
    setIsAddingCustomRecord(false);
    setValidationError(null);
  };

  // Step Validation & Progression
  const handleNext = () => {
    setValidationError(null);

    if (step === 1) {
      if (!selectedApplicant) {
        setValidationError('Please select an applicant to proceed.');
        return;
      }
      // If no profile selected yet, default to first profile or applicant context
      if (!selectedProfile) {
        const defaultProfile = DEMO_REQUIREMENT_PROFILES[0];
        setSelectedProfile(defaultProfile);
        setRecords([...defaultProfile.records]);
      }
      setStep(2);
    } else if (step === 2) {
      if (records.length === 0) {
        setValidationError('Please select or add at least one requested record.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const finalPurpose = purpose === 'Custom Purpose' ? customPurpose.trim() : purpose;
      if (!finalPurpose) {
        setValidationError('Please specify the verification purpose.');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (step > 1 && step < 5) {
      setStep((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    resetLastCreatedRequest();
    onClose();
  };

  // Dispatch Request (Simulation)
  const handleDispatch = () => {
    if (!selectedApplicant || records.length === 0) return;

    const finalPurpose = purpose === 'Custom Purpose' ? customPurpose.trim() : purpose;
    const expiryLabel = calculateExpiryLabel(accessDurationHours);

    createRequest({
      applicantId: selectedApplicant.id,
      applicantName: selectedApplicant.displayName,
      applicantIdentifier: selectedApplicant.applicantIdentifier,
      referenceLabel: selectedApplicant.referenceLabel,
      purpose: finalPurpose,
      requirementProfileId: selectedProfile?.id || 'custom-pack',
      requirementProfile: selectedProfile?.name || 'Custom Verification Pack',
      requestedRecords: records,
      accessDurationHours,
      requestedExpiryLabel: expiryLabel,
      notes: `Dispatched to citizen ${selectedApplicant.displayName}. Awaiting applicant authorization.`,
    });

    setStep(5);
  };

  const finalPurposeDisplay = purpose === 'Custom Purpose' ? (customPurpose || 'Custom Purpose') : purpose;
  const expiryPreview = calculateExpiryLabel(accessDurationHours);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={
        step === 5
          ? 'Verification Request Dispatched'
          : `Create Verification Request — Step ${step} of 4`
      }
      description={
        step === 5
          ? 'The request has been simulated and added to the institution portal.'
          : step === 1
          ? 'Select the demo candidate for verification.'
          : step === 2
          ? 'Choose a configured requirement profile and customize required records.'
          : step === 3
          ? 'Specify verification purpose and temporary access duration (TTL).'
          : 'Review request parameters before simulated dispatch.'
      }
      footer={
        step === 5 ? (
          <div style={styles.footerRow}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                handleCancel();
                navigate('/institution/requests');
              }}
            >
              View in Requests List →
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCancel}
            >
              Done (View Dashboard)
            </Button>
          </div>
        ) : (
          <div style={styles.footerRow}>
            {step > 1 ? (
              <Button variant="secondary" size="sm" onClick={handleBack}>
                ← Back
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {step > 1 && (
                <Button variant="secondary" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              {step < 4 ? (
                <Button variant="primary" size="sm" onClick={handleNext}>
                  Continue →
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleDispatch}>
                  Dispatch Request 🚀
                </Button>
              )}
            </div>
          </div>
        )
      }
    >
      <div style={styles.modalBody}>
        {/* Step Progress Bar */}
        {step < 5 && (
          <div style={styles.progressBarWrapper} aria-label="Creation Progress">
            <div style={styles.stepIndicators}>
              <span style={step === 1 ? styles.stepActive : styles.stepDone}>
                1. Applicant
              </span>
              <span style={styles.stepChevron}>›</span>
              <span style={step === 2 ? styles.stepActive : step > 2 ? styles.stepDone : styles.stepPending}>
                2. Requirements
              </span>
              <span style={styles.stepChevron}>›</span>
              <span style={step === 3 ? styles.stepActive : step > 3 ? styles.stepDone : styles.stepPending}>
                3. Purpose & TTL
              </span>
              <span style={styles.stepChevron}>›</span>
              <span style={step === 4 ? styles.stepActive : styles.stepPending}>
                4. Review
              </span>
            </div>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <div style={styles.errorBanner} role="alert">
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: APPLICANT SELECTION                               */}
        {/* ========================================================= */}
        {step === 1 && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <h3 style={styles.sectionHeading}>Select Demo Applicant</h3>
              <p style={styles.sectionSub}>
                Choose a synthetic demo applicant for this verification request.
              </p>
            </div>

            <div style={styles.applicantGrid}>
              {DEMO_APPLICANTS.map((app) => {
                const isSelected = selectedApplicant?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedApplicant(app);
                      setValidationError(null);
                    }}
                    style={isSelected ? styles.applicantCardSelected : styles.applicantCard}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedApplicant(app);
                        setValidationError(null);
                      }
                    }}
                    aria-pressed={isSelected}
                  >
                    <div style={styles.applicantHeader}>
                      <span style={styles.applicantName}>{app.displayName}</span>
                      <Badge variant={isSelected ? 'info' : 'neutral'} size="sm">
                        {app.referenceLabel}
                      </Badge>
                    </div>
                    <div style={styles.applicantDetails}>
                      <span>Context: <strong>{app.context}</strong></span>
                      <span style={styles.appIdentifier}>{app.applicantIdentifier}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedApplicant && (
              <div style={styles.selectedApplicantSummary}>
                <div style={{ fontWeight: 600, color: theme.colors.textPrimary, fontSize: '0.8125rem' }}>
                  Target Applicant Selected:
                </div>
                <div style={{ fontSize: '0.875rem', color: theme.colors.primary, fontWeight: 600, marginTop: '0.25rem' }}>
                  {selectedApplicant.displayName} ({selectedApplicant.referenceLabel})
                </div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary, marginTop: '0.125rem' }}>
                  Citizen web inbox: <code style={styles.codeText}>{selectedApplicant.applicantIdentifier}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: REQUIREMENT PROFILE & CUSTOM RECORDS              */}
        {/* ========================================================= */}
        {step === 2 && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={styles.sectionHeading}>Requirement Profile</h3>
                <Badge variant="neutral" size="sm">Demo Configured Profiles</Badge>
              </div>
              <p style={styles.sectionSub}>
                Select a profile template, then customize the requested record items as needed.
              </p>
            </div>

            {/* Profile Options */}
            <div style={styles.profileGrid}>
              {DEMO_REQUIREMENT_PROFILES.map((prof) => {
                const isSelected = selectedProfile?.id === prof.id;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleSelectProfile(prof)}
                    style={isSelected ? styles.profileBtnSelected : styles.profileBtn}
                  >
                    <div style={styles.profileBtnHeader}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: theme.colors.textPrimary }}>
                        {prof.name}
                      </span>
                      {isSelected && <span style={{ color: theme.colors.primary, fontWeight: 700 }}>✓</span>}
                    </div>
                    <p style={styles.profileDesc}>{prof.description}</p>
                    <div style={styles.profileRecordsBadge}>
                      {prof.records.length} records configured
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Requested Records Builder */}
            <div style={styles.recordsBuilderSection}>
              <div style={styles.recordsBuilderHeader}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: theme.colors.textPrimary }}>
                  Requested Records ({records.length})
                </span>
                <span style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                  At least 1 record required
                </span>
              </div>

              {records.length === 0 ? (
                <div style={styles.emptyRecords}>
                  <p style={{ margin: 0, color: theme.colors.dangerText, fontSize: '0.8125rem' }}>
                    No requested records selected. Please choose a profile above or add custom records.
                  </p>
                </div>
              ) : (
                <div style={styles.recordsList}>
                  {records.map((rec) => (
                    <div key={rec.id} style={styles.recordItem}>
                      <div style={styles.recordItemLeft}>
                        <span style={styles.recordBullet}>✓</span>
                        <span style={styles.recordLabel}>{rec.label}</span>
                        <Badge variant="neutral" size="sm">{rec.category}</Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecord(rec.id)}
                        style={styles.removeRecordBtn}
                        title="Remove record"
                        aria-label={`Remove ${rec.label}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Record Option */}
              {isAddingCustomRecord ? (
                <div style={styles.addRecordBox}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="e.g. Current Utility Bill or Tax Assessment"
                      value={customRecordLabel}
                      onChange={(e) => setCustomRecordLabel(e.target.value)}
                      style={styles.customInput}
                      autoFocus
                    />
                    <select
                      value={customRecordCategory}
                      onChange={(e) => setCustomRecordCategory(e.target.value)}
                      style={styles.customSelect}
                    >
                      <option value="Identity">Identity</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Employment">Employment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsAddingCustomRecord(false);
                        setCustomRecordLabel('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddCustomRecord}
                      disabled={!customRecordLabel.trim()}
                    >
                      Add to Request
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingCustomRecord(true)}
                  style={styles.addCustomBtn}
                >
                  + Add Custom Requested Record Item
                </button>
              )}
            </div>

            <div style={styles.prototypeNotice}>
              <strong>Boundary Notice:</strong> The institution is constructing a requested package metadata specification. The institution does NOT browse or search applicant private vaults.
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: PURPOSE & ACCESS DURATION                         */}
        {/* ========================================================= */}
        {step === 3 && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <h3 style={styles.sectionHeading}>Verification Purpose & Access Duration</h3>
              <p style={styles.sectionSub}>
                Specify why this verification is needed and set the temporary access duration.
              </p>
            </div>

            {/* Purpose Selection */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Verification Purpose <span style={{ color: theme.colors.danger }}>*</span>
              </label>
              <div style={styles.purposeGrid}>
                {DEMO_PURPOSES.map((p) => {
                  const isSelected = purpose === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPurpose(p);
                        setValidationError(null);
                      }}
                      style={isSelected ? styles.purposeBtnSelected : styles.purposeBtn}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {purpose === 'Custom Purpose' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Enter specific verification purpose..."
                    value={customPurpose}
                    onChange={(e) => {
                      setCustomPurpose(e.target.value);
                      if (e.target.value.trim()) setValidationError(null);
                    }}
                    style={styles.customInput}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Access Duration (TTL) */}
            <div style={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.formLabel}>
                  Temporary Access Duration (TTL) <span style={{ color: theme.colors.danger }}>*</span>
                </label>
                <span style={styles.expiryBadge}>
                  Expires: {expiryPreview}
                </span>
              </div>
              <div style={styles.durationGrid}>
                {DEMO_ACCESS_DURATIONS.map((opt) => {
                  const isSelected = accessDurationHours === opt.hours;
                  return (
                    <div
                      key={opt.hours}
                      onClick={() => setAccessDurationHours(opt.hours)}
                      style={isSelected ? styles.durationCardSelected : styles.durationCard}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setAccessDurationHours(opt.hours);
                        }
                      }}
                    >
                      <div style={styles.durationHours}>{opt.label}</div>
                      <div style={styles.durationDesc}>{opt.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.prototypeNotice}>
              <strong>Security Protocol Note:</strong> This access duration represents request metadata for the candidate consent agreement. It does NOT generate live cryptographic tokens or open persistent database pipelines.
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: REVIEW & DISPATCH                                 */}
        {/* ========================================================= */}
        {step === 4 && (
          <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
              <h3 style={styles.sectionHeading}>Review Verification Request</h3>
              <p style={styles.sectionSub}>
                Confirm the verification details before simulated dispatch to the candidate.
              </p>
            </div>

            <div style={styles.reviewBox}>
              <div style={styles.reviewRow}>
                <span style={styles.reviewLabel}>Target Applicant</span>
                <span style={styles.reviewValue}>
                  {selectedApplicant?.displayName} <code style={styles.codeText}>{selectedApplicant?.referenceLabel}</code>
                </span>
              </div>

              <div style={styles.reviewRow}>
                <span style={styles.reviewLabel}>Verification Purpose</span>
                <span style={styles.reviewValue}>{finalPurposeDisplay}</span>
              </div>

              <div style={styles.reviewRow}>
                <span style={styles.reviewLabel}>Requirement Profile</span>
                <span style={styles.reviewValue}>{selectedProfile?.name || 'Custom Package'}</span>
              </div>

              <div style={styles.reviewRow}>
                <span style={styles.reviewLabel}>Access Window (TTL)</span>
                <span style={styles.reviewValue}>
                  {accessDurationHours} hours ({expiryPreview})
                </span>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.colors.borderLight}` }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: theme.colors.textSecondary }}>
                  Requested Record Items ({records.length}):
                </span>
                <div style={styles.reviewRecordsList}>
                  {records.map((r) => (
                    <div key={r.id} style={styles.reviewRecordItem}>
                      <span style={{ color: theme.colors.success, fontWeight: 700 }}>✓</span>
                      <span style={{ fontSize: '0.8125rem', color: theme.colors.textPrimary }}>{r.label}</span>
                      <Badge variant="neutral" size="sm">{r.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.dispatchNotice}>
              <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
              <div>
                <strong>Demo Dispatch Boundary:</strong> Clicking <em>Dispatch Request</em> simulates notification delivery to the citizen web inbox. No real documents are shared at this stage, and applicant consent is not active in this frontend phase.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5: SUCCESS CONFIRMATION                              */}
        {/* ========================================================= */}
        {step === 5 && lastCreatedRequest && (
          <div style={styles.successContainer}>
            <div style={styles.successIconWrapper}>
              <span style={styles.successIcon}>✓</span>
            </div>
            <h3 style={styles.successTitle}>Verification Request Dispatched</h3>
            <p style={styles.successSubtitle}>
              The verification request was simulated and registered in the institution portal.
            </p>

            <div style={styles.successCard}>
              <div style={styles.successRow}>
                <span style={styles.reviewLabel}>Request ID</span>
                <code style={styles.codeTextHighlight}>{lastCreatedRequest.id}</code>
              </div>
              <div style={styles.successRow}>
                <span style={styles.reviewLabel}>Status</span>
                <Badge variant="info" size="sm">SENT</Badge>
              </div>
              <div style={styles.successRow}>
                <span style={styles.reviewLabel}>Applicant</span>
                <span style={styles.reviewValue}>{lastCreatedRequest.applicantName}</span>
              </div>
              <div style={styles.successRow}>
                <span style={styles.reviewLabel}>Purpose</span>
                <span style={styles.reviewValue}>{lastCreatedRequest.purpose}</span>
              </div>
              <div style={styles.successRow}>
                <span style={styles.reviewLabel}>Requested Records</span>
                <span style={styles.reviewValue}>{lastCreatedRequest.requestedRecordsCount} canonical documents</span>
              </div>
              <div style={styles.successRow}>
                <span style={styles.reviewLabel}>Access Window</span>
                <span style={styles.reviewValue}>{lastCreatedRequest.accessDurationHours}h (Expires {lastCreatedRequest.requestedExpiryLabel})</span>
              </div>
            </div>

            <div style={styles.successNotice}>
              <strong>Simulated Protocol Note:</strong> The applicant-side consent flow is simulated and is not active in this frontend phase. The dispatched request now appears in the Institution Requests page and active workflow dashboard.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  progressBarWrapper: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radii.sm,
    padding: '0.5rem 0.75rem',
  },
  stepIndicators: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    flexWrap: 'wrap',
  },
  stepActive: {
    fontWeight: 700,
    color: theme.colors.primary,
  },
  stepDone: {
    fontWeight: 500,
    color: theme.colors.textSecondary,
  },
  stepPending: {
    color: theme.colors.textMuted,
  },
  stepChevron: {
    color: theme.colors.textDim,
  },
  errorBanner: {
    backgroundColor: theme.colors.dangerBg,
    border: `1px solid ${theme.colors.dangerBorder}`,
    borderRadius: theme.radii.sm,
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    color: theme.colors.dangerText,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stepHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  sectionHeading: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  sectionSub: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  applicantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  applicantCard: {
    padding: '0.875rem',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  applicantCardSelected: {
    padding: '0.875rem',
    borderRadius: theme.radii.md,
    border: `2px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.surfaceAccent,
    cursor: 'pointer',
    boxShadow: theme.shadows.xs,
  },
  applicantHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.375rem',
  },
  applicantName: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.colors.textPrimary,
  },
  applicantDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
  },
  appIdentifier: {
    fontFamily: theme.typography.fontMono,
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
  },
  selectedApplicantSummary: {
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.sm,
    padding: '0.75rem 1rem',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.75rem',
  },
  profileBtn: {
    padding: '0.875rem',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  profileBtnSelected: {
    padding: '0.875rem',
    borderRadius: theme.radii.md,
    border: `2px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.surfaceAccent,
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: theme.shadows.xs,
  },
  profileBtnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileDesc: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: '0.375rem 0',
    lineHeight: 1.3,
  },
  profileRecordsBadge: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    fontWeight: 500,
  },
  recordsBuilderSection: {
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.md,
    padding: '0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  recordsBuilderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyRecords: {
    padding: '1rem',
    textAlign: 'center',
    backgroundColor: theme.colors.dangerBg,
    borderRadius: theme.radii.sm,
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    maxHeight: '160px',
    overflowY: 'auto',
  },
  recordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.375rem 0.625rem',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  recordItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  recordBullet: {
    color: theme.colors.success,
    fontWeight: 700,
    fontSize: '0.8125rem',
  },
  recordLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: theme.colors.textPrimary,
  },
  removeRecordBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontSize: '0.75rem',
    padding: '0.125rem 0.25rem',
  },
  addCustomBtn: {
    background: 'none',
    border: `1px dashed ${theme.colors.borderDark}`,
    borderRadius: theme.radii.sm,
    padding: '0.5rem',
    color: theme.colors.primary,
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  addRecordBox: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderDark}`,
    borderRadius: theme.radii.sm,
    padding: '0.75rem',
  },
  customInput: {
    flex: '1 1 200px',
    padding: '0.5rem 0.75rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderDark}`,
    fontSize: '0.8125rem',
    outline: 'none',
  },
  customSelect: {
    padding: '0.5rem 0.75rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderDark}`,
    fontSize: '0.8125rem',
    backgroundColor: theme.colors.surface,
    outline: 'none',
    cursor: 'pointer',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  purposeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.5rem',
  },
  purposeBtn: {
    padding: '0.5rem 0.75rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  purposeBtnSelected: {
    padding: '0.5rem 0.75rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.surfaceAccent,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.primary,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: theme.shadows.xs,
  },
  expiryBadge: {
    fontSize: '0.75rem',
    color: theme.colors.primary,
    fontWeight: 600,
  },
  durationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '0.5rem',
  },
  durationCard: {
    padding: '0.625rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surface,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  durationCardSelected: {
    padding: '0.625rem',
    borderRadius: theme.radii.sm,
    border: `2px solid ${theme.colors.primary}`,
    backgroundColor: theme.colors.surfaceAccent,
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: theme.shadows.xs,
  },
  durationHours: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
  },
  durationDesc: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    marginTop: '0.125rem',
  },
  prototypeNotice: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.sm,
    padding: '0.625rem 0.875rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
    lineHeight: 1.4,
  },
  reviewBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.md,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  reviewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.375rem',
    fontSize: '0.8125rem',
  },
  reviewLabel: {
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  reviewValue: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
    textAlign: 'right',
  },
  reviewRecordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '0.375rem',
  },
  reviewRecordItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dispatchNotice: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.sm,
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
    display: 'flex',
    gap: '0.625rem',
    alignItems: 'flex-start',
    lineHeight: 1.4,
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '1rem 0.5rem',
    gap: '0.5rem',
  },
  successIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: theme.colors.successBg,
    border: `2px solid ${theme.colors.successBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem',
  },
  successIcon: {
    color: theme.colors.success,
    fontSize: '1.5rem',
    fontWeight: 800,
  },
  successTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  successSubtitle: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
    maxWidth: '400px',
  },
  successCard: {
    width: '100%',
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.md,
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
    textAlign: 'left',
  },
  successRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8125rem',
  },
  successNotice: {
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.sm,
    padding: '0.625rem 0.875rem',
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    textAlign: 'left',
    lineHeight: 1.4,
    marginTop: '0.5rem',
  },
  codeText: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
  },
  codeTextHighlight: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceAccent,
    color: theme.colors.primary,
    fontWeight: 700,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.8125rem',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
};
