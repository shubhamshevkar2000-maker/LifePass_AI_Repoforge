import React, { useState, useEffect, useCallback } from 'react';
import {
  InstitutionRequestItem,
  fetchInstitutionRequests,
} from '../services/institutionService';

interface ApplicationsListViewProps {
  onOpenRequest: (requestId: string) => void;
  onNavigateToCreate: () => void;
}

type StatusFilter = 'all' | 'under_review' | 'awaiting_consent' | 'completed' | 'expired';

export const ApplicationsListView: React.FC<ApplicationsListViewProps> = ({
  onOpenRequest,
  onNavigateToCreate,
}) => {
  const [requests, setRequests] = useState<InstitutionRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchInstitutionRequests();
    if (result.error) {
      setErrorMessage(result.error.message || 'Unable to retrieve applications.');
    } else if (result.data) {
      setRequests(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      req.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.applicantPhone.includes(searchQuery) ||
      req.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading applications workspace...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Failed to Load Applications</h3>
        <p style={styles.errorText}>{errorMessage}</p>
        <button type="button" style={styles.retryBtn} onClick={loadRequests}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.pageHeading}>Applications & Access Requests</h2>
          <p style={styles.pageSubheading}>
            Manage institutional verification workflows, review satisfied requirements, and inspect citizen-consented records.
          </p>
        </div>
        <button type="button" style={styles.primaryActionBtn} onClick={onNavigateToCreate}>
          + Create Request
        </button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div style={styles.controlBar}>
        <div style={styles.filterPills}>
          {(
            [
              { label: 'All Requests', value: 'all' },
              { label: 'Under Review', value: 'under_review' },
              { label: 'Awaiting Consent', value: 'awaiting_consent' },
              { label: 'Completed', value: 'completed' },
              { label: 'Expired', value: 'expired' },
            ] as const
          ).map((tab) => {
            const isActive = statusFilter === tab.value;
            const count =
              tab.value === 'all'
                ? requests.length
                : requests.filter((r) => r.status === tab.value).length;
            return (
              <button
                key={tab.value}
                type="button"
                style={{
                  ...styles.filterPill,
                  ...(isActive ? styles.filterPillActive : {}),
                }}
                onClick={() => setStatusFilter(tab.value)}
              >
                <span>{tab.label}</span>
                <span style={isActive ? styles.filterCountActive : styles.filterCount}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={styles.searchWrap}>
          <input
            type="text"
            placeholder="Search by applicant, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              style={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div style={styles.tableCard}>
        {filteredRequests.length === 0 ? (
          <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>📂</div>
            <h4 style={styles.emptyTitle}>No matching applications found</h4>
            <p style={styles.emptyDesc}>
              {searchQuery
                ? `No requests match "${searchQuery}". Try clearing search filters.`
                : 'No access requests currently exist for this filter status.'}
            </p>
            <div style={styles.emptyActions}>
              {searchQuery ? (
                <button
                  type="button"
                  style={styles.emptySecondaryBtn}
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  style={styles.emptyPrimaryBtn}
                  onClick={onNavigateToCreate}
                >
                  Create New Request
                </button>
              )}
            </div>
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
                  <th style={styles.th}>Validity Period</th>
                  <th style={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
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
                    <td style={styles.tdMutedDate}>
                      <div>Expires: {req.expiresAt.split('T')[0] || req.expiresAt.split(' ')[0]}</div>
                    </td>
                    <td style={styles.tdAction}>
                      <button
                        type="button"
                        style={styles.openWorkspaceBtn}
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
  retryBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  headerRow: {
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
  controlBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterPills: {
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap',
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'all 0.15s ease',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  filterCount: {
    fontSize: '0.6875rem',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    padding: '0.1rem 0.35rem',
    borderRadius: '9999px',
    fontWeight: 700,
  },
  filterCountActive: {
    fontSize: '0.6875rem',
    backgroundColor: '#0369A1',
    color: '#FFFFFF',
    padding: '0.1rem 0.35rem',
    borderRadius: '9999px',
    fontWeight: 700,
  },
  searchWrap: {
    position: 'relative',
    minWidth: '280px',
  },
  searchInput: {
    width: '100%',
    padding: '0.45rem 2rem 0.45rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '0.8125rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden',
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
  tdMutedDate: {
    padding: '0.875rem 1rem',
    fontSize: '0.75rem',
    color: '#64748B',
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
  openWorkspaceBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyContainer: {
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  emptyTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.5rem 0',
  },
  emptyDesc: {
    fontSize: '0.875rem',
    color: '#64748B',
    maxWidth: '400px',
    margin: '0 auto 1.5rem auto',
    lineHeight: 1.5,
  },
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  emptyPrimaryBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  emptySecondaryBtn: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#334155',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
};
