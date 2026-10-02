import React from 'react';
import {
  InstitutionRequest,
  getStatusBadgeConfig,
  getChecklistItemsForRequest,
  getChecklistSummary,
} from '../../services/institutionDemoData';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

export interface InstitutionRequestStatusSummaryProps {
  request: InstitutionRequest;
}

export const InstitutionRequestStatusSummary: React.FC<InstitutionRequestStatusSummaryProps> = ({
  request,
}) => {
  const statusMeta = getStatusBadgeConfig(request.status);
  const checklistItems = getChecklistItemsForRequest(request);
  const summary = getChecklistSummary(checklistItems);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.subtitle}>Application Overview</span>
          <h3 style={styles.title}>{request.id}</h3>
        </div>
        <Badge variant={statusMeta.variant} size="md">
          {statusMeta.label}
        </Badge>
      </div>

      <div style={styles.grid}>
        <div style={styles.metricItem}>
          <span style={styles.label}>Applicant:</span>
          <span style={styles.valueHighlight}>{request.applicantName}</span>
          <span style={styles.subtext}>{request.referenceLabel}</span>
        </div>

        <div style={styles.metricItem}>
          <span style={styles.label}>Verification Purpose:</span>
          <span style={styles.value}>{request.purpose}</span>
          <span style={styles.subtext}>{request.requirementProfile}</span>
        </div>

        <div style={styles.metricItem}>
          <span style={styles.label}>Requested Records:</span>
          <span style={styles.value}>{request.requestedRecordsCount} canonical items</span>
          <span style={styles.subtext}>
            {summary.requested} requested • {summary.demoAvailable} demo available • {summary.demoMissing} missing
          </span>
        </div>

        <div style={styles.metricItem}>
          <span style={styles.label}>Access Window:</span>
          <span style={styles.value}>{request.accessDurationHours} hours TTL</span>
          <span style={styles.subtext}>Expires {request.requestedExpiryLabel}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.md,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    boxShadow: theme.shadows.xs,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    paddingBottom: '0.625rem',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  subtitle: {
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.colors.textMuted,
    fontWeight: 600,
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
    fontFamily: theme.typography.fontMono,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  label: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  value: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  valueHighlight: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: theme.colors.primary,
  },
  subtext: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
  },
};
