import React from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';

export const InstitutionDashboardFoundation: React.FC = () => {
  const { user, activeMembership, allMemberships, signOut } = useInstitutionAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <div style={styles.badgeSuccess}>INSTITUTION SESSION VERIFIED</div>
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

      <main style={styles.main}>
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
              <span style={styles.fieldValueMono}>{user?.id}</span>
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

          {/* Card 2: Security & RLS Isolation */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Authorization & Boundary Enforcement</h3>
            <p style={styles.cardDesc}>
              In accordance with <code>DATABASE_SCHEMA.md</code> and <code>SECURITY_CONSENT.md</code>:
            </p>
            <ul style={styles.list}>
              <li>Institution access is scoped strictly to data owned by this institution.</li>
              <li>RLS prevents accessing citizen data without explicit consent.</li>
              <li>Client-side role promotion is blocked by PostgreSQL constraints.</li>
            </ul>
          </div>
        </div>

        {/* Phase 1 Status Banner */}
        <div style={styles.banner}>
          <div style={styles.bannerTitle}>Phase 1 — Institution Authentication Foundation Complete</div>
          <p style={styles.bannerText}>
            Institution phone OTP authentication, database membership verification, and RLS boundaries are established.
            Workflow creation, applicant requests, and consented record packages will be implemented in Phase 8.
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
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#090D16',
    color: '#F9FAFB',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#111827',
    borderBottom: '1px solid #1F2937',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeSuccess: {
    display: 'inline-block',
    backgroundColor: '#064E3B',
    border: '1px solid #059669',
    borderRadius: '0.375rem',
    padding: '0.2rem 0.5rem',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#34D399',
    letterSpacing: '0.05em',
    marginBottom: '0.25rem',
  },
  orgTitle: {
    fontSize: '1.375rem',
    fontWeight: 700,
    margin: '0.25rem 0 0.125rem 0',
  },
  orgSubtitle: {
    fontSize: '0.8125rem',
    color: '#9CA3AF',
    margin: 0,
  },
  roleTag: {
    color: '#38BDF8',
    fontWeight: 600,
  },
  signOutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #374151',
    color: '#D1D5DB',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  main: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
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
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '0.75rem',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    margin: '0 0 1rem 0',
    color: '#F9FAFB',
  },
  cardDesc: {
    fontSize: '0.8125rem',
    color: '#9CA3AF',
    margin: '0 0 0.75rem 0',
  },
  fieldRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #1F2937',
    fontSize: '0.8125rem',
  },
  fieldLabel: {
    color: '#9CA3AF',
  },
  fieldValue: {
    color: '#F9FAFB',
    fontWeight: 600,
  },
  fieldValueMono: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
  },
  statusActive: {
    color: '#34D399',
    fontWeight: 700,
  },
  list: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.8125rem',
    color: '#D1D5DB',
    lineHeight: '1.6',
  },
  banner: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  bannerTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#38BDF8',
    marginBottom: '0.25rem',
  },
  bannerText: {
    fontSize: '0.8125rem',
    color: '#CBD5E1',
    lineHeight: '1.5',
    margin: 0,
  },
  multiOrg: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '0.75rem',
    padding: '1rem',
  },
  multiOrgTitle: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#9CA3AF',
    margin: '0 0 0.5rem 0',
  },
  multiOrgList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  multiOrgItem: {
    backgroundColor: '#1E293B',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    color: '#F9FAFB',
  },
};
