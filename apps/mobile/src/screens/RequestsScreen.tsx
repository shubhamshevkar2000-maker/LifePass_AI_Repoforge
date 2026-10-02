/**
 * LifePass AI — Citizen Mobile Requests Screen
 *
 * SCOPE: Citizen Mobile Access Requests Management
 *
 * Implements the specification-defined states:
 * - Pending: User needs to review and respond with explicit consent.
 * - Active: Currently active granted access requests with authorized scope.
 * - Completed: Finished access workflows.
 * - Expired: Timed-out requests that can no longer be acted on.
 *
 * GOVERNANCE RULES:
 * - Clean light foundation matching the approved visual direction.
 * - No client-side authorization.
 * - No automatic consent or auto-sharing.
 * - Clear distinction between live data and development fixtures.
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
  fetchCitizenRequests,
} from '../services/requestService';

interface RequestsScreenProps {
  initialStatus?: RequestUiStatus;
  onSelectRequest: (requestId: string) => void;
  onBackToHome: () => void;
}

const TABS: { label: string; value: RequestUiStatus }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Expired', value: 'expired' },
];

export const RequestsScreen: React.FC<RequestsScreenProps> = ({
  initialStatus = 'pending',
  onSelectRequest,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<RequestUiStatus>(initialStatus);
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDevFixture, setIsDevFixture] = useState(false);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchCitizenRequests();
    if (result.error) {
      setErrorMessage(result.error.message || 'Unable to load requests.');
    } else if (result.data) {
      setRequests(result.data);
      setIsDevFixture(result.isDevFixture);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter((r) => r.status === activeTab);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const getStatusBadgeStyle = (status: RequestUiStatus) => {
    switch (status) {
      case 'pending':
        return {
          bg: colors.warningLight,
          border: colors.warningBorder,
          text: colors.warning,
          label: 'Pending Consent',
        };
      case 'active':
        return {
          bg: colors.accentGreenLight,
          border: colors.accentGreenBorder,
          text: colors.accentGreen,
          label: 'Active Access',
        };
      case 'completed':
        return {
          bg: colors.surfaceSubtle,
          border: colors.borderMedium,
          text: colors.textSecondary,
          label: 'Completed',
        };
      case 'expired':
        return {
          bg: colors.dangerLight,
          border: colors.dangerBorder,
          text: colors.danger,
          label: 'Expired',
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToHome}
            activeOpacity={0.7}
            accessibilityLabel="Back to Home"
          >
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Institution Requests</Text>
          <Text style={styles.subtitle}>
            Review and manage record verification requests submitted by institutions.
          </Text>
        </View>

        {/* Development Fixture Banner */}
        {isDevFixture && (
          <View style={styles.fixtureNoticeBanner}>
            <Text style={styles.fixtureNoticeIcon}>🧪</Text>
            <View style={styles.fixtureNoticeContent}>
              <Text style={styles.fixtureNoticeTitle}>Development Fixture Data</Text>
              <Text style={styles.fixtureNoticeDesc}>
                Showing mock requests for UI evaluation. Live server-side authorization will bind to public.access_requests.
              </Text>
            </View>
          </View>
        )}

        {/* Status Filter Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {tab.value === 'pending' && pendingCount > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{pendingCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content Area */}
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Loading access requests...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Failed to Load Requests</Text>
            <Text style={styles.errorDesc}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadRequests} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No {activeTab} requests</Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'pending'
                ? 'You have no pending requests requiring your consent decision.'
                : activeTab === 'active'
                ? 'No active data access grants are currently shared with institutions.'
                : activeTab === 'completed'
                ? 'Completed verification workflows will be archived here.'
                : 'No expired access requests.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredRequests.map((request) => {
              const badge = getStatusBadgeStyle(request.status);
              return (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() => onSelectRequest(request.id)}
                  activeOpacity={0.85}
                >
                  {/* Card Header: Institution & Status Badge */}
                  <View style={styles.cardHeader}>
                    <View style={styles.institutionWrap}>
                      <View style={styles.institutionIconWrap}>
                        <Text style={styles.institutionIcon}>🏛️</Text>
                      </View>
                      <View style={styles.institutionMeta}>
                        <Text style={styles.institutionName} numberOfLines={1}>
                          {request.institution_name}
                        </Text>
                        <Text style={styles.requestDate}>
                          Received {formatDate(request.created_at)}
                        </Text>
                      </View>
                    </View>

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

                  {/* Purpose Section */}
                  <View style={styles.purposeSection}>
                    <Text style={styles.purposeLabel}>PURPOSE</Text>
                    <Text style={styles.purposeTitle}>{request.purpose}</Text>
                  </View>

                  {/* Requirements & Expiry Meta */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>REQUIREMENTS</Text>
                      <Text style={styles.metaValue}>
                        {request.requested_requirements.length} requested
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>
                        {request.status === 'expired'
                          ? 'EXPIRED ON'
                          : request.status === 'completed'
                          ? 'COMPLETED ON'
                          : 'EXPIRES ON'}
                      </Text>
                      <Text style={styles.metaValue}>{formatDate(request.expires_at)}</Text>
                    </View>
                  </View>

                  {/* Action CTA */}
                  <View style={styles.cardFooter}>
                    {request.status === 'pending' ? (
                      <View style={styles.actionBtnPending}>
                        <Text style={styles.actionBtnPendingText}>Review & Grant Consent →</Text>
                      </View>
                    ) : (
                      <View style={styles.actionBtnSecondary}>
                        <Text style={styles.actionBtnSecondaryText}>View Request Details →</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Security & Trust Notice Footer */}
        <View style={styles.trustFooter}>
          <Text style={styles.trustFooterIcon}>🔒</Text>
          <Text style={styles.trustFooterText}>
            LifePass strictly enforces explicit citizen consent. No documents are ever shared
            without your explicit permission, and you can revoke active access at any time.
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
  header: {
    marginBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabBadge: {
    marginLeft: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  stateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorContainer: {
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
  errorDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  retryBtnText: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  listContainer: {
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  institutionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  institutionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  institutionIcon: {
    fontSize: 18,
  },
  institutionMeta: {
    flex: 1,
  },
  institutionName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  requestDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  purposeSection: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  purposeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  purposeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  metaItem: {
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
    marginTop: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
    marginTop: 2,
  },
  actionBtnPending: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionBtnPendingText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnSecondary: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  actionBtnSecondaryText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
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
