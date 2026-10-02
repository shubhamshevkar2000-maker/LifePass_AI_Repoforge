import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';

export const AccessDeniedView: React.FC = () => {
  const { user, refreshMembership, signOut } = useInstitutionAuth();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = async () => {
    setIsChecking(true);
    await refreshMembership();
    setIsChecking(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.badgeDenied}>AUTHORIZATION BOUNDARY ENFORCED</div>
      <h2 style={styles.title}>Institution Membership Required</h2>
      <p style={styles.subtitle}>
        You have successfully authenticated via Supabase Auth, but your identity is not registered as an active member of any institution.
      </p>

      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Authenticated User</span>
          <span style={styles.infoValue}>{user?.phone || user?.email || 'Authenticated User'}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>User ID</span>
          <span style={styles.infoValueMono}>{user?.id}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Institution Status</span>
          <span style={styles.infoStatus}>NO ACTIVE MEMBERSHIP</span>
        </div>
      </div>

      <div style={styles.policyNotice}>
        <strong>Security Rule:</strong> In accordance with LifePass security boundaries, the web client cannot self-promote an account to an institution role. An administrator must insert your membership record into <code>public.institution_members</code>.
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={{ ...styles.primaryBtn, opacity: isChecking ? 0.6 : 1 }}
          onClick={handleRefresh}
          disabled={isChecking}
        >
          {isChecking ? 'Checking Database...' : 'Re-check Membership'}
        </button>

        <button type="button" style={styles.secondaryBtn} onClick={signOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  },
  badgeDenied: {
    display: 'inline-block',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#DC2626',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748B',
    lineHeight: '1.4',
    margin: '0 0 1.5rem 0',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.25rem',
    textAlign: 'left',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.375rem 0',
    borderBottom: '1px solid #E2E8F0',
    fontSize: '0.75rem',
  },
  infoLabel: {
    color: '#64748B',
  },
  infoValue: {
    color: '#0F172A',
    fontWeight: 600,
  },
  infoValueMono: {
    color: '#0284C7',
    fontFamily: 'monospace',
    fontSize: '0.6875rem',
  },
  infoStatus: {
    color: '#DC2626',
    fontWeight: 700,
  },
  policyNotice: {
    backgroundColor: '#F1F5F9',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#475569',
    textAlign: 'left',
    lineHeight: '1.4',
    marginBottom: '1.5rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    color: '#64748B',
    border: '1px solid #CBD5E1',
    borderRadius: '0.5rem',
    padding: '0.625rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
