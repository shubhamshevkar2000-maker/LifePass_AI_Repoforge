import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge, BadgeProps } from '../ui/Badge';
import { VaultRecord, RecordStatus } from '../../services/recordVaultRepository';
import { theme } from '../../styles/theme';

export interface RecordDetailsModalProps {
  record: VaultRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUseForTask?: (record: VaultRecord) => void;
}

const statusBadgeProps: Record<RecordStatus, { variant: BadgeProps['variant']; label: string }> = {
  VERIFIED: { variant: 'success', label: 'VERIFIED' },
  PENDING: { variant: 'warning', label: 'PENDING' },
  NEEDS_REVIEW: { variant: 'danger', label: 'NEEDS REVIEW' },
  EXPIRED: { variant: 'neutral', label: 'EXPIRED' },
  REJECTED: { variant: 'danger', label: 'REJECTED' },
};

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  record,
  isOpen,
  onClose,
  onUseForTask,
}) => {
  if (!record) return null;

  const statusConfig = statusBadgeProps[record.status] || {
    variant: 'neutral',
    label: record.status,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Details"
      description="View record details, source information, and document metadata."
      maxWidth="620px"
      footer={
        <div style={styles.footerContainer}>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
          {onUseForTask && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onUseForTask(record);
                onClose();
              }}
            >
              Use for Task Demo →
            </Button>
          )}
        </div>
      }
    >
      <div style={styles.content}>
        {/* Header Block */}
        <div style={styles.headerBlock}>
          <div style={styles.headerTitleRow}>
            <div style={styles.recordIcon}>📄</div>
            <div style={{ flex: 1 }}>
              <h3 style={styles.recordName}>{record.name}</h3>
              <div style={styles.badgeRow}>
                <Badge variant={statusConfig.variant} size="md">
                  {statusConfig.label}
                </Badge>
                <Badge variant="info" size="md">
                  {record.category}
                </Badge>
                <span style={styles.recordId}>ID: {record.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={styles.metaGrid}>
          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Document Type</span>
            <span style={styles.metaValue}>{record.type}</span>
          </div>

          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Source</span>
            <span style={styles.metaValue}>{record.source}</span>
          </div>

          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Date Added</span>
            <span style={styles.metaValue}>{record.addedAt}</span>
          </div>

          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Last Updated</span>
            <span style={styles.metaValue}>{record.updatedAt || record.addedAt}</span>
          </div>

          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>File Name</span>
            <span style={styles.metaValueCode}>{record.fileName}</span>
          </div>

          <div style={styles.metaItem}>
            <span style={styles.metaLabel}>Format & Size</span>
            <span style={styles.metaValue}>
              {record.format || 'PDF'} • {record.fileSize || 'Standard'}
            </span>
          </div>
        </div>

        {/* Description / Notes Box */}
        {record.description && (
          <div style={styles.sectionBlock}>
            <h4 style={styles.sectionHeading}>Description & Purpose</h4>
            <div style={styles.descriptionBox}>{record.description}</div>
          </div>
        )}

        {/* Consent & Access Control Banner */}
        <div style={styles.securityBanner}>
          <div style={styles.securityIcon}>🛡️</div>
          <div>
            <strong style={styles.securityTitle}>Consent & Access Control</strong>
            <p style={styles.securityText}>
              Organizations cannot access your records without your explicit, scoped consent for each task.
            </p>
          </div>
        </div>

        {/* Demo Notice */}
        <div style={styles.demoDisclaimer}>
          ℹ️ <strong>Frontend Demo Data:</strong> Verification status and metadata shown here are for demonstration.
        </div>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  headerBlock: {
    paddingBottom: '1rem',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
  },
  recordIcon: {
    fontSize: '2rem',
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: `1px solid ${theme.colors.border}`,
    lineHeight: 1,
  },
  recordName: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0 0 0.5rem 0',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  recordId: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontMono,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.875rem',
    backgroundColor: theme.colors.pageBg,
    padding: '1rem',
    borderRadius: '0.5rem',
    border: `1px solid ${theme.colors.border}`,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metaLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  metaValue: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.colors.textPrimary,
  },
  metaValueCode: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontMono,
    wordBreak: 'break-all',
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  sectionHeading: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  descriptionBox: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.75rem 0.875rem',
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.border}`,
  },
  securityBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    backgroundColor: theme.colors.infoBg,
    border: `1px solid ${theme.colors.infoBorder}`,
    borderRadius: '0.5rem',
    padding: '0.875rem',
  },
  securityIcon: {
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  securityTitle: {
    fontSize: '0.8125rem',
    color: theme.colors.infoText,
    display: 'block',
    marginBottom: '0.25rem',
  },
  securityText: {
    fontSize: '0.75rem',
    color: theme.colors.infoText,
    margin: 0,
    lineHeight: 1.4,
  },
  demoDisclaimer: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.pageBg,
    padding: '0.625rem 0.75rem',
    borderRadius: '0.375rem',
    border: `1px dashed ${theme.colors.border}`,
  },
  footerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    width: '100%',
  },
};
