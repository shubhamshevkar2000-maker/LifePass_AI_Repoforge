import React from 'react';
import { InstitutionRequest, getStatusBadgeConfig } from '../../services/institutionDemoData';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { InstitutionRequestStatusSummary } from './InstitutionRequestStatusSummary';
import { InstitutionRequestChecklist } from './InstitutionRequestChecklist';
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
      title={`Application Details: ${request.id}`}
      description={`Inspect verification parameters, current workflow status, and requirement checklist for ${request.applicantName}.`}
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close Overview
        </Button>
      }
    >
      <div style={styles.modalContent}>
        {/* 1. Application Workflow Summary Card */}
        <InstitutionRequestStatusSummary request={request} />

        {/* 2. Key Metadata Rows */}
        <div style={styles.detailsCard}>
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
            <span style={styles.modalLabel}>Citizen Target Inbox</span>
            <code style={styles.codeText}>{request.applicantIdentifier}</code>
          </div>

          <div style={styles.modalRow}>
            <span style={styles.modalLabel}>Requirement Profile</span>
            <span style={styles.modalValue}>{request.requirementProfile}</span>
          </div>

          <div style={styles.modalRow}>
            <span style={styles.modalLabel}>Dispatched / Updated</span>
            <span style={styles.modalValue}>{request.updatedAt}</span>
          </div>

          <div style={styles.modalRow}>
            <span style={styles.modalLabel}>Access Window</span>
            <span style={styles.modalValue}>
              {request.accessDurationHours}h (Expires {request.requestedExpiryLabel})
            </span>
          </div>
        </div>

        {/* 3. Requirement Checklist with Metadata Inspection */}
        <InstitutionRequestChecklist request={request} />

        {/* 4. Workflow Notes if any */}
        {request.notes && (
          <div style={styles.notesBox}>
            <strong style={{ color: theme.colors.textPrimary, fontSize: '0.8125rem' }}>Workflow Notes:</strong>
            <p style={{ margin: '0.25rem 0 0 0', color: theme.colors.textSecondary, fontSize: '0.75rem', lineHeight: 1.4 }}>
              {request.notes}
            </p>
          </div>
        )}

        {/* 5. Trust & Prototype Notice */}
        <div style={styles.boundaryNotice}>
          <span style={{ fontSize: '1rem' }}>🛡️</span>
          <div>
            <strong>Phase W-4 Scope Notice:</strong> This view inspects simulated request metadata and requirement checklist states only. Real applicant consent, encrypted document decryption, and backend storage are not active in this frontend phase.
          </div>
        </div>
      </div>
    </Modal>
  );
};

const styles: Record<string, React.CSSProperties> = {
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii.sm,
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.25rem',
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
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
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
