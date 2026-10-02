import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

interface AuditEvent {
  id: string;
  eventType: string;
  actor: string;
  targetApplicant: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
}

const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt-901',
    eventType: 'REQUEST_DISPATCHED',
    actor: 'Officer Sharma (Demo Officer)',
    targetApplicant: 'Demo Applicant A',
    ipAddress: '192.168.1.42',
    timestamp: '12 mins ago',
    status: 'SUCCESS',
  },
  {
    id: 'evt-902',
    eventType: 'CONSENT_GRANTED',
    actor: 'Citizen (Demo Applicant D)',
    targetApplicant: 'Demo Applicant D',
    ipAddress: '157.34.12.98',
    timestamp: 'Yesterday, 14:22',
    status: 'SUCCESS',
  },
  {
    id: 'evt-903',
    eventType: 'PACKAGE_ACCESSED',
    actor: 'Officer Sharma (Demo Officer)',
    targetApplicant: 'Demo Applicant D',
    ipAddress: '192.168.1.42',
    timestamp: 'Yesterday, 14:35',
    status: 'SUCCESS',
  },
  {
    id: 'evt-904',
    eventType: 'VERIFICATION_APPROVED',
    actor: 'Officer Sharma (Demo Officer)',
    targetApplicant: 'Demo Applicant E',
    ipAddress: '192.168.1.42',
    timestamp: '2 days ago',
    status: 'SUCCESS',
  },
];

export const InstitutionAuditView: React.FC = () => {
  const [events] = useState<AuditEvent[]>(DEMO_AUDIT_EVENTS);

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Compliance & Verification Audit Trail</h1>
          <p style={styles.subtitle}>
            Immutable compliance record of all verification requests dispatched, consents received, and records accessed.
          </p>
        </div>
      </div>

      {/* 2. Compliance Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerHeader}>
          <Badge variant="info" size="sm">
            COMPLIANCE ASSURANCE
          </Badge>
          <span style={styles.bannerTitle}>
            Zero-Trust Access Logging
          </span>
        </div>
        <p style={styles.bannerText}>
          Every document access event requires explicit citizen consent and records officer identity, IP address, and timestamp. Live persistence to <code>public.audit_events</code> will be wired during backend integration.
        </p>
      </div>

      {/* 3. Audit Events Table */}
      <Card
        title="Recent Audit Events"
        subtitle="Chronological log of portal security and verification actions"
      >
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Event ID</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Actor</th>
                <th style={styles.th}>Target Subject</th>
                <th style={styles.th}>Result</th>
                <th style={styles.th}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <code style={styles.codeText}>{evt.id}</code>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.eventTypeText}>{evt.eventType}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.actorText}>{evt.actor}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.subjectText}>{evt.targetApplicant}</span>
                  </td>
                  <td style={styles.td}>
                    <Badge variant={evt.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
                      {evt.status}
                    </Badge>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.timestampText}>{evt.timestamp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  banner: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.md,
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  bannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  bannerTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.primary,
  },
  bannerText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
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
  eventTypeText: {
    fontFamily: theme.typography.fontMono,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  actorText: {
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  subjectText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
  },
  timestampText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
  },
};
