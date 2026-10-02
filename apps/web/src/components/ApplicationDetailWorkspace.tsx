import React, { useState, useEffect, useCallback } from 'react';
import {
  InstitutionRequestItem,
  fetchInstitutionRequestById,
  fetchInstitutionAuditEvents,
  AuditEventItem,
} from '../services/institutionService';

interface ApplicationDetailWorkspaceProps {
  requestId: string;
  institutionName: string;
  onBackToList: () => void;
}

type WorkspaceTab = 'records' | 'checklist' | 'audit';

export const ApplicationDetailWorkspace: React.FC<ApplicationDetailWorkspaceProps> = ({
  requestId,
  institutionName,
  onBackToList,
}) => {
  const [request, setRequest] = useState<InstitutionRequestItem | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('records');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDevFixture, setIsDevFixture] = useState(false);

  const loadRequestDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [reqResult, auditResult] = await Promise.all([
      fetchInstitutionRequestById(requestId),
      fetchInstitutionAuditEvents(),
    ]);

    if (reqResult.error) {
      setErrorMessage(reqResult.error.message || 'Unable to retrieve application details.');
    } else if (reqResult.data) {
      setRequest(reqResult.data);
      setIsDevFixture(reqResult.isDevFixture);
      if (auditResult.data) {
        setAuditEvents(auditResult.data);
      }
    }
    setIsLoading(false);
  }, [requestId]);

  useEffect(() => {
    loadRequestDetail();
  }, [loadRequestDetail]);

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading verification workspace...</p>
      </div>
    );
  }

  if (errorMessage || !request) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Error Loading Application</h3>
        <p style={styles.errorText}>
          {errorMessage || `Application with ID "${requestId}" could not be located.`}
        </p>
        <button type="button" style={styles.backBtn} onClick={onBackToList}>
          ← Back to Applications
        </button>
      </div>
    );
  }

  const isConsentActive = request.consentStatus === 'granted';

  return (
    <div style={styles.container}>
      {/* Navigation / Header Row */}
      <div style={styles.topNavRow}>
        <button type="button" style={styles.backBtn} onClick={onBackToList}>
          ← Back to Applications List
        </button>

        <div style={styles.topBadges}>
          {isDevFixture && <span style={styles.fixturePill}>DEV FIXTURE</span>}
          <span
            style={
              request.status === 'under_review'
                ? styles.statusPillUnderReview
                : request.status === 'completed'
                ? styles.statusPillCompleted
                : request.status === 'awaiting_consent'
                ? styles.statusPillPending
                : styles.statusPillExpired
            }
          >
            {request.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Applicant & Context Card (WHO, WHY, WHAT, STATUS, CONSENT, VALIDITY) */}
      <div style={styles.applicantCard}>
        <div style={styles.applicantInfoGrid}>
          {/* WHO */}
          <div>
            <div style={styles.applicantLabel}>APPLICANT (CITIZEN)</div>
            <div style={styles.applicantName}>{request.applicantName}</div>
            <div style={styles.applicantContact}>Phone: {request.applicantPhone}</div>
          </div>

          {/* WHY */}
          <div>
            <div style={styles.applicantLabel}>VERIFICATION PURPOSE</div>
            <div style={styles.applicantValue}>{request.purpose}</div>
            <div style={styles.applicantSubValue}>Target: {institutionName}</div>
          </div>

          {/* VALIDITY */}
          <div>
            <div style={styles.applicantLabel}>APPLICATION & VALIDITY</div>
            <div style={styles.applicantValue}>Dispatched: {request.createdAt.split('T')[0] || request.createdAt.split(' ')[0]}</div>
            <div style={styles.applicantSubValue}>Valid Until: {request.expiresAt.split('T')[0] || request.expiresAt.split(' ')[0]}</div>
          </div>

          {/* CONSENT STATE */}
          <div>
            <div style={styles.applicantLabel}>EXPLICIT CITIZEN CONSENT</div>
            {request.consentStatus === 'granted' ? (
              <div style={styles.consentBadgeGranted}>
                <span style={styles.shieldIcon}>🛡️</span> Consent Granted ({request.consentedAt ? 'Active' : '30-Day Window'})
              </div>
            ) : request.consentStatus === 'awaiting' ? (
              <div style={styles.consentBadgePending}>
                <span style={styles.shieldIcon}>⏳</span> Awaiting Citizen Consent
              </div>
            ) : request.consentStatus === 'expired' ? (
              <div style={styles.consentBadgeExpired}>
                <span style={styles.shieldIcon}>⌛</span> Consent Expired
              </div>
            ) : (
              <div style={styles.consentBadgeDenied}>
                <span style={styles.shieldIcon}>✕</span> Consent Denied
              </div>
            )}
            <div style={styles.consentSubText}>
              {request.consentStatus === 'granted'
                ? 'Only explicitly selected records are shared'
                : 'No citizen records are accessible without consent'}
            </div>
          </div>
        </div>
      </div>

      {/* Governance Notice */}
      <div style={styles.governanceNotice}>
        <div style={styles.govTitle}>🛡️ LifePass Security & Trust Architecture</div>
        <div style={styles.govText}>
          Data minimization enforced per <code>docs/SECURITY_CONSENT.md</code> and <code>docs/FRONTEND_SPEC.md</code>:
          access is limited strictly to records consented by the citizen for this verified purpose.
          LifePass strictly enforces <code>processed != source_verified</code> and never claims <em>"Verified by LifePass"</em>.
          All officer access events are logged to the append-only PostgreSQL <code>public.audit_events</code> table.
        </div>
      </div>

      {/* Intelligence Summary & Readiness Bar (Rendered from Backend, NEVER calculated locally) */}
      <div style={styles.readinessCard}>
        <div style={styles.readinessHeader}>
          <div>
            <div style={styles.readinessTitle}>Verification Readiness Summary</div>
            <div style={styles.readinessSubtitle}>
              Controlled Requirement Profile: <strong>{request.requirementProfileName}</strong>
            </div>
          </div>
          <div style={styles.readinessBadge}>
            <span style={styles.readinessScore}>{request.readinessScore}%</span> Satisfied
          </div>
        </div>

        {/* Progress Bar Track */}
        <div style={styles.progressBarTrack}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${request.readinessScore}%`,
            }}
          />
        </div>

        <div style={styles.readinessFooter}>
          <span style={styles.satisfiedText}>
            ✓ {request.satisfiedCount} of {request.totalCount} requirements satisfied
          </span>
          {request.satisfiedCount < request.totalCount && (
            <span style={styles.missingAlertText}>
              ⚠️ {request.totalCount - request.satisfiedCount} document pending: Admission Letter
            </span>
          )}
        </div>
      </div>

      {/* Workspace Tabs */}
      <div style={styles.tabsBar}>
        <button
          type="button"
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'records' ? styles.tabBtnActive : {}),
          }}
          onClick={() => setActiveTab('records')}
        >
          Submitted Records ({request.documents.filter((d) => d.status === 'verified').length})
        </button>
        <button
          type="button"
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'checklist' ? styles.tabBtnActive : {}),
          }}
          onClick={() => setActiveTab('checklist')}
        >
          Requirements Checklist ({request.totalCount})
        </button>
        <button
          type="button"
          style={{
            ...styles.tabBtn,
            ...(activeTab === 'audit' ? styles.tabBtnActive : {}),
          }}
          onClick={() => setActiveTab('audit')}
        >
          Audit Trail ({auditEvents.length})
        </button>
      </div>

      {/* TAB 1: SUBMITTED RECORDS (STRUCTURED RECORD PACKAGE) */}
      {activeTab === 'records' && (
        <div style={styles.tableCard}>
          {!isConsentActive ? (
            <div style={styles.consentRestrictedBox}>
              <div style={styles.lockIcon}>🔒</div>
              <h4 style={styles.restrictedTitle}>Access Restricted: Awaiting Citizen Consent</h4>
              <p style={styles.restrictedDesc}>
                In accordance with LifePass security architecture, the institution cannot inspect
                citizen records until explicit affirmative consent is granted by the applicant on their mobile app.
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Requirement</th>
                  <th style={styles.th}>Document Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Issuer Verified</th>
                  <th style={styles.th}>LifePass Processing</th>
                  <th style={styles.th}>Access Permitted</th>
                  <th style={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {request.documents.map((doc) => (
                  <tr key={doc.id} style={styles.tableBodyRow}>
                    <td style={styles.tdBold}>{doc.requirementName}</td>
                    <td style={styles.tdMuted}>
                      <div>{doc.docTitle}</div>
                      {doc.fileSize && (
                        <div style={styles.fileMetaSub}>
                          {doc.fileSize} • {doc.mimeType}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryPill}>{doc.category}</span>
                    </td>
                    <td style={styles.td}>
                      {doc.isSourceVerified ? (
                        <span style={styles.verifiedSource}>✓ Yes (DigiLocker / Issuer)</span>
                      ) : (
                        <span style={styles.pendingSource}>— Not Verified</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {doc.status === 'verified' ? (
                        <span style={styles.badgeVerified}>Processed</span>
                      ) : (
                        <span style={styles.badgeMissing}>Missing</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {doc.isConsented ? (
                        <span style={styles.permittedBadge}>✓ Consented</span>
                      ) : (
                        <span style={styles.unpermittedBadge}>✕ Not Consented</span>
                      )}
                    </td>
                    <td style={styles.tdAction}>
                      {doc.status === 'verified' && doc.isConsented ? (
                        <button
                          type="button"
                          style={styles.viewDocBtn}
                          onClick={() => alert(`Viewing document details: ${doc.docTitle}`)}
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          type="button"
                          style={styles.requestDocBtn}
                          onClick={() => alert('Request notification sent to citizen.')}
                        >
                          Request Doc
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: REQUIREMENTS CHECKLIST */}
      {activeTab === 'checklist' && (
        <div style={styles.checklistCard}>
          <div style={styles.checklistHeader}>
            Controlled Requirement Profile: <strong>{request.requirementProfileName}</strong>
          </div>
          <div style={styles.checklistsList}>
            {request.documents.map((item, idx) => (
              <div key={item.id} style={styles.checklistItem}>
                <div style={styles.checkIndex}>{idx + 1}</div>
                <div style={styles.checkItemContent}>
                  <div style={styles.checkItemTitle}>{item.requirementName}</div>
                  <div style={styles.checkItemMeta}>
                    Category: {item.category} • Accepted types: PDF, JPG, PNG
                  </div>
                </div>
                <div>
                  {item.status === 'verified' ? (
                    <span style={styles.badgeVerified}>✓ Satisfied</span>
                  ) : (
                    <span style={styles.badgeMissing}>✕ Missing</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Timestamp (UTC)</th>
                <th style={styles.th}>Actor</th>
                <th style={styles.th}>Event Type</th>
                <th style={styles.th}>Entity Type</th>
                <th style={styles.th}>Details / Metadata</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((log) => (
                <tr key={log.id} style={styles.tableBodyRow}>
                  <td style={styles.tdMono}>{log.timestamp}</td>
                  <td style={styles.tdBold}>{log.actor}</td>
                  <td style={styles.td}>
                    <span style={styles.auditActionTag}>{log.eventType}</span>
                  </td>
                  <td style={styles.tdMuted}>{log.entityType}</td>
                  <td style={styles.td}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Next Action Callout Banner */}
      {request.status === 'under_review' && (
        <div style={styles.nextActionCallout}>
          <div style={styles.calloutIcon}>⚠️</div>
          <div style={styles.calloutBody}>
            <div style={styles.calloutTitle}>Next Action: Missing Admission Letter</div>
            <div style={styles.calloutDesc}>
              Citizen {request.applicantName} has satisfied {request.satisfiedCount} of {request.totalCount} requirements.
              Upload of admission letter is required for loan underwriting completion.
            </div>
          </div>
          <div style={styles.calloutActions}>
            <button
              type="button"
              style={styles.calloutPrimaryBtn}
              onClick={() => alert('Document request dispatched to citizen via LifePass notification.')}
            >
              Request Document from Citizen
            </button>
            <button
              type="button"
              style={styles.calloutSecondaryBtn}
              onClick={() => alert('Proceeding with conditional underwriting...')}
            >
              Proceed with Conditions
            </button>
          </div>
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
  },
  centerContainer: {
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '3px solid #E2E8F0',
    borderTopColor: '#0284C7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748B',
    fontSize: '0.875rem',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '2.5rem',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  errorTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#DC2626',
    margin: '0 0 0.5rem 0',
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#64748B',
    marginBottom: '1.5rem',
  },
  topNavRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#0284C7',
    padding: '0.45rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  topBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fixturePill: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#78350F',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
  },
  statusPillUnderReview: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #FDE68A',
  },
  statusPillCompleted: {
    backgroundColor: '#DCFCE7',
    color: '#059669',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #BBF7D0',
  },
  statusPillPending: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #BAE6FD',
  },
  statusPillExpired: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #FECACA',
  },
  applicantCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  applicantInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '1.25rem',
  },
  applicantLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  applicantName: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#0F172A',
  },
  applicantContact: {
    fontSize: '0.8125rem',
    color: '#64748B',
    marginTop: '0.125rem',
  },
  applicantValue: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  applicantSubValue: {
    fontSize: '0.8125rem',
    color: '#64748B',
    marginTop: '0.125rem',
  },
  consentBadgeGranted: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#DCFCE7',
    color: '#059669',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  consentBadgePending: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  consentBadgeExpired: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  consentBadgeDenied: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontWeight: 700,
  },
  shieldIcon: {
    fontSize: '0.875rem',
  },
  consentSubText: {
    fontSize: '0.6875rem',
    color: '#94A3B8',
    marginTop: '0.25rem',
  },
  governanceNotice: {
    backgroundColor: '#F0F9FF',
    border: '1px solid #BAE6FD',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
  },
  govTitle: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#0369A1',
    marginBottom: '0.25rem',
  },
  govText: {
    fontSize: '0.75rem',
    color: '#0C4A6E',
    lineHeight: 1.5,
  },
  readinessCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  readinessHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  readinessTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#0F172A',
  },
  readinessSubtitle: {
    fontSize: '0.8125rem',
    color: '#64748B',
    marginTop: '0.125rem',
  },
  readinessBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  readinessScore: {
    fontSize: '0.875rem',
  },
  progressBarTrack: {
    height: '8px',
    backgroundColor: '#E2E8F0',
    borderRadius: '9999px',
    overflow: 'hidden',
    marginBottom: '0.625rem',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: '9999px',
  },
  readinessFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  },
  satisfiedText: {
    color: '#059669',
    fontWeight: 600,
  },
  missingAlertText: {
    color: '#D97706',
    fontWeight: 600,
  },
  tabsBar: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid #E2E8F0',
  },
  tabBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748B',
    cursor: 'pointer',
  },
  tabBtnActive: {
    color: '#0284C7',
    borderBottomColor: '#0284C7',
    fontWeight: 700,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  consentRestrictedBox: {
    padding: '3rem 2rem',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
  },
  lockIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  restrictedTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.5rem 0',
  },
  restrictedDesc: {
    fontSize: '0.8125rem',
    color: '#64748B',
    maxWidth: '460px',
    margin: '0 auto',
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  thAction: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: 'right',
  },
  tableBodyRow: {
    borderBottom: '1px solid #F1F5F9',
  },
  tdBold: {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  tdMuted: {
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    color: '#475569',
  },
  fileMetaSub: {
    fontSize: '0.6875rem',
    color: '#94A3B8',
    marginTop: '0.125rem',
  },
  td: {
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    color: '#334155',
  },
  tdMono: {
    padding: '0.875rem 1rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#64748B',
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  verifiedSource: {
    color: '#059669',
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  pendingSource: {
    color: '#94A3B8',
    fontSize: '0.75rem',
  },
  badgeVerified: {
    backgroundColor: '#DCFCE7',
    color: '#059669',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  badgeMissing: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  permittedBadge: {
    color: '#059669',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  unpermittedBadge: {
    color: '#DC2626',
    fontWeight: 600,
    fontSize: '0.75rem',
  },
  tdAction: {
    padding: '0.875rem 1rem',
    textAlign: 'right',
  },
  viewDocBtn: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#0F172A',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  requestDocBtn: {
    backgroundColor: '#0284C7',
    border: 'none',
    color: '#FFFFFF',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  checklistHeader: {
    fontSize: '0.875rem',
    color: '#475569',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E2E8F0',
  },
  checklistsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: '#F8FAFC',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
  },
  checkIndex: {
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    marginRight: '0.75rem',
  },
  checkItemContent: {
    flex: 1,
  },
  checkItemTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  checkItemMeta: {
    fontSize: '0.75rem',
    color: '#64748B',
    marginTop: '0.125rem',
  },
  auditActionTag: {
    backgroundColor: '#F1F5F9',
    color: '#0284C7',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  nextActionCallout: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    flexWrap: 'wrap',
  },
  calloutIcon: {
    fontSize: '1.5rem',
  },
  calloutBody: {
    flex: 1,
    minWidth: '240px',
  },
  calloutTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#92400E',
  },
  calloutDesc: {
    fontSize: '0.8125rem',
    color: '#78350F',
    marginTop: '0.125rem',
    lineHeight: 1.4,
  },
  calloutActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  calloutPrimaryBtn: {
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.5rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  calloutSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FDE68A',
    color: '#92400E',
    padding: '0.5rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
