import React, { useState, useMemo } from 'react';
import { useInstitutionRequests } from '../../context/InstitutionRequestContext';
import {
  getStatusBadgeConfig,
  getChecklistItemsForRequest,
  getChecklistSummary,
} from '../../services/institutionDemoData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

export interface InstitutionRequestsViewProps {
  onCreateRequestClick?: () => void;
}

export const InstitutionRequestsView: React.FC<InstitutionRequestsViewProps> = ({
  onCreateRequestClick,
}) => {
  const { requests, metrics, openCreateWizard, viewRequestDetails } = useInstitutionRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleCreate = () => {
    if (onCreateRequestClick) {
      onCreateRequestClick();
    } else {
      openCreateWizard();
    }
  };

  // Deterministic search and status filtering
  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        req.applicantName.toLowerCase().includes(q) ||
        req.referenceLabel.toLowerCase().includes(q) ||
        req.purpose.toLowerCase().includes(q) ||
        req.requirementProfile.toLowerCase().includes(q) ||
        req.applicantIdentifier.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  return (
    <div style={styles.container}>
      {/* 1. Page Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <Badge variant="info" size="sm">
              PHASE W-4
            </Badge>
            <span style={styles.phaseLabel}>Applications & Request Management</span>
          </div>
          <h1 style={styles.title}>Applications & Verification Requests</h1>
          <p style={styles.subtitle}>
            Inspect candidate verification workflows, monitor dispatched requests, and inspect requirement checklists.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleCreate}
          icon={<span style={{ fontWeight: 800 }}>+</span>}
        >
          Create Request
        </Button>
      </div>

      {/* 2. Deterministic Summary Metrics Cards */}
      <div style={styles.metricsGrid} aria-label="Applications Summary">
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Applications</span>
          <div style={styles.metricValue}>{requests.length}</div>
          <span style={styles.metricSub}>Active and archived workflows</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Sent (Awaiting Citizen)</span>
          <div style={{ ...styles.metricValue, color: theme.colors.primary }}>
            {metrics.sentRequests}
          </div>
          <span style={styles.metricSub}>Dispatched in demo inbox</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Awaiting Applicant Action</span>
          <div style={{ ...styles.metricValue, color: theme.colors.warning }}>
            {metrics.awaitingApplicantAction}
          </div>
          <span style={styles.metricSub}>Under candidate review</span>
        </div>

        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Active Access Granted</span>
          <div style={{ ...styles.metricValue, color: theme.colors.success }}>
            {metrics.activeAuthorizedAccess}
          </div>
          <span style={styles.metricSub}>Temporary audit access window</span>
        </div>
      </div>

      {/* 3. Search and Quick Filters */}
      <div style={styles.controlsSection}>
        <div style={styles.searchRow}>
          <div style={styles.searchInputWrapper}>
            <span style={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="text"
              placeholder="Search by applicant name, reference (APP-1001), purpose, or request ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Search applications"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
                title="Clear search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.selectInput}
            aria-label="Filter applications by status"
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="SENT">Sent ({metrics.sentRequests})</option>
            <option value="AWAITING_APPLICANT">Awaiting Applicant ({metrics.awaitingApplicantAction})</option>
            <option value="ACTIVE_ACCESS">Active Access ({metrics.activeAuthorizedAccess})</option>
            <option value="APPROVED">Approved</option>
            <option value="EXPIRED">Expired</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Quick Filter Tabs */}
        <div style={styles.quickFilterTabs} role="tablist" aria-label="Status filter tabs">
          {[
            { id: 'ALL', label: `All (${requests.length})` },
            { id: 'SENT', label: `Sent (${metrics.sentRequests})` },
            { id: 'AWAITING_APPLICANT', label: `Awaiting Applicant (${metrics.awaitingApplicantAction})` },
            { id: 'ACTIVE_ACCESS', label: `Active Access (${metrics.activeAuthorizedAccess})` },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'EXPIRED', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              style={statusFilter === tab.id ? styles.quickTabActive : styles.quickTab}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Applications List Card */}
      <Card
        title={`Verification Applications (${filtered.length})`}
        subtitle="Catalog of verification requests, requirement profiles, and checklist statuses"
      >
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No matching applications found</h3>
            <p style={styles.emptySubtitle}>
              {searchQuery
                ? `No applications matched "${searchQuery}". Try a different name, purpose, or reference code.`
                : 'No applications found matching the selected status filter.'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {searchQuery && (
                <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
              {statusFilter !== 'ALL' && (
                <Button variant="secondary" size="sm" onClick={() => setStatusFilter('ALL')}>
                  Show All Applications
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="lifepass-table-responsive" style={styles.tableResponsive}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.th}>Request ID</th>
                    <th style={styles.th}>Applicant</th>
                    <th style={styles.th}>Purpose & Profile</th>
                    <th style={styles.th}>Checklist Status</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Access Window</th>
                    <th style={styles.th}>Dispatched / Updated</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const statusMeta = getStatusBadgeConfig(req.status);
                    const checklistItems = getChecklistItemsForRequest(req);
                    const summary = getChecklistSummary(checklistItems);

                    return (
                      <tr key={req.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <code style={styles.codeTextHighlight}>{req.id}</code>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.applicantName}>{req.applicantName}</div>
                          <div style={styles.applicantSub}>
                            <Badge variant="neutral" size="sm">{req.referenceLabel}</Badge>
                            <span style={styles.applicantId}>{req.applicantIdentifier}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.purposeText}>{req.purpose}</div>
                          <div style={styles.profileText}>{req.requirementProfile}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.checklistPill}>
                            <span style={{ fontWeight: 600 }}>{req.requestedRecordsCount} docs</span>
                            <span style={styles.checklistDivider}>•</span>
                            <span style={styles.readinessNote}>
                              {summary.demoAvailable > 0
                                ? `${summary.demoAvailable} ready`
                                : `${summary.requested} req`}
                            </span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <Badge variant={statusMeta.variant} size="sm">
                            {statusMeta.label}
                          </Badge>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.windowText}>{req.accessDurationHours}h window</div>
                          <div style={styles.expiryText}>{req.requestedExpiryLabel}</div>
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
                            Inspect Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (< 768px) */}
            <div className="lifepass-mobile-cards" style={styles.mobileCardList}>
              {filtered.map((req) => {
                const statusMeta = getStatusBadgeConfig(req.status);
                const checklistItems = getChecklistItemsForRequest(req);
                const summary = getChecklistSummary(checklistItems);

                return (
                  <div key={req.id} style={styles.mobileCard}>
                    <div style={styles.mobileCardHeader}>
                      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                        <code style={styles.codeTextHighlight}>{req.id}</code>
                        <Badge variant="neutral" size="sm">{req.referenceLabel}</Badge>
                      </div>
                      <Badge variant={statusMeta.variant} size="sm">
                        {statusMeta.label}
                      </Badge>
                    </div>

                    <div style={styles.mobileCardBody}>
                      <div style={styles.mobileApplicantName}>{req.applicantName}</div>
                      <div style={styles.mobilePurpose}>{req.purpose}</div>
                      <div style={styles.mobileProfile}>{req.requirementProfile}</div>
                      
                      <div style={styles.mobileChecklistRow}>
                        <span style={styles.mobileChecklistLabel}>Requirement Checklist:</span>
                        <span style={styles.mobileChecklistValue}>
                          {req.requestedRecordsCount} docs ({summary.demoAvailable} available, {summary.requested} requested, {summary.demoMissing} missing)
                        </span>
                      </div>

                      <div style={styles.mobileMetaRow}>
                        <span>Window: <strong>{req.accessDurationHours}h</strong></span>
                        <span>•</span>
                        <span>{req.updatedAt}</span>
                      </div>
                    </div>

                    <div style={styles.mobileCardFooter}>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => viewRequestDetails(req)}
                      >
                        Inspect Details & Checklist →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* 5. Phase W-4 Notice Banner */}
      <div style={styles.w4Banner}>
        <div style={styles.w4BannerHeader}>
          <span style={{ fontSize: '1rem' }}>🛡️</span>
          <span style={styles.w4BannerTitle}>
            Phase W-4 Scope Notice: Inspection & Checklist Readiness
          </span>
        </div>
        <p style={styles.w4BannerText}>
          Officers can inspect application parameters, candidate profiles, and simulated requirement checklist states. Real applicant consent, encrypted document decryption, and backend audit logging are not active in this frontend phase.
        </p>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  phaseLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: '0.25rem 0 0 0',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.875rem',
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    padding: '1rem',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.xs,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metricLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  metricValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    lineHeight: 1,
  },
  metricSub: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    marginTop: '0.125rem',
  },
  controlsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  searchRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  searchInputWrapper: {
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderDark}`,
    borderRadius: theme.radii.sm,
    padding: '0 0.75rem',
    boxShadow: theme.shadows.xs,
  },
  searchIcon: {
    fontSize: '0.875rem',
    marginRight: '0.5rem',
    color: theme.colors.textMuted,
  },
  searchInput: {
    flex: 1,
    padding: '0.625rem 0',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: theme.colors.textPrimary,
    fontSize: '0.875rem',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '0.75rem',
  },
  selectInput: {
    padding: '0.625rem 0.875rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderDark}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontSize: '0.875rem',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: theme.shadows.xs,
  },
  quickFilterTabs: {
    display: 'flex',
    gap: '0.375rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  quickTab: {
    padding: '0.375rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surfaceMuted,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  quickTabActive: {
    padding: '0.375rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.sm,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
  codeTextHighlight: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceAccent,
    color: theme.colors.primary,
    fontWeight: 700,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.8125rem',
  },
  applicantName: {
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  applicantSub: {
    display: 'flex',
    gap: '0.375rem',
    alignItems: 'center',
    marginTop: '0.125rem',
  },
  applicantId: {
    fontSize: '0.6875rem',
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
  checklistPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceMuted,
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
  },
  checklistDivider: {
    color: theme.colors.textDim,
  },
  readinessNote: {
    color: theme.colors.primary,
    fontWeight: 600,
  },
  windowText: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: theme.colors.textPrimary,
  },
  expiryText: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
  },
  timestampText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
  },
  mobileCardList: {
    display: 'none',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  mobileCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.md,
    padding: '0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  mobileApplicantName: {
    fontWeight: 700,
    fontSize: '0.9375rem',
    color: theme.colors.textPrimary,
  },
  mobilePurpose: {
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  mobileProfile: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  mobileChecklistRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    marginTop: '0.25rem',
    backgroundColor: theme.colors.surfaceSubtle,
    padding: '0.375rem 0.5rem',
    borderRadius: theme.radii.sm,
  },
  mobileChecklistLabel: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    fontWeight: 600,
  },
  mobileChecklistValue: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
  },
  mobileMetaRow: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    marginTop: '0.25rem',
  },
  mobileCardFooter: {
    marginTop: '0.25rem',
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
    maxWidth: '420px',
  },
  w4Banner: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.md,
    padding: '0.875rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  w4BannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  w4BannerTitle: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: theme.colors.primary,
  },
  w4BannerText: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
};
