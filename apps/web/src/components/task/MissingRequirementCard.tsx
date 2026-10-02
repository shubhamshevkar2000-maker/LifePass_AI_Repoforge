import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MissingRequirement } from '../../services/taskRequirementAdapter';
import { theme } from '../../styles/theme';

export interface MissingRequirementCardProps {
  missingItem: MissingRequirement;
  onAddMissing: (missing: MissingRequirement) => void;
}

export const MissingRequirementCard: React.FC<MissingRequirementCardProps> = ({
  missingItem,
  onAddMissing,
}) => {
  const { requirement, existingPendingRecord } = missingItem;

  return (
    <Card style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.missingIcon}>○</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.requirementTitleRow}>
            <h4 style={styles.requirementTitle}>{requirement.label}</h4>
            <div style={styles.badgeRow}>
              <Badge variant={requirement.required ? 'danger' : 'neutral'} size="sm">
                {requirement.required ? 'REQUIRED' : 'POTENTIALLY USEFUL'}
              </Badge>
              {existingPendingRecord ? (
                <Badge variant="warning" size="sm">
                  PENDING IN VAULT
                </Badge>
              ) : (
                <Badge variant="danger" size="sm">
                  MISSING
                </Badge>
              )}
            </div>
          </div>
          <p style={styles.description}>{requirement.description}</p>
        </div>
      </div>

      <div style={styles.actionRow}>
        <div style={styles.actionNote}>
          {existingPendingRecord ? (
            <span>
              Document uploaded as <code style={styles.code}>{existingPendingRecord.fileName}</code> (Status: PENDING)
            </span>
          ) : (
            <span>No matching document found in your demo vault</span>
          )}
        </div>

        <Button
          variant={requirement.required ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onAddMissing(missingItem)}
          style={styles.actionBtn}
        >
          {existingPendingRecord ? 'Inspect / Re-Upload' : '+ Add to Vault'}
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
  missingIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.colors.dangerBg,
    color: theme.colors.dangerText,
    border: `1px solid ${theme.colors.dangerBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.875rem',
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
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    flexWrap: 'wrap',
  },
  description: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: '0.25rem 0 0 0',
    lineHeight: 1.4,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.625rem 0.875rem',
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.borderLight}`,
    flexWrap: 'wrap',
  },
  actionNote: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
  },
  code: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontMono,
    fontWeight: 600,
  },
  actionBtn: {
    fontSize: '0.75rem',
    padding: '0.35rem 0.75rem',
    whiteSpace: 'nowrap',
  },
};
