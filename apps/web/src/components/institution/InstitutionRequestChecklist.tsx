import React, { useState } from 'react';
import {
  InstitutionRequest,
  ChecklistItem,
  getChecklistItemsForRequest,
  getChecklistSummary,
  getChecklistStateBadgeConfig,
} from '../../services/institutionDemoData';
import { Badge } from '../ui/Badge';
import { theme } from '../../styles/theme';

export interface InstitutionRequestChecklistProps {
  request: InstitutionRequest;
}

export const InstitutionRequestChecklist: React.FC<InstitutionRequestChecklistProps> = ({ request }) => {
  const checklistItems: ChecklistItem[] = getChecklistItemsForRequest(request);
  const summary = getChecklistSummary(checklistItems);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={styles.container}>
      {/* 1. Checklist Header & Summary Counters */}
      <div style={styles.header}>
        <div>
          <h4 style={styles.heading}>Requirement Checklist</h4>
          <p style={styles.subheading}>
            Simulated readiness status for requested canonical records in this package.
          </p>
        </div>
        <div style={styles.breakdownBadges}>
          <span style={styles.breakdownChip}>
            Total: <strong>{summary.total}</strong>
          </span>
          {summary.demoAvailable > 0 && (
            <span style={{ ...styles.breakdownChip, color: theme.colors.successText, backgroundColor: theme.colors.successBg }}>
              Available: <strong>{summary.demoAvailable}</strong>
            </span>
          )}
          {summary.requested > 0 && (
            <span style={{ ...styles.breakdownChip, color: theme.colors.infoText, backgroundColor: theme.colors.infoBg }}>
              Requested: <strong>{summary.requested}</strong>
            </span>
          )}
          {summary.demoMissing > 0 && (
            <span style={{ ...styles.breakdownChip, color: theme.colors.warningText, backgroundColor: theme.colors.warningBg }}>
              Missing: <strong>{summary.demoMissing}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. Checklist Items List */}
      <div style={styles.itemsList} role="list" aria-label="Requested records checklist">
        {checklistItems.map((item) => {
          const stateMeta = getChecklistStateBadgeConfig(item.demoState);
          const isExpanded = expandedItemId === item.id;

          return (
            <div
              key={item.id}
              style={isExpanded ? styles.itemCardExpanded : styles.itemCard}
              role="listitem"
            >
              {/* Main Item Row */}
              <div
                style={styles.itemRow}
                onClick={() => toggleExpand(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(item.id);
                  }
                }}
                aria-expanded={isExpanded}
                aria-label={`${item.label}, status: ${stateMeta.label}. Click to view metadata.`}
              >
                <div style={styles.itemLeft}>
                  <span
                    style={{
                      ...styles.stateIcon,
                      color:
                        item.demoState === 'DEMO_AVAILABLE'
                          ? theme.colors.success
                          : item.demoState === 'REQUESTED'
                          ? theme.colors.primary
                          : theme.colors.warning,
                    }}
                    aria-hidden="true"
                  >
                    {stateMeta.icon}
                  </span>
                  <div>
                    <div style={styles.itemLabel}>{item.label}</div>
                    <div style={styles.itemCategory}>{item.category} Category</div>
                  </div>
                </div>

                <div style={styles.itemRight}>
                  <Badge variant={stateMeta.variant} size="sm">
                    {stateMeta.label}
                  </Badge>
                  <span style={styles.chevronIcon} aria-hidden="true">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Metadata Inspection Panel (Expanded) */}
              {isExpanded && (
                <div style={styles.metadataPanel}>
                  <div style={styles.metadataGrid}>
                    <div style={styles.metadataField}>
                      <span style={styles.metaLabel}>Record Item:</span>
                      <span style={styles.metaValue}>{item.label}</span>
                    </div>
                    <div style={styles.metadataField}>
                      <span style={styles.metaLabel}>Classification:</span>
                      <span style={styles.metaValue}>{item.category}</span>
                    </div>
                    <div style={styles.metadataField}>
                      <span style={styles.metaLabel}>Checklist State:</span>
                      <span style={styles.metaValue}>{stateMeta.label}</span>
                    </div>
                    <div style={styles.metadataField}>
                      <span style={styles.metaLabel}>Specification:</span>
                      <span style={styles.metaValueSecondary}>{item.itemSpecification}</span>
                    </div>
                    <div style={styles.metadataField}>
                      <span style={styles.metaLabel}>State Description:</span>
                      <span style={styles.metaValueSecondary}>{item.demoStateDescription}</span>
                    </div>
                  </div>

                  <div style={styles.metadataNotice}>
                    <span style={{ fontSize: '0.875rem' }}>ℹ️</span>
                    <span>
                      <strong>Metadata Inspection Only:</strong> No document contents, PDF binary files, or raw image previews are exposed. Full consented record package access is slated for future integration (Phase W-5).
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.md,
    padding: '0.875rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  heading: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  subheading: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: '0.125rem 0 0 0',
  },
  breakdownBadges: {
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  breakdownChip: {
    fontSize: '0.6875rem',
    padding: '0.2rem 0.45rem',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderLight}`,
    fontWeight: 500,
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    transition: 'all 0.15s ease',
  },
  itemCardExpanded: {
    backgroundColor: theme.colors.surface,
    border: `1.5px solid ${theme.colors.primary}`,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    boxShadow: theme.shadows.xs,
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 0.875rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  stateIcon: {
    fontSize: '1rem',
    fontWeight: 800,
    width: '1.25rem',
    textAlign: 'center',
  },
  itemLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  itemCategory: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  chevronIcon: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
  },
  metadataPanel: {
    borderTop: `1px solid ${theme.colors.borderLight}`,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: '0.75rem 0.875rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metadataGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  metadataField: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
    fontSize: '0.75rem',
    alignItems: 'baseline',
  },
  metaLabel: {
    color: theme.colors.textSecondary,
    fontWeight: 600,
    width: '110px',
    flexShrink: 0,
  },
  metaValue: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
  },
  metaValueSecondary: {
    color: theme.colors.textSecondary,
    lineHeight: 1.3,
  },
  metadataNotice: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.sm,
    padding: '0.5rem 0.625rem',
    fontSize: '0.6875rem',
    color: theme.colors.textPrimary,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.375rem',
    lineHeight: 1.3,
  },
};
