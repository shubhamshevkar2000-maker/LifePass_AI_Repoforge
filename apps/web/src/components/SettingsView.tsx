import React from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';

interface SettingsViewProps {
  institutionDisplayName: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  institutionDisplayName,
}) => {
  const { user, activeMembership } = useInstitutionAuth();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageHeading}>Institution Settings & Security</h2>
        <p style={styles.pageSubheading}>
          Configuration parameters and Row Level Security isolation for {institutionDisplayName}.
        </p>
      </div>

      {/* Institution Organization Context */}
      <div style={styles.card}>
        <h3 style={styles.cardHeading}>Organization Identity</h3>
        <p style={styles.cardDesc}>
          Authoritative institutional metadata registered in PostgreSQL <code>public.institutions</code>.
        </p>

        <div style={styles.grid}>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>LEGAL ENTITY NAME</span>
            <span style={styles.fieldValue}>{institutionDisplayName}</span>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>INSTITUTION TYPE</span>
            <span style={styles.fieldValue}>
              {activeMembership?.institution?.type?.toUpperCase() || 'FINANCIAL INSTITUTION (DEMO)'}
            </span>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>REGISTRATION STATUS</span>
            <span style={styles.activeStatusPill}>
              {activeMembership?.institution?.status?.toUpperCase() || 'ACTIVE (VERIFIED)'}
            </span>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>INSTITUTION ID</span>
            <span style={styles.fieldValueMono}>
              {activeMembership?.institution_id || '00000000-0000-0000-0000-000000000001 (Demo)'}
            </span>
          </div>
        </div>
      </div>

      {/* Officer Membership Context */}
      <div style={styles.card}>
        <h3 style={styles.cardHeading}>Officer Membership & Role</h3>
        <p style={styles.cardDesc}>
          Access permissions derived from <code>public.institution_members</code>.
        </p>

        <div style={styles.grid}>
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>OFFICER IDENTITY (PHONE)</span>
            <span style={styles.fieldValue}>
              {user?.phone || 'Verified via Phone OTP (Demo)'}
            </span>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>ASSIGNED ROLE</span>
            <span style={styles.fieldValueHighlight}>
              {activeMembership?.role || 'Underwriting Officer'}
            </span>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>MEMBERSHIP STATUS</span>
            <span style={styles.activeStatusPill}>Active Member</span>
          </div>

          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>USER UUID</span>
            <span style={styles.fieldValueMono}>
              {user?.id || 'auth.uid() active session'}
            </span>
          </div>
        </div>
      </div>

      {/* Security & RLS Policy Boundary */}
      <div style={styles.card}>
        <h3 style={styles.cardHeading}>Security Architecture & RLS Boundary</h3>
        <p style={styles.cardDesc}>
          Data protection boundaries enforced at the PostgreSQL database layer.
        </p>

        <div style={styles.securityListBox}>
          <div style={styles.securityItem}>
            <span style={styles.checkIcon}>✓</span>
            <div>
              <strong>Row Level Security (RLS):</strong> Enabled on all application tables. Institution officers can only read records explicitly permitted by affirmative citizen consent.
            </div>
          </div>

          <div style={styles.securityItem}>
            <span style={styles.checkIcon}>✓</span>
            <div>
              <strong>Append-Only Audit:</strong> All document views and consent events are recorded in <code>public.audit_events</code> with immutable timestamps.
            </div>
          </div>

          <div style={styles.securityItem}>
            <span style={styles.checkIcon}>✓</span>
            <div>
              <strong>Data Minimization:</strong> Unconsented documents and raw unmasked citizen data are strictly inaccessible through institutional queries.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '850px',
  },
  header: {
    marginBottom: '0.25rem',
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
    lineHeight: 1.4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  cardHeading: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.25rem 0',
  },
  cardDesc: {
    fontSize: '0.8125rem',
    color: '#64748B',
    margin: '0 0 1.25rem 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    backgroundColor: '#F8FAFC',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  fieldLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '0.04em',
  },
  fieldValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  fieldValueHighlight: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#0284C7',
  },
  fieldValueMono: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#64748B',
  },
  activeStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    color: '#059669',
    fontSize: '0.6875rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #BBF7D0',
  },
  securityListBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    backgroundColor: '#F8FAFC',
    padding: '1.25rem',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
  },
  securityItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    fontSize: '0.8125rem',
    color: '#334155',
    lineHeight: 1.5,
  },
  checkIcon: {
    color: '#059669',
    fontWeight: 800,
    fontSize: '0.875rem',
  },
};
