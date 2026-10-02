/**
 * LifePass AI — Dedicated Request Detail Screen
 *
 * SCOPE: Citizen Mobile Access Request Detail
 *
 * Displays full context for a single access request:
 * - Requesting Organization
 * - Purpose
 * - Requested Requirements checklist (with matched vault record / missing indicators)
 * - Selected records
 * - Expiry & creation timestamps
 * - Clear, explicit consent action/status
 *
 * GOVERNANCE RULES:
 * - Does NOT duplicate ConsentScreen logic. Connects to existing Review & Share / Consent flow.
 * - Prevents repeat consent actions if request is already Active, Completed, or Expired.
 * - Clean light foundation matching the approved visual direction.
 * - Server-side authorization remains outside the client.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import {
  CitizenRequest,
  RequestUiStatus,
  fetchCitizenRequestById,
} from '../services/requestService';

interface RequestDetailScreenProps {
  requestId: string;
  onReviewAndShare: (request: CitizenRequest) => void;
  onBackToRequests: () => void;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({
  requestId,
  onReviewAndShare,
  onBackToRequests,
}) => {
  const [request, setRequest] = useState<CitizenRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDevFixture, setIsDevFixture] = useState(false);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchCitizenRequestById(requestId);
    if (result.error) {
      setErrorMessage(result.error.message || 'Unable to load request details.');
    } else if (result.data) {
      setRequest(result.data);
      setIsDevFixture(result.isDevFixture);
    }
    setIsLoading(false);
  }, [requestId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const getStatusBadge = (status: RequestUiStatus) => {
    switch (status) {
      case 'pending':
        return {
          bg: colors.warningLight,
          border: colors.warningBorder,
          text: colors.warning,
          label: 'Pending Your Decision',
        };
      case 'active':
        return {
          bg: colors.accentGreenLight,
          border: colors.accentGreenBorder,
          text: colors.accentGreen,
          label: 'Active Access Granted',
        };
      case 'completed':
        return {
          bg: colors.surfaceSubtle,
          border: colors.borderMedium,
          text: colors.textSecondary,
          label: 'Workflow Completed',
        };
      case 'expired':
        return {
          bg: colors.dangerLight,
          border: colors.dangerBorder,
          text: colors.danger,
          label: 'Request Expired',
        };
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading request details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !request) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error Loading Request</Text>
          <Text style={styles.errorText}>
            {errorMessage || 'The requested access request could not be located.'}
          </Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.btnSecondary} onPress={onBackToRequests}>
              <Text style={styles.btnSecondaryText}>← Back to Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={loadDetail}>
              <Text style={styles.btnPrimaryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadge(request.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBackToRequests}
            activeOpacity={0.7}
            accessibilityLabel="Back to Requests"
          >
            <Text style={styles.backBtnText}>← All Requests</Text>
          </TouchableOpacity>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: badge.bg, borderColor: badge.border },
            ]}
          >
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Development Fixture Banner */}
        {isDevFixture && (
          <View style={styles.fixtureNoticeBanner}>
            <Text style={styles.fixtureNoticeIcon}>🧪</Text>
            <View style={styles.fixtureNoticeContent}>
              <Text style={styles.fixtureNoticeTitle}>Development Fixture Data</Text>
              <Text style={styles.fixtureNoticeDesc}>
                Mock request data for review UI. Real access control binds to PostgreSQL public.access_requests.
              </Text>
            </View>
          </View>
        )}

        {/* Institution & Purpose Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.institutionIconWrap}>
            <Text style={styles.institutionIcon}>🏛️</Text>
          </View>
          <Text style={styles.institutionName}>{request.institution_name}</Text>
          <Text style={styles.purposeText}>{request.purpose}</Text>
          <Text style={styles.profileBadge}>
            Profile: {request.requirement_profile_name}
          </Text>
        </View>

        {/* Request Metadata Grid */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>DATE RECEIVED</Text>
              <Text style={styles.metaValue}>{formatDate(request.created_at)}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>
                {request.status === 'expired'
                  ? 'EXPIRED AT'
                  : request.status === 'completed'
                  ? 'COMPLETED AT'
                  : 'VALID UNTIL'}
              </Text>
              <Text style={styles.metaValue}>{formatDate(request.expires_at)}</Text>
            </View>
          </View>

          {request.consented_at && (
            <View style={[styles.metaRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSubtle, paddingTop: 8 }]}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>CONSENT GRANTED AT</Text>
                <Text style={styles.metaValue}>{formatDate(request.consented_at)}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>SECURITY BOUNDARY</Text>
                <Text style={styles.metaValue}>RLS Policy Enforced</Text>
              </View>
            </View>
          )}
        </View>

        {/* Requested Requirements Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Requested Requirements</Text>
            <Text style={styles.sectionCount}>
              {request.requested_requirements.length} Items
            </Text>
          </View>
          <Text style={styles.sectionDesc}>
            The institution has requested the following documentation for this workflow:
          </Text>

          <View style={styles.requirementsList}>
            {request.requested_requirements.map((req, idx) => (
              <View key={req.id || idx} style={styles.requirementRow}>
                <View style={styles.reqNumber}>
                  <Text style={styles.reqNumberText}>{idx + 1}</Text>
                </View>
                <View style={styles.reqContent}>
                  <Text style={styles.reqName}>{req.name}</Text>
                  {req.matchedRecordTitle ? (
                    <View style={styles.matchedWrap}>
                      <Text style={styles.matchedIcon}>✓</Text>
                      <Text style={styles.matchedTitle} numberOfLines={1}>
                        {req.matchedRecordTitle}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.missingWrap}>
                      <Text style={styles.missingIcon}>⚠</Text>
                      <Text style={styles.missingTitle}>Not currently in vault</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Consented / Selected Records (If Active or Completed) */}
        {request.selected_records.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Consented Records</Text>
            <Text style={styles.sectionDesc}>
              These specific records are currently accessible to the authorized institution:
            </Text>
            {request.selected_records.map((rec) => (
              <View key={rec.id} style={styles.sharedRecordCard}>
                <Text style={styles.sharedRecordIcon}>📄</Text>
                <View style={styles.sharedRecordMeta}>
                  <Text style={styles.sharedRecordTitle}>{rec.title}</Text>
                  <Text style={styles.sharedRecordCategory}>
                    Category: {rec.category} • {rec.documentType}
                  </Text>
                </View>
                <View style={styles.sharedBadge}>
                  <Text style={styles.sharedBadgeText}>Shared</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action / Status Panel */}
        <View style={styles.actionCard}>
          {request.status === 'pending' ? (
            <>
              <View style={styles.actionCallout}>
                <Text style={styles.actionCalloutIcon}>ℹ️</Text>
                <Text style={styles.actionCalloutText}>
                  No documents have been shared. You can review which matched records to share,
                  unselect any items, and make an explicit consent decision.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => onReviewAndShare(request)}
                activeOpacity={0.85}
              >
                <Text style={styles.btnPrimaryText}>Review & Choose Records to Share →</Text>
              </TouchableOpacity>
            </>
          ) : request.status === 'active' ? (
            <View style={styles.activeNoticeBox}>
              <Text style={styles.activeNoticeTitle}>Access is Currently Active</Text>
              <Text style={styles.activeNoticeText}>
                The institution has read access to your selected records for the stated purpose.
                Access will automatically expire on {formatDate(request.expires_at)}.
              </Text>
              <View style={styles.revocationNotice}>
                <Text style={styles.revocationNoticeText}>
                  🛡️ You retain sovereign ownership. Consent can be revoked at any time per LifePass security policy.
                </Text>
              </View>
            </View>
          ) : request.status === 'completed' ? (
            <View style={styles.completedNoticeBox}>
              <Text style={styles.completedNoticeTitle}>Workflow Completed</Text>
              <Text style={styles.completedNoticeText}>
                This institutional verification process has concluded. Access is archived and
                logged in public.audit_events.
              </Text>
            </View>
          ) : (
            <View style={styles.expiredNoticeBox}>
              <Text style={styles.expiredNoticeTitle}>Request Expired</Text>
              <Text style={styles.expiredNoticeText}>
                This request timed out on {formatDate(request.expires_at)} and can no longer be
                acted upon. The requesting organization must dispatch a new access request if verification is still required.
              </Text>
            </View>
          )}
        </View>

        {/* Trust Notice */}
        <View style={styles.trustFooter}>
          <Text style={styles.trustFooterIcon}>🔒</Text>
          <Text style={styles.trustFooterText}>
            LifePass guarantees explicit user control. The client cannot grant access or modify
            database consent state directly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fixtureNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: spacing.md,
  },
  fixtureNoticeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fixtureNoticeContent: {
    flex: 1,
  },
  fixtureNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  fixtureNoticeDesc: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 14,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  institutionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  institutionIcon: {
    fontSize: 24,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  purposeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  profileBadge: {
    fontSize: 11,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 3,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  requirementsList: {
    gap: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  reqNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reqNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  reqContent: {
    flex: 1,
  },
  reqName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  matchedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  matchedIcon: {
    fontSize: 12,
    color: colors.accentGreen,
    marginRight: 4,
    fontWeight: '700',
  },
  matchedTitle: {
    fontSize: 11,
    color: colors.accentGreen,
    fontWeight: '500',
  },
  missingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  missingIcon: {
    fontSize: 11,
    color: colors.warning,
    marginRight: 4,
  },
  missingTitle: {
    fontSize: 11,
    color: colors.warning,
    fontWeight: '500',
  },
  sharedRecordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 10,
    marginTop: 6,
  },
  sharedRecordIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sharedRecordMeta: {
    flex: 1,
  },
  sharedRecordTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sharedRecordCategory: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sharedBadge: {
    backgroundColor: colors.accentGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  sharedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  actionCallout: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: 10,
    marginBottom: 14,
  },
  actionCalloutIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionCalloutText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 16,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  btnSecondaryText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  activeNoticeBox: {
    backgroundColor: colors.accentGreenLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accentGreenBorder,
    padding: 12,
  },
  activeNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  activeNoticeText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  revocationNotice: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.accentGreenBorder,
    paddingTop: 8,
  },
  revocationNoticeText: {
    fontSize: 11,
    color: '#065F46',
  },
  completedNoticeBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderMedium,
    padding: 12,
  },
  completedNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  completedNoticeText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  expiredNoticeBox: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    padding: 12,
  },
  expiredNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 4,
  },
  expiredNoticeText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  trustFooterIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  trustFooterText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
