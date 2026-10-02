import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { theme } from '../styles/theme';

export const LandingRoleSelectionView: React.FC = () => {
  const { setSelectedPortal } = useInstitutionAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={styles.logoMark}>LP</div>
          <span style={styles.brandTitle}>LifePass AI</span>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <Badge variant="info" size="md">
            TWO-SIDED RECORD INTELLIGENCE PLATFORM
          </Badge>
        </div>
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
            Manage your verified records, discover requirements for life goals, and share only what you approve.
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
            onClick={() => {
              setSelectedPortal('individual');
              navigate('/individual');
            }}
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
            Request and access authorized records from applicants through LifePass verified workflows.
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
            onClick={() => {
              setSelectedPortal('institution');
              navigate('/institution/login');
            }}
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
    padding: '2.5rem 1.5rem',
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
    width: '38px',
    height: '38px',
    borderRadius: '0.625rem',
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: theme.colors.textPrimary,
  },
  mainHeading: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.025em',
    margin: '0.75rem 0 1rem 0',
  },
  subHeading: {
    fontSize: '1rem',
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.md,
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
    color: theme.colors.textPrimary,
    margin: '0 0 0.5rem 0',
  },
  cardCopy: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
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
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
  },
  checkIcon: {
    color: theme.colors.success,
    fontWeight: 700,
    fontSize: '0.875rem',
  },
  ctaButton: {
    marginTop: 'auto',
  },
  footer: {
    textAlign: 'center',
    borderTop: `1px solid ${theme.colors.border}`,
    paddingTop: '1.5rem',
    width: '100%',
  },
  footerText: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    margin: 0,
  },
};
