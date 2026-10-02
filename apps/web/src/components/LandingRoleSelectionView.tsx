import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';

export const LandingRoleSelectionView: React.FC = () => {
  const { setSelectedPortal } = useInstitutionAuth();

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={styles.logoMark}>LP</div>
          <span style={styles.brandTitle}>LifePass AI</span>
        </div>
        <Badge variant="info" size="md" style={{ marginBottom: '1rem' }}>
          TWO-SIDED RECORD INTELLIGENCE PLATFORM
        </Badge>
        <h1 style={styles.mainHeading}>Choose Your Experience</h1>
        <p style={styles.subHeading}>
          LifePass connects personal record owners with verifying organizations through context-aware AI task
          orchestration, deterministic requirement matching, and explicit user consent.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div style={styles.grid}>
        {/* Card 1: Individual */}
        <Card style={styles.roleCard}>
          <div style={styles.cardHeader}>
            <Badge variant="success" size="sm">
              DATA OWNER
            </Badge>
            <span style={styles.cardIcon}>👤</span>
          </div>

          <h2 style={styles.cardTitle}>Personal Records & Life Tasks</h2>
          <p style={styles.cardCopy}>
            Manage your records, understand what you need, and share only what you approve.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.checkIcon}>✓</span>
              <span><strong>AI Task Assistant:</strong> Ask what you need for College Admission or Life Goals</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkIcon}>✓</span>
              <span><strong>Private Record Vault:</strong> Categorize and safely store identity, education, and finance records</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkIcon}>✓</span>
              <span><strong>Explicit Consent Control:</strong> Review and grant scoped, temporary institutional access</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setSelectedPortal('individual')}
            style={styles.ctaButton}
          >
            Continue as Individual →
          </Button>
        </Card>

        {/* Card 2: Institution */}
        <Card style={styles.roleCard}>
          <div style={styles.cardHeader}>
            <Badge variant="info" size="sm">
              VERIFYING ORGANIZATION
            </Badge>
            <span style={styles.cardIcon}>🏛️</span>
          </div>

          <h2 style={styles.cardTitle}>Institution Access Portal</h2>
          <p style={styles.cardCopy}>
            Request and access authorized records from applicants through LifePass.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.checkIcon}>✓</span>
              <span><strong>Structured Requests:</strong> Specify applicant, purpose, and requirement profiles</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkIcon}>✓</span>
              <span><strong>Requirement Checklists:</strong> Inspect matched records, missing items, and readiness</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.checkIcon}>✓</span>
              <span><strong>Consented Packages:</strong> Receive authorized records backed by an immutable audit trail</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setSelectedPortal('institution')}
            style={styles.ctaButton}
          >
            Continue as Institution →
          </Button>
        </Card>
      </div>

      {/* Footer Notice */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          LifePass AI Platform Architecture — Hackathon Preview. Responsive web experiences for both Individuals and Institutions.
        </p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
  },
  header: {
    textAlign: 'center',
    maxWidth: '680px',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '0.5rem',
    background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#090D16',
    fontWeight: 800,
    fontSize: '1rem',
    boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: '#F9FAFB',
  },
  mainHeading: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: '#F9FAFB',
    letterSpacing: '-0.025em',
    margin: '0.5rem 0 1rem 0',
  },
  subHeading: {
    fontSize: '1rem',
    color: '#9CA3AF',
    lineHeight: 1.6,
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    width: '100%',
  },
  roleCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '2rem',
    borderRadius: '1rem',
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  cardIcon: {
    fontSize: '1.75rem',
  },
  cardTitle: {
    fontSize: '1.375rem',
    fontWeight: 700,
    color: '#F9FAFB',
    margin: '0 0 0.5rem 0',
  },
  cardCopy: {
    fontSize: '0.875rem',
    color: '#9CA3AF',
    lineHeight: 1.5,
    margin: '0 0 1.5rem 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    marginBottom: '2rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.625rem',
    fontSize: '0.8125rem',
    color: '#D1D5DB',
    lineHeight: 1.4,
  },
  checkIcon: {
    color: '#34D399',
    fontWeight: 700,
    fontSize: '0.875rem',
  },
  ctaButton: {
    marginTop: 'auto',
  },
  footer: {
    textAlign: 'center',
    borderTop: '1px solid #1F2937',
    paddingTop: '1.5rem',
    width: '100%',
  },
  footerText: {
    fontSize: '0.75rem',
    color: '#6B7280',
    margin: 0,
  },
};
