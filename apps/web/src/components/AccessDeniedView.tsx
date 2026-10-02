import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { theme } from '../styles/theme';

export const AccessDeniedView: React.FC = () => {
  const { user, refreshMembership, signOut } = useInstitutionAuth();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = async () => {
    setIsChecking(true);
    await refreshMembership();
    setIsChecking(false);
  };

  const displayName =
    user?.fullName ||
    user?.username ||
    user?.phone ||
    user?.userId ||
    'Authenticated Officer';

  const registeredOrg = user?.institutionName;

  return (
    <div style={styles.card}>
      <div style={{ marginBottom: '1rem' }}>
        <Badge variant="danger" size="sm">
          AUTHORIZATION BOUNDARY ENFORCED
        </Badge>
      </div>
      <h2 style={styles.title}>Institution Membership Required</h2>
      <p style={styles.subtitle}>
        You have successfully authenticated, but your identity is not registered as an active member of any institution.
      </p>

      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Authenticated Officer</span>
          <span style={styles.infoValue}>{displayName}</span>
        </div>
        {registeredOrg && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Requested Organization</span>
            <span style={styles.infoValue}>{registeredOrg}</span>
          </div>
        )}
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>User ID</span>
          <span style={styles.infoValueMono}>{user?.userId}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Membership Status</span>
          <span style={styles.infoStatus}>NO ACTIVE MEMBERSHIP</span>
        </div>
      </div>

      <div style={styles.policyNotice}>
        <strong>Security Rule:</strong> In accordance with LifePass security boundaries, the web client cannot self-promote an account to an institution role. An administrator must insert your membership record into <code>public.institution_members</code>.
      </div>

      <div style={styles.actions}>
        <Button
          variant="primary"
          size="md"
          fullWidth
          isLoading={isChecking}
          onClick={handleRefresh}
        >
          {isChecking ? 'Checking Database...' : 'Re-check Membership'}
        </Button>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={signOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: theme.shadows.md,
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    lineHeight: '1.4',
    margin: '0 0 1.5rem 0',
  },
  infoBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.25rem',
    textAlign: 'left',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.375rem 0',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    fontSize: '0.75rem',
  },
  infoLabel: {
    color: theme.colors.textSecondary,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
  },
  infoValueMono: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontMono,
    fontSize: '0.6875rem',
  },
  infoStatus: {
    color: theme.colors.dangerText,
    fontWeight: 700,
  },
  policyNotice: {
    backgroundColor: theme.colors.warningBg,
    border: `1px solid ${theme.colors.warningBorder}`,
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: theme.colors.warningText,
    textAlign: 'left',
    lineHeight: '1.4',
    marginBottom: '1.5rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
};
