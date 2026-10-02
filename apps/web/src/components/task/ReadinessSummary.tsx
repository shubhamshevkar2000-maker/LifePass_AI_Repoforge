import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ReadinessStatus } from '../../services/taskRequirementAdapter';
import { theme } from '../../styles/theme';

export interface ReadinessSummaryProps {
  status: ReadinessStatus;
  percentage: number;
  label: string;
  badgeVariant: 'success' | 'info' | 'warning' | 'danger';
  explanation: string;
}

export const ReadinessSummary: React.FC<ReadinessSummaryProps> = ({
  status,
  percentage,
  label,
  badgeVariant,
  explanation,
}) => {
  // Bar colors mapped to semantic states
  const barColors: Record<ReadinessStatus, string> = {
    READY: theme.colors.success,
    MOSTLY_READY: theme.colors.primary,
    NEEDS_ATTENTION: theme.colors.warning,
    NOT_READY: theme.colors.danger,
  };

  const currentBarColor = barColors[status] || theme.colors.primary;

  return (
    <Card style={styles.card}>
      <div style={styles.headerRow}>
        <div>
          <span style={styles.sectionCaption}>Task Readiness Assessment</span>
          <div style={styles.titleRow}>
            <h3 style={styles.title}>Readiness: {percentage}%</h3>
            <Badge variant={badgeVariant} size="md">
              {label.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div style={styles.percentageCircle}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: currentBarColor }}>
            {percentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div style={styles.progressTrack} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percentage}%`,
            backgroundColor: currentBarColor,
          }}
        />
      </div>

      {/* Explanation Text */}
      <p style={styles.explanationText}>{explanation}</p>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: '1.25rem 1.5rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.625rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    boxShadow: theme.shadows.xs,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  sectionCaption: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: theme.colors.textSecondary,
    display: 'block',
    marginBottom: '0.25rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  percentageCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.pageBg,
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    border: `1px solid ${theme.colors.borderLight}`,
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    backgroundColor: theme.colors.pageBg,
    borderRadius: '9999px',
    overflow: 'hidden',
    border: `1px solid ${theme.colors.borderLight}`,
  },
  progressFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.4s ease-in-out',
  },
  explanationText: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
};
