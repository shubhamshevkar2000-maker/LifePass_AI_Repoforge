import React from 'react';
import { useInstitutionAuth } from '../../context/InstitutionAuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

export const InstitutionSettingsView: React.FC = () => {
  const { user, activeMembership, allMemberships } = useInstitutionAuth();

  const institutionName = activeMembership?.institution?.name || user?.institutionName || 'Verified Institution';
  const institutionType = activeMembership?.institution?.type || user?.institutionType || 'bank';

  return (
    <div style={styles.container}>
      {/* 1. Page Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Institution & Officer Profile</h1>
          <p style={styles.subtitle}>
            Verified organization details, officer identity parameters, and security credentials.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Card 1: Organization Profile */}
        <Card
          title="Organization Profile"
          subtitle="Registered institutional parameters and verified status"
          headerAction={<Badge variant="success">Verified Entity</Badge>}
        >
          <div style={styles.fieldList}>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Institution Legal Name</span>
              <span style={styles.fieldValue}>{institutionName}</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Institution Classification</span>
              <span style={styles.fieldValue}>{institutionType.toUpperCase()}</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Entity Identifier</span>
              <code style={styles.codeText}>{activeMembership?.institution_id || 'inst-fin-001'}</code>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Environment Mode</span>
              <span style={styles.fieldValue}>Protected Frontend Prototype (Phase W-2)</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Officer Identity & Membership */}
        <Card
          title="Officer Identity & Credentials"
          subtitle="Authenticated session and access control assignment"
          headerAction={<Badge variant="info">{activeMembership?.role?.toUpperCase() || user?.role || 'OFFICER'}</Badge>}
        >
          <div style={styles.fieldList}>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Full Officer Name</span>
              <span style={styles.fieldValue}>{user?.fullName || 'Institutional Officer'}</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Username / ID</span>
              <code style={styles.codeText}>@{user?.username || 'officer_sharma'}</code>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Registered Contact Phone</span>
              <span style={styles.fieldValue}>{user?.phone || '+91 98765 00001'}</span>
            </div>
            <div style={styles.fieldItem}>
              <span style={styles.fieldLabel}>Membership Status</span>
              <Badge variant="success" size="sm">
                {activeMembership?.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Card 3: Associated Institutions */}
      {allMemberships.length > 0 && (
        <Card
          title="Associated Institutional Memberships"
          subtitle="All organizations linked to this officer's credentials"
        >
          <div style={styles.membershipsList}>
            {allMemberships.map((m) => (
              <div key={m.id} style={styles.membershipCard}>
                <div style={styles.membershipInfo}>
                  <div style={styles.membershipName}>{m.institution?.name}</div>
                  <div style={styles.membershipType}>{m.institution?.type?.toUpperCase()}</div>
                </div>
                <div style={styles.membershipRole}>
                  <Badge variant={m.id === activeMembership?.id ? 'info' : 'neutral'} size="sm">
                    {m.id === activeMembership?.id ? `Active • ${m.role}` : m.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Architecture Notice */}
      <div style={styles.securityNotice}>
        <strong>Role-Based Access Control Architecture:</strong>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: theme.colors.textSecondary }}>
          Officers only see verification workflows and audit records scoped to their active institution. Role elevation, API credentials, and multi-factor hardware keys will be configured during backend integration in accordance with <code>docs/SECURITY_CONSENT.md</code>.
        </p>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  fieldItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.75rem',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  fieldLabel: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  fieldValue: {
    fontSize: '0.875rem',
    color: theme.colors.textPrimary,
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
  membershipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  membershipCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1rem',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  membershipInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  membershipName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  membershipType: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  membershipRole: {
    display: 'flex',
    alignItems: 'center',
  },
  securityNotice: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.md,
    padding: '1rem 1.25rem',
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    lineHeight: 1.5,
  },
};
