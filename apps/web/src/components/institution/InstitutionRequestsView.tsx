import React, { useState, useMemo } from 'react';
import { useInstitutionRequests } from '../../context/InstitutionRequestContext';
import { getStatusBadgeConfig } from '../../services/institutionDemoData';
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
  const { requests, openCreateWizard, viewRequestDetails } = useInstitutionRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleCreate = () => {
    if (onCreateRequestClick) {
      onCreateRequestClick();
    } else {
      openCreateWizard();
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.id.toLowerCase().includes(q) ||
        req.applicantName.toLowerCase().includes(q) ||
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
          <h1 style={styles.title}>Verification Requests & Applications</h1>
          <p style={styles.subtitle}>
            Dispatched verification requests, required document profiles, and citizen response statuses.
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

      {/* 2. Phase W-3 Notice Banner */}
      <div style={styles.w3Banner}>
        <div style={styles.w3BannerHeader}>
          <Badge variant="info" size="sm">
            PHASE W-3 ACTIVE
          </Badge>
          <span style={styles.w3BannerTitle}>
            Interactive Request Creation & Simulated Dispatch Active
          </span>
        </div>
        <p style={styles.w3BannerText}>
          Use <strong>+ Create Request</strong> to configure a verification package, select candidate profiles, customize requested records, and dispatch. Newly dispatched requests immediately register below with status <code style={styles.codeText}>SENT</code>.
        </p>
      </div>

      {/* 3. Search and Filters */}
      <div style={styles.controlsRow}>
        <input
          type="text"
          placeholder="Search by request ID, applicant name, purpose, or profile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          aria-label="Search verification requests"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.selectInput}
          aria-label="Filter by status"
        >
          <option value="ALL">All Statuses ({requests.length})</option>
          <option value="SENT">Sent</option>
          <option value="AWAITING_APPLICANT">Awaiting Applicant</option>
          <option value="ACTIVE_ACCESS">Active Access</option>
          <option value="APPROVED">Approved</option>
          <option value="EXPIRED">Expired</option>
          <option value="REJECTED">Rejected</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {/* 4. Requests List / Table */}
      <Card
        title={`Verification Applications (${filtered.length})`}
        subtitle="Catalog of active, pending, and completed verification requests"
      >
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <h3 style={styles.emptyTitle}>No matching requests found</h3>
            <p style={styles.emptySubtitle}>
              Try adjusting your search query or status filter to see other requests.
            </p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Request ID</th>
                  <th style={styles.th}>Applicant</th>
                  <th style={styles.th}>Purpose & Profile</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Items</th>
                  <th style={styles.th}>Dispatched / Updated</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const statusMeta = getStatusBadgeConfig(req.status);
                  return (
                    <tr key={req.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <code style={styles.codeTextHighlight}>{req.id}</code>
                      </td>
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
                          {req.requestedRecordsCount} docs
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
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
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
  w3Banner: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.md,
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  w3BannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  w3BannerTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.primary,
  },
  w3BannerText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  controlsRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 280px',
    padding: '0.625rem 0.875rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderDark}`,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    fontSize: '0.875rem',
    outline: 'none',
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
  },
  td: {
    padding: '0.875rem 1.25rem',
    verticalAlign: 'middle',
  },
  codeText: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
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
