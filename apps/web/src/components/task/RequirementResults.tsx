import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ReadinessSummary } from './ReadinessSummary';
import { MatchedRecordCard } from './MatchedRecordCard';
import { MissingRequirementCard } from './MissingRequirementCard';
import {
  TaskAnalysisResult,
  MissingRequirement,
} from '../../services/taskRequirementAdapter';
import { VaultRecord } from '../../services/recordVaultRepository';
import { theme } from '../../styles/theme';

export interface RequirementResultsProps {
  analysis: TaskAnalysisResult;
  onViewRecord: (record: VaultRecord) => void;
  onAddMissing: (missing: MissingRequirement) => void;
  onNavigateVault?: () => void;
}

export const RequirementResults: React.FC<RequirementResultsProps> = ({
  analysis,
  onViewRecord,
  onAddMissing,
  onNavigateVault,
}) => {
  const { task, readiness, summary, requiredMatches, requiredMissing, usefulMatches, usefulMissing } = analysis;

  const totalRequired = summary.totalRequired;
  const matchedRequired = requiredMatches.length;

  return (
    <div style={styles.container}>
      {/* 1. TASK PROFILE HEADER */}
      <div style={styles.headerBlock}>
        <div style={styles.headerTitleRow}>
          <div>
            <div style={styles.titleLine}>
              <h2 style={styles.taskTitle}>{task.label}</h2>
              <Badge variant="info" size="sm">
                DEMO REQUIREMENT PROFILE
              </Badge>
              <Badge variant="neutral" size="sm">
                {task.confidenceNote}
              </Badge>
            </div>
            <p style={styles.taskSubtitle}>
              Based on this demo requirement profile. Requirements are mapped against your demo Record Vault.
            </p>
          </div>
        </div>
      </div>

      {/* 2. READINESS SUMMARY */}
      <ReadinessSummary
        status={readiness.status}
        percentage={readiness.percentage}
        label={readiness.label}
        badgeVariant={readiness.badgeVariant}
        explanation={readiness.explanation}
      />

      {/* 3. STRUCTURED FACTS & ADVISORY CALLOUT */}
      <div style={styles.factsCallout}>
        <div style={styles.factsHeader}>
          <span style={{ fontSize: '1.1rem' }}>📋</span>
          <strong>LifePass Requirement Summary</strong>
        </div>
        <p style={styles.factsText}>{summary.factualText}</p>
        <p style={styles.advisoryText}>{summary.advisoryText}</p>
      </div>

      {/* 4. REQUIRED RECORDS SECTION */}
      <section style={styles.section}>
        <div style={styles.sectionHeaderRow}>
          <div>
            <h3 style={styles.sectionHeading}>Required Records</h3>
            <span style={styles.sectionSub}>Configured mandatory documents for this task</span>
          </div>
          <Badge variant={matchedRequired === totalRequired ? 'success' : 'warning'} size="md">
            {matchedRequired} of {totalRequired} READY
          </Badge>
        </div>

        <div style={styles.cardsList}>
          {/* Matched required items */}
          {requiredMatches.map((item) => (
            <MatchedRecordCard
              key={item.requirement.id}
              matchedItem={item}
              onViewRecord={onViewRecord}
            />
          ))}

          {/* Missing required items */}
          {requiredMissing.map((item) => (
            <MissingRequirementCard
              key={item.requirement.id}
              missingItem={item}
              onAddMissing={onAddMissing}
            />
          ))}
        </div>
      </section>

      {/* 5. POTENTIALLY USEFUL RECORDS (Optional) */}
      {(usefulMatches.length > 0 || usefulMissing.length > 0) && (
        <section style={styles.section}>
          <div style={styles.sectionHeaderRow}>
            <div>
              <h3 style={styles.sectionHeading}>Potentially Useful Records</h3>
              <span style={styles.sectionSub}>Optional supporting documents that may be helpful</span>
            </div>
            <Badge variant="neutral" size="sm">
              OPTIONAL SUPPORTING
            </Badge>
          </div>

          <div style={styles.cardsList}>
            {usefulMatches.map((item) => (
              <MatchedRecordCard
                key={item.requirement.id}
                matchedItem={item}
                onViewRecord={onViewRecord}
              />
            ))}

            {usefulMissing.map((item) => (
              <MissingRequirementCard
                key={item.requirement.id}
                missingItem={item}
                onAddMissing={onAddMissing}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. NEXT ACTION CALLOUT CARD */}
      <Card style={styles.nextActionCard}>
        <div style={styles.nextActionContent}>
          <div style={styles.nextActionIcon}>🎯</div>
          <div style={{ flex: 1 }}>
            <span style={styles.nextActionCaption}>Recommended Next Action</span>
            <h4 style={styles.nextActionTitle}>{summary.nextActionTitle}</h4>
            <p style={styles.nextActionDesc}>{summary.nextActionDescription}</p>
          </div>
          {requiredMissing.length > 0 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => onAddMissing(requiredMissing[0])}
              style={styles.ctaButton}
            >
              + Add Missing Record
            </Button>
          ) : onNavigateVault ? (
            <Button
              variant="secondary"
              size="md"
              onClick={onNavigateVault}
              style={styles.ctaButton}
            >
              Open Record Vault →
            </Button>
          ) : null}
        </div>
      </Card>

      {/* 7. DEMO ARCHITECTURE NOTICE */}
      <div style={styles.demoNotice}>
        ℹ️ <strong>Demo Requirement Evaluation:</strong> Requirements and matching shown here are for frontend demonstration.
        LifePass AI assists with document organization; final institutional decisions and prerequisites are determined by the respective institution.
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
  headerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  headerTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  titleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    flexWrap: 'wrap',
    marginBottom: '0.375rem',
  },
  taskTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  taskSubtitle: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  factsCallout: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.infoBorder}`,
    borderRadius: '0.5rem',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  factsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: theme.colors.primary,
  },
  factsText: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  advisoryText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  sectionHeading: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  sectionSub: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  cardsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  nextActionCard: {
    padding: '1.25rem 1.5rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.625rem',
    boxShadow: theme.shadows.xs,
  },
  nextActionContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  nextActionIcon: {
    fontSize: '1.75rem',
    lineHeight: 1,
    padding: '0.5rem',
    backgroundColor: theme.colors.pageBg,
    borderRadius: '0.5rem',
    border: `1px solid ${theme.colors.borderLight}`,
  },
  nextActionCaption: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: theme.colors.primary,
    display: 'block',
    marginBottom: '0.125rem',
  },
  nextActionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0 0 0.25rem 0',
  },
  nextActionDesc: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  ctaButton: {
    whiteSpace: 'nowrap',
    boxShadow: theme.shadows.xs,
  },
  demoNotice: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.pageBg,
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    border: `1px dashed ${theme.colors.border}`,
    lineHeight: 1.4,
  },
};
