import React from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { Badge } from './ui/Badge';
import { theme } from '../styles/theme';

export interface InstitutionDashboardFoundationProps {
  embedded?: boolean;
}

export const InstitutionDashboardFoundation: React.FC<InstitutionDashboardFoundationProps> = ({
  embedded = false,
}) => {
  const { user, activeMembership, allMemberships, signOut } = useInstitutionAuth();

  const content = (
    <div style={embedded ? styles.embeddedContent : styles.main}>
      <div style={styles.grid}>
        {/* Card 1: Verified Identity */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Institution Officer Credentials</h3>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>Phone / Identity</span>
            <span style={styles.fieldValue}>{user?.phone || 'Verified Identity'}</span>
          </div>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>User ID</span>
            <span style={styles.fieldValueMono}>{user?.userId}</span>
          </div>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>Membership ID</span>
            <span style={styles.fieldValueMono}>{activeMembership?.id}</span>
          </div>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>Membership Status</span>
            <span style={styles.statusActive}>{activeMembership?.status?.toUpperCase()}</span>
          </div>
        </div>

        {/* Card 2: Security & Authorization Architecture */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Platform Security Principles</h3>
          <p style={styles.cardDesc}>
            Planned architecture for final platform integration:
          </p>
          <ul style={styles.list}>
            <li>Institution access is scoped strictly to data owned by this institution.</li>
            <li>Verification policies prevent accessing citizen data without explicit consent.</li>
            <li>Database authorization and RLS will be wired during final cross-workstream integration.</li>
          </ul>
        </div>
      </div>

      {/* Phase Status Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerTitle}>Frontend Development Prototype Active</div>
        <p style={styles.bannerText}>
          Institution portal shell, navigation layout, and visual components are active in mock mode.
          Backend authentication, database models, and live integration will be connected in final integration phases.
        </p>
      </div>

      {allMemberships.length > 1 && (
        <div style={styles.multiOrg}>
          <h4 style={styles.multiOrgTitle}>Other Associated Institutions</h4>
          <div style={styles.multiOrgList}>
            {allMemberships.map((m) => (
              <div key={m.id} style={styles.multiOrgItem}>
                {m.institution?.name} ({m.role})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <Badge variant="success" size="sm" style={{ marginBottom: '0.25rem' }}>
            INSTITUTION SESSION VERIFIED
          </Badge>
          <h1 style={styles.orgTitle}>
            {activeMembership?.institution?.name || 'Verified Institution'}
          </h1>
          <p style={styles.orgSubtitle}>
            Institution Type: <strong>{activeMembership?.institution?.type?.toUpperCase() || 'INSTITUTION'}</strong> | Role: <span style={styles.roleTag}>{activeMembership?.role}</span>
          </p>
        </div>
        <button type="button" style={styles.signOutBtn} onClick={signOut}>
          Sign Out
        </button>
      </header>

      <main>{content}</main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.pageBg,
    color: theme.colors.textPrimary,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.xs,
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgTitle: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0.25rem 0 0.125rem 0',
  },
  orgSubtitle: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  roleTag: {
    color: theme.colors.primary,
    fontWeight: 600,
  },
  signOutBtn: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderDark}`,
    color: theme.colors.textPrimary,
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: theme.shadows.xs,
  },
  main: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  embeddedContent: {
    width: '100%',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  card: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    boxShadow: theme.shadows.sm,
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    margin: '0 0 1rem 0',
    color: theme.colors.textPrimary,
  },
  cardDesc: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: '0 0 0.75rem 0',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    fontSize: '0.8125rem',
  },
  fieldLabel: {
    color: theme.colors.textSecondary,
  },
  fieldValue: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
  },
  fieldValueMono: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontMono,
    fontSize: '0.75rem',
  },
  statusActive: {
    color: theme.colors.success,
    fontWeight: 700,
  },
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    lineHeight: '1.6',
  },
  banner: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  bannerTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: theme.colors.primary,
    marginBottom: '0.25rem',
  },
  bannerText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    lineHeight: '1.5',
    margin: 0,
  },
  multiOrg: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    boxShadow: theme.shadows.xs,
    padding: '1rem',
  },
  multiOrgTitle: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: theme.colors.textSecondary,
    margin: '0 0 0.5rem 0',
  },
  multiOrgList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  multiOrgItem: {
    backgroundColor: theme.colors.neutralBg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
  },
};
