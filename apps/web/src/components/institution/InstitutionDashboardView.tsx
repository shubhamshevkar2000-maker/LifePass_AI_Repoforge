import React, { useState, useMemo } from 'react';
import { useInstitutionAuth } from '../../context/InstitutionAuthContext';
import { useInstitutionRequests } from '../../context/InstitutionRequestContext';
import { getStatusBadgeConfig } from '../../services/institutionDemoData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

export interface InstitutionDashboardViewProps {
  onCreateRequestClick?: () => void;
}

export const InstitutionDashboardView: React.FC<InstitutionDashboardViewProps> = ({
  onCreateRequestClick,
}) => {
  const { user, activeMembership } = useInstitutionAuth();
  const { requests, metrics, openCreateWizard, viewRequestDetails } = useInstitutionRequests();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const institutionName = activeMembership?.institution?.name || user?.institutionName || 'LifePass Partner Institution';
  const institutionType = activeMembership?.institution?.type || user?.institutionType || 'Financial Institution';
  const officerName = user?.fullName || user?.username || 'Verified Officer';
  const officerRole = activeMembership?.role?.toUpperCase() || user?.role || 'COMPLIANCE_OFFICER';

  const handleCreate = () => {
    if (onCreateRequestClick) {
      onCreateRequestClick();
    } else {
      openCreateWizard();
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (filterStatus === 'ALL') return requests;
    if (filterStatus === 'PENDING') {
      return requests.filter((r) => r.status === 'SENT' || r.status === 'AWAITING_APPLICANT');
    }
    if (filterStatus === 'ACTIVE') {
      return requests.filter((r) => r.status === 'ACTIVE_ACCESS');
    }
    if (filterStatus === 'COMPLETED') {
      return requests.filter((r) => r.status === 'APPROVED' || r.status === 'EXPIRED' || r.status === 'REJECTED');
    }
    return requests;
  }, [requests, filterStatus]);

  return (
    <div style={styles.container}>
      {/* 1. Header Context Section */}
      <section style={styles.headerContext} aria-label="Institution Context">
        <div style={styles.headerLeft}>
          <div style={styles.badgeRow}>
            <Badge variant="info" size="sm">
              INSTITUTION PORTAL
            </Badge>
            <Badge variant="success" size="sm">
              SESSION VERIFIED
            </Badge>
          </div>
          <h1 style={styles.institutionTitle}>{institutionName}</h1>
          <p style={styles.institutionMeta}>
            <span>Classification: <strong>{institutionType.toUpperCase()}</strong></span>
            <span style={styles.metaSeparator}>•</span>
            <span>Logged in as: <strong>{officerName}</strong> (<span style={styles.roleTag}>{officerRole}</span>)</span>
            <span style={styles.metaSeparator}>•</span>
            <span>ID: <code style={styles.codeText}>{user?.userId || 'usr-inst-1'}</code></span>
          </p>
        </div>

        <div style={styles.headerRight}>
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            icon={<span style={{ fontWeight: 800 }}>+</span>}
          >
            Create Request
          </Button>
        </div>
      </section>

      {/* 2. 4 Summary Metrics Cards */}
      <section style={styles.metricsGrid} aria-label="Portal Metrics">
        {/* Metric 1: Pending Requests */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Pending Requests</span>
            <span style={styles.metricIconWrap}>⏳</span>
          </div>
          <div style={styles.metricValue}>{metrics.pendingRequests}</div>
          <div style={styles.metricSubtext}>
            Dispatched or awaiting citizen review
          </div>
        </div>

        {/* Metric 2: Active Applications */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Active Applications</span>
            <span style={styles.metricIconWrap}>📁</span>
          </div>
          <div style={styles.metricValue}>{metrics.activeApplications}</div>
          <div style={styles.metricSubtext}>
            Workflows currently in active pipeline
          </div>
        </div>

        {/* Metric 3: Awaiting Applicant Action */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Awaiting Applicant Action</span>
            <span style={styles.metricIconWrap}>👤</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.colors.warning }}>
            {metrics.awaitingApplicantAction}
          </div>
          <div style={styles.metricSubtext}>
            Action required by candidate/citizen
          </div>
        </div>

        {/* Metric 4: Active Authorized Access */}
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Active Authorized Access</span>
            <span style={styles.metricIconWrap}>🛡️</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.colors.success }}>
            {metrics.activeAuthorizedAccess}
          </div>
          <div style={styles.metricSubtext}>
            Active consent grant with audit window
          </div>
        </div>
      </section>

      {/* 3. Workflows / Verification Requests Table */}
      <section style={styles.workflowsSection} aria-label="Recent Workflows">
        <Card
          title="Active Verification Workflows"
          subtitle="Real-time status of verification packages requested from citizens"
          headerAction={
            <div style={styles.filterGroup}>
              <button
                type="button"
                style={filterStatus === 'ALL' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setFilterStatus('ALL')}
              >
                All ({requests.length})
              </button>
              <button
                type="button"
                style={filterStatus === 'PENDING' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setFilterStatus('PENDING')}
              >
                Pending ({metrics.pendingRequests})
              </button>
              <button
                type="button"
                style={filterStatus === 'ACTIVE' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setFilterStatus('ACTIVE')}
              >
                Authorized ({metrics.activeAuthorizedAccess})
              </button>
              <button
                type="button"
                style={filterStatus === 'COMPLETED' ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setFilterStatus('COMPLETED')}
              >
                Completed / Other
              </button>
            </div>
          }
        >
          {filteredRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <h3 style={styles.emptyTitle}>No verification requests found</h3>
              <p style={styles.emptySubtitle}>
                No requests currently match the selected filter criteria.
              </p>
            </div>
          ) : (
            <div style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Applicant</th>
                    <th style={styles.th}>Purpose & Requirement</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Records</th>
                    <th style={styles.th}>Updated</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => {
                    const statusMeta = getStatusBadgeConfig(req.status);
                    return (
                      <tr key={req.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <div style={styles.applicantName}>{req.applicantName}</div>
                          <div style={styles.applicantId}>{req.applicantIdentifier}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.purposeText}>{req.purpose}</div>
                          <div style={styles.profileText}>{req.requirementProfile}</div>
                        </td>
                        <td style={styles.td}>
                          <Badge variant={statusMeta.variant} size="sm">
                            {statusMeta.label}
                          </Badge>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.recordsPill}>
                            {req.requestedRecordsCount} records
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.timestampText}>{req.updatedAt}</span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => viewRequestDetails(req)}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  headerContext: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    backgroundColor: theme.colors.surface,
    padding: '1.5rem',
    borderRadius: theme.radii.lg,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.xs,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  institutionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  institutionMeta: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  metaSeparator: {
    color: theme.colors.textDim,
  },
  roleTag: {
    color: theme.colors.primary,
    fontWeight: 600,
  },
  codeText: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    padding: '1.25rem',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.xs,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  metricIconWrap: {
    fontSize: '1.125rem',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    lineHeight: 1,
    letterSpacing: '-0.03em',
  },
  metricSubtext: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  workflowsSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.25rem',
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.25rem',
    borderRadius: theme.radii.sm,
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    borderRadius: '0.25rem',
    transition: 'all 0.15s ease',
  },
  filterBtnActive: {
    backgroundColor: theme.colors.surface,
    border: 'none',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.colors.primary,
    cursor: 'pointer',
    borderRadius: '0.25rem',
    boxShadow: theme.shadows.xs,
  },
  tableResponsive: {
    overflowX: 'auto',
    margin: '-1.25rem',
    marginTop: '0.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  tableHeaderRow: {
    backgroundColor: theme.colors.surfaceMuted,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1.25rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableRow: {
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '0.875rem 1.25rem',
    verticalAlign: 'middle',
  },
  applicantName: {
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  applicantId: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  purposeText: {
    fontWeight: 500,
    color: theme.colors.textPrimary,
  },
  profileText: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  recordsPill: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: '0.75rem',
    fontWeight: 500,
    color: theme.colors.textSecondary,
  },
  timestampText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
  },
  emptyState: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyIcon: {
    fontSize: '2.5rem',
  },
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  emptySubtitle: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
};
