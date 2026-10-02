import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchedRequirement } from '../../services/taskRequirementAdapter';
import { VaultRecord } from '../../services/recordVaultRepository';
import { theme } from '../../styles/theme';

export interface MatchedRecordCardProps {
  matchedItem: MatchedRequirement;
  onViewRecord: (record: VaultRecord) => void;
}

export const MatchedRecordCard: React.FC<MatchedRecordCardProps> = ({
  matchedItem,
  onViewRecord,
}) => {
  const { requirement, matchedRecord } = matchedItem;

  return (
    <Card style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.checkIcon}>✓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.requirementTitleRow}>
            <h4 style={styles.requirementTitle}>{requirement.label}</h4>
            <Badge variant="success" size="sm">
              MATCHED
            </Badge>
          </div>
          <span style={styles.foundText}>Found in My Records</span>
        </div>
      </div>

      <div style={styles.recordBox}>
        <div style={styles.recordDetails}>
          <div style={styles.recordName}>{matchedRecord.name}</div>
          <div style={styles.badgeRow}>
            <Badge variant="info" size="sm">
              {matchedRecord.category}
            </Badge>
            <Badge variant="success" size="sm">
              {matchedRecord.status}
            </Badge>
            <span style={styles.fileName}>{matchedRecord.fileName}</span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewRecord(matchedRecord)}
          style={styles.viewBtn}
        >
          View Record
        </Button>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: '1rem 1.25rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    boxShadow: theme.shadows.xs,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  checkIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.colors.successBg,
    color: theme.colors.successText,
    border: `1px solid ${theme.colors.successBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.8125rem',
    lineHeight: 1,
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  requirementTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  requirementTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  foundText: {
    fontSize: '0.75rem',
    color: theme.colors.successText,
    fontWeight: 500,
    marginTop: '0.125rem',
    display: 'block',
  },
  recordBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    backgroundColor: theme.colors.pageBg,
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.borderLight}`,
    flexWrap: 'wrap',
  },
  recordDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    minWidth: 0,
    flex: '1 1 200px',
  },
  recordName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  fileName: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontMono,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
  },
  viewBtn: {
    fontSize: '0.75rem',
    padding: '0.35rem 0.75rem',
    whiteSpace: 'nowrap',
  },
};
