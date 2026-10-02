import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecordStatus, ExternalVerificationStatus } from '@lifepass/shared';

interface StatusBadgeProps {
  type: 'processing' | 'external_verification';
  status: RecordStatus | ExternalVerificationStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  if (type === 'processing') {
    const processingStatus = status as RecordStatus;
    let label = 'Uploaded';
    let containerStyle = styles.badgeUploaded;
    let textStyle = styles.textUploaded;

    switch (processingStatus) {
      case 'processing':
        label = 'Processing...';
        containerStyle = styles.badgeProcessing;
        textStyle = styles.textProcessing;
        break;
      case 'processed':
        // Honest label: OCR/AI parsing complete, NOT authenticated
        label = 'Processed (Parsed)';
        containerStyle = styles.badgeProcessed;
        textStyle = styles.textProcessed;
        break;
      case 'needs_review':
        label = 'Needs Review';
        containerStyle = styles.badgeReview;
        textStyle = styles.textReview;
        break;
      case 'expired':
        label = 'Expired';
        containerStyle = styles.badgeExpired;
        textStyle = styles.textExpired;
        break;
      case 'archived':
        label = 'Archived';
        containerStyle = styles.badgeArchived;
        textStyle = styles.textArchived;
        break;
      case 'uploaded':
      default:
        label = 'Uploaded';
        containerStyle = styles.badgeUploaded;
        textStyle = styles.textUploaded;
        break;
    }

    return (
      <View style={[styles.badgeBase, containerStyle]}>
        <Text style={[styles.textBase, textStyle]}>{label.toUpperCase()}</Text>
      </View>
    );
  }

  // External Verification Status Badge (Strictly separate from processing)
  const extStatus = status as ExternalVerificationStatus;
  let extLabel = 'Not Externally Verified';
  let extContainerStyle = styles.badgeNotVerified;
  let extTextStyle = styles.textNotVerified;

  switch (extStatus) {
    case 'source_verified':
      extLabel = 'Source Verified';
      extContainerStyle = styles.badgeSourceVerified;
      extTextStyle = styles.textSourceVerified;
      break;
    case 'source_rejected':
      extLabel = 'Source Rejected';
      extContainerStyle = styles.badgeSourceRejected;
      extTextStyle = styles.textSourceRejected;
      break;
    case 'verification_unavailable':
      extLabel = 'Verification Unavailable';
      extContainerStyle = styles.badgeUnavailable;
      extTextStyle = styles.textUnavailable;
      break;
    case 'not_verified':
    default:
      extLabel = 'Not Externally Verified';
      extContainerStyle = styles.badgeNotVerified;
      extTextStyle = styles.textNotVerified;
      break;
  }

  return (
    <View style={[styles.badgeBase, extContainerStyle]}>
      <Text style={[styles.textBase, extTextStyle]}>{extLabel.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  textBase: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Processing States
  badgeUploaded: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textUploaded: {
    color: '#475569',
  },
  badgeProcessing: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  textProcessing: {
    color: '#B45309',
  },
  badgeProcessed: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  textProcessed: {
    color: '#0369A1',
  },
  badgeReview: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
  },
  textReview: {
    color: '#C2410C',
  },
  badgeExpired: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  textExpired: {
    color: '#DC2626',
  },
  badgeArchived: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  textArchived: {
    color: '#64748B',
  },

  // External Verification States
  badgeNotVerified: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  textNotVerified: {
    color: '#64748B',
  },
  badgeSourceVerified: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  textSourceVerified: {
    color: '#15803D',
  },
  badgeSourceRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  textSourceRejected: {
    color: '#DC2626',
  },
  badgeUnavailable: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  textUnavailable: {
    color: '#94A3B8',
  },
});
