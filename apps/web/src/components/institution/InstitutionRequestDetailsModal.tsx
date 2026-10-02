import React from 'react';
import { InstitutionRequest, getStatusBadgeConfig } from '../../services/institutionDemoData';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

export interface InstitutionRequestDetailsModalProps {
  request: InstitutionRequest | null;
  onClose: () => void;
}

export const InstitutionRequestDetailsModal: React.FC<InstitutionRequestDetailsModalProps> = ({
  request,
  onClose,
}) => {
  if (!request) return null;

  const statusMeta = getStatusBadgeConfig(request.status);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Workflow Overview: ${request.id}`}
      description={`Verification request specification for ${request.applicantName}`}
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close Overview
        </Button>
      }
    >
      <div style={styles.modalContent}>
        {/* Basic Header Row */}
        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Request Identifier</span>
          <code style={styles.codeTextHighlight}>{request.id}</code>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Current Status</span>
          <Badge variant={statusMeta.variant} size="sm">
            {statusMeta.label}
          </Badge>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Applicant</span>
          <span style={styles.modalValue}>{request.applicantName}</span>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Citizen Reference / Inbox</span>
          <code style={styles.codeText}>{request.applicantIdentifier}</code>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Verification Purpose</span>
          <span style={styles.modalValue}>{request.purpose}</span>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Requirement Profile</span>
          <span style={styles.modalValue}>{request.requirementProfile}</span>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Access Window (TTL)</span>
          <span style={styles.modalValue}>
            {request.accessDurationHours}h ({request.requestedExpiryLabel})
          </span>
        </div>

        <div style={styles.modalRow}>
          <span style={styles.modalLabel}>Last Activity</span>
          <span style={styles.modalValue}>{request.updatedAt}</span>
        </div>

        {/* Requested Records List */}
        <div style={styles.recordsSection}>
          <div style={styles.recordsHeading}>
            Requested Canonical Records ({request.requestedRecordsCount}):
          </div>
          <div style={styles.recordsList}>
            {request.requestedRecords && request.requestedRecords.length > 0 ? (
              request.requestedRecords.map((r) => (
                <div key={r.id} style={styles.recordItem}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: theme.colors.success, fontWeight: 700 }}>✓</span>
                    <span style={styles.recordLabel}>{r.label}</span>
                  </div>
                  <Badge variant="neutral" size="sm">{r.category}</Badge>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.8125rem', color: theme.colors.textMuted }}>
                {request.requestedRecordsCount} canonical records requested.
              </span>
            )}
          </div>
        </div>

        {/* Notes if any */}
        {request.notes && (
          <div style={styles.notesBox}>
            <strong style={{ color: theme.colors.textPrimary, fontSize: '0.8125rem' }}>Workflow Notes:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.textSecondary, fontSize: '0.75rem', lineHeight: 1.4 }}>
              {request.notes}
            </p>
          </div>
        )}

        {/* Trust & Boundary Notice */}
        <div style={styles.boundaryNotice}>
          <strong>Demo Request Protocol:</strong> Backend persistence, citizen push notifications, and applicant consent verification are simulated in this frontend prototype. No actual applicant documents or private records are viewed by this action.
        </div>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.375rem',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
    fontSize: '0.8125rem',
  },
  modalLabel: {
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  modalValue: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
    textAlign: 'right',
  },
  recordsSection: {
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.sm,
    padding: '0.75rem',
    marginTop: '0.25rem',
  },
  recordsHeading: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: '0.5rem',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  recordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: '0.375rem 0.5rem',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderLight}`,
  },
  recordLabel: {
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  notesBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.borderLight}`,
    padding: '0.625rem 0.75rem',
    borderRadius: theme.radii.sm,
  },
  boundaryNotice: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: theme.radii.sm,
    padding: '0.625rem 0.875rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
    lineHeight: 1.4,
    marginTop: '0.25rem',
  },
  codeText: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceMuted,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: theme.colors.textPrimary,
  },
  codeTextHighlight: {
    fontFamily: theme.typography.fontMono,
    backgroundColor: theme.colors.surfaceAccent,
    color: theme.colors.primary,
    fontWeight: 700,
    padding: '0.125rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.8125rem',
  },
};
