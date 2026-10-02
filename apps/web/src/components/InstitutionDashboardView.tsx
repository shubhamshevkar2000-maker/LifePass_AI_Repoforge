import React, { useState, useEffect, useCallback } from 'react';
import {
  InstitutionDashboardStats,
  InstitutionRequestItem,
  fetchInstitutionDashboard,
  fetchInstitutionRequests,
} from '../services/institutionService';

interface InstitutionDashboardViewProps {
  institutionName: string;
  onOpenRequest: (requestId: string) => void;
  onNavigateToCreate: () => void;
}

export const InstitutionDashboardView: React.FC<InstitutionDashboardViewProps> = ({
  institutionName,
  onOpenRequest,
  onNavigateToCreate,
}) => {
  const [stats, setStats] = useState<InstitutionDashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<InstitutionRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDevFixture, setIsDevFixture] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [statsResult, requestsResult] = await Promise.all([
      fetchInstitutionDashboard(),
      fetchInstitutionRequests(),
    ]);

    if (statsResult.error || requestsResult.error) {
      setErrorMessage(
        statsResult.error?.message ||
          requestsResult.error?.message ||
          'Unable to load operational dashboard data.'
      );
    } else {
      if (statsResult.data) setStats(statsResult.data);
      if (requestsResult.data) setRecentRequests(requestsResult.data);
      setIsDevFixture(statsResult.isDevFixture || requestsResult.isDevFixture);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading operational metrics...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Failed to Load Dashboard</h3>
        <p style={styles.errorText}>{errorMessage}</p>
        <button type="button" style={styles.retryBtn} onClick={loadDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.dashboardHeader}>
        <div>
          <h2 style={styles.pageHeading}>Verification Operations Dashboard</h2>
          <p style={styles.pageSubheading}>
            Operational overview of citizen consent and document verification requests for {institutionName}.
          </p>
        </div>
        <button type="button" style={styles.primaryActionBtn} onClick={onNavigateToCreate}>
          + Initiate New Request
        </button>
      </div>

      {/* Development Fixture Banner */}
      {isDevFixture && (
        <div style={styles.fixtureNoticeBanner}>
          <span style={styles.fixtureNoticeIcon}>🧪</span>
          <div style={styles.fixtureNoticeContent}>
            <span style={styles.fixtureNoticeTitle}>DEV FIXTURE / DEVELOPMENT ONLY: </span>
            <span style={styles.fixtureNoticeDesc}>
              Showing simulated institutional requests for workflow testing. Live data binds to PostgreSQL public.access_requests.
            </span>
          </div>
        </div>
      )}

      {/* Operational Metric Cards */}
      {stats && (
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>TOTAL REQUESTS</div>
            <div style={styles.metricValue}>{stats.activeRequests}</div>
            <div style={styles.metricSub}>Across controlled profiles</div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>UNDER REVIEW</div>
            <div style={styles.metricValue}>{stats.underReview}</div>
            <div style={styles.metricSub}>Awaiting officer assessment</div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>AWAITING CITIZEN CONSENT</div>
            <div style={styles.metricValue}>{stats.awaitingConsent}</div>
            <div style={styles.metricSub}>Dispatched to citizen mobile app</div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>COMPLETED WORKFLOWS</div>
            <div style={styles.metricValue}>{stats.completed}</div>
            <div style={styles.metricSub}>Past 30 days</div>
          </div>
        </div>
      )}

      {/* Recent Applications Card */}
      <div style={styles.tableCard}>
        <div style={styles.cardHeaderBox}>
          <div>
            <h3 style={styles.cardTitle}>Active Verification Requests</h3>
            <p style={styles.cardSubtitle}>
              Recent workflows requiring assessment or awaiting citizen consent.
            </p>
          </div>
        </div>

        {recentRequests.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>No active verification requests found.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Application ID</th>
                  <th style={styles.th}>Citizen Applicant</th>
                  <th style={styles.th}>Purpose & Profile</th>
                  <th style={styles.th}>Readiness</th>
                  <th style={styles.th}>Citizen Consent</th>
                  <th style={styles.th}>Workflow Status</th>
                  <th style={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id} style={styles.tableBodyRow}>
                    <td style={styles.tdMono}>{req.applicationNumber}</td>
                    <td style={styles.tdBold}>
                      <div>{req.applicantName}</div>
                      <div style={styles.applicantContactSub}>{req.applicantPhone}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.purposeText}>{req.purpose}</div>
                      <div style={styles.profileTextSub}>{req.requirementProfileName}</div>
                    </td>
                    <td style={styles.td}>
                      {req.consentStatus === 'granted' ? (
                        <span style={styles.badgeSuccessScore}>
                          {req.readinessScore}% ({req.satisfiedCount}/{req.totalCount})
                        </span>
                      ) : (
                        <span style={styles.badgePendingScore}>— Awaiting Consent</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {req.consentStatus === 'granted' ? (
                        <span style={styles.consentPillGranted}>✓ Consent Granted</span>
                      ) : req.consentStatus === 'awaiting' ? (
                        <span style={styles.consentPillPending}>⏳ Awaiting Citizen</span>
                      ) : req.consentStatus === 'expired' ? (
                        <span style={styles.consentPillExpired}>⌛ Expired</span>
                      ) : (
                        <span style={styles.consentPillDenied}>✕ Denied</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {req.status === 'under_review' ? (
                        <span style={styles.statusPillUnderReview}>Under Review</span>
                      ) : req.status === 'completed' ? (
                        <span style={styles.statusPillCompleted}>Completed</span>
                      ) : req.status === 'awaiting_consent' ? (
                        <span style={styles.statusPillPending}>Dispatched</span>
                      ) : (
                        <span style={styles.statusPillExpired}>Expired</span>
                      )}
                    </td>
                    <td style={styles.tdAction}>
                      <button
                        type="button"
                        style={styles.viewDocBtn}
                        onClick={() => onOpenRequest(req.id)}
                      >
                        Open Workspace →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
    margin: '2rem',
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
  retryBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  fixtureNoticeBanner: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '6px',
    padding: '0.625rem 1rem',
    gap: '0.5rem',
  },
  fixtureNoticeIcon: {
    fontSize: '1.125rem',
  },
  fixtureNoticeContent: {
    fontSize: '0.8125rem',
  },
  fixtureNoticeTitle: {
    fontWeight: 700,
    color: '#92400E',
  },
  fixtureNoticeDesc: {
    color: '#78350F',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '0.05em',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: '0.25rem 0',
  },
  metricSub: {
    fontSize: '0.75rem',
    color: '#94A3B8',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  cardHeaderBox: {
    padding: '1.25rem',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '0.8125rem',
    color: '#64748B',
    margin: '0.25rem 0 0 0',
  },
  tableWrapper: {
    overflowX: 'auto',
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
  tdMono: {
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    fontFamily: 'monospace',
    fontWeight: 600,
    color: '#0284C7',
  },
  tdBold: {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  applicantContactSub: {
    fontSize: '0.75rem',
    color: '#94A3B8',
    fontWeight: 400,
    marginTop: '0.125rem',
  },
  td: {
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    color: '#334155',
  },
  purposeText: {
    fontWeight: 600,
    color: '#0F172A',
  },
  profileTextSub: {
    fontSize: '0.6875rem',
    color: '#64748B',
    marginTop: '0.125rem',
  },
  badgeSuccessScore: {
    backgroundColor: '#DCFCE7',
    color: '#059669',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  badgePendingScore: {
    color: '#94A3B8',
    fontSize: '0.75rem',
    fontStyle: 'italic',
  },
  consentPillGranted: {
    backgroundColor: '#DCFCE7',
    color: '#059669',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #BBF7D0',
  },
  consentPillPending: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #FDE68A',
  },
  consentPillExpired: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    border: '1px solid #FECACA',
  },
  consentPillDenied: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
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
  emptyContainer: {
    padding: '3rem',
    textAlign: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
};
