/**
 * LifePass AI — Citizen Mobile Notifications Screen
 *
 * SCOPE: Citizen Mobile Notifications & Alerts
 *
 * Implements the notification types defined in docs/BACKEND_SPEC.md Section 11:
 * - New institution request
 * - Consent decision needed
 * - Consent approved / denied
 * - Request expiry
 * - Processing completed
 * - Important record status change
 *
 * GOVERNANCE RULES:
 * - Does NOT invent a notifications backend API.
 * - Uses typed client service with labelled development fixtures fallback.
 * - Clean light foundation matching the approved visual direction.
 * - Direct deep-linking to Request Detail when request_id is supplied.
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
  NotificationItem,
  NotificationType,
  fetchCitizenNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';

interface NotificationsScreenProps {
  onSelectRequest: (requestId: string) => void;
  onBackToHome: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onSelectRequest,
  onBackToHome,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDevFixture, setIsDevFixture] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchCitizenNotifications();
    if (result.error) {
      setErrorMessage(result.error.message || 'Unable to load notifications.');
    } else if (result.data) {
      setNotifications(result.data);
      setIsDevFixture(result.isDevFixture);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notifId: string) => {
    const result = await markNotificationAsRead(notifId);
    if (result.data) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read_at: result.data!.read_at } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.data) {
      setNotifications(result.data);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const filteredNotifications =
    activeFilter === 'unread'
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  const getTypeMeta = (type: NotificationType) => {
    switch (type) {
      case 'consent_decision_needed':
        return {
          icon: '⏳',
          badgeText: 'Action Required',
          badgeBg: colors.warningLight,
          badgeBorder: colors.warningBorder,
          badgeColor: colors.warning,
        };
      case 'new_institution_request':
        return {
          icon: '🏛️',
          badgeText: 'New Request',
          badgeBg: colors.primaryLight,
          badgeBorder: colors.primaryBorder,
          badgeColor: colors.primary,
        };
      case 'consent_approved':
        return {
          icon: '✓',
          badgeText: 'Consent Granted',
          badgeBg: colors.accentGreenLight,
          badgeBorder: colors.accentGreenBorder,
          badgeColor: colors.accentGreen,
        };
      case 'processing_completed':
        return {
          icon: '📄',
          badgeText: 'Vault Processed',
          badgeBg: colors.surfaceSubtle,
          badgeBorder: colors.borderMedium,
          badgeColor: colors.textSecondary,
        };
      case 'record_status_change':
        return {
          icon: '🔄',
          badgeText: 'Status Update',
          badgeBg: colors.surfaceSubtle,
          badgeBorder: colors.borderMedium,
          badgeColor: colors.textSecondary,
        };
      case 'request_expired':
        return {
          icon: '⌛',
          badgeText: 'Expired',
          badgeBg: colors.dangerLight,
          badgeBorder: colors.dangerBorder,
          badgeColor: colors.danger,
        };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const now = Date.now();
      const past = new Date(isoString).getTime();
      const diffMs = now - past;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
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
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>
                Security alerts, consent decisions, and document lifecycle events.
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllBtn}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <Text style={styles.markAllBtnText}>Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Development Fixture Banner */}
        {isDevFixture && (
          <View style={styles.fixtureNoticeBanner}>
            <Text style={styles.fixtureNoticeIcon}>🧪</Text>
            <View style={styles.fixtureNoticeContent}>
              <Text style={styles.fixtureNoticeTitle}>Development Fixture Data</Text>
              <Text style={styles.fixtureNoticeDesc}>
                Demonstrating product notifications. Real event delivery binds to PostgreSQL public.notifications.
              </Text>
            </View>
          </View>
        )}

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'unread' && styles.filterPillActive]}
            onPress={() => setActiveFilter('unread')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'unread' && styles.filterPillTextActive,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Unable to Load Notifications</Text>
            <Text style={styles.errorDesc}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadNotifications} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>
              {activeFilter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
            </Text>
            <Text style={styles.emptyDesc}>
              {activeFilter === 'unread'
                ? 'You have responded to all pending alerts and consent decisions.'
                : 'New verification requests and record status updates will appear here.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredNotifications.map((notif) => {
              const meta = getTypeMeta(notif.type);
              const isUnread = !notif.read_at;

              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notificationCard, isUnread && styles.notificationCardUnread]}
                  onPress={() => {
                    if (isUnread) {
                      handleMarkAsRead(notif.id);
                    }
                    if (notif.data?.request_id) {
                      onSelectRequest(notif.data.request_id);
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.typeBadgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: meta.badgeBg,
                            borderColor: meta.badgeBorder,
                          },
                        ]}
                      >
                        <Text style={styles.typeIcon}>{meta.icon}</Text>
                        <Text style={[styles.typeBadgeText, { color: meta.badgeColor }]}>
                          {meta.badgeText}
                        </Text>
                      </View>
                      {isUnread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.timeText}>{formatRelativeTime(notif.created_at)}</Text>
                  </View>

                  <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>
                    {notif.title}
                  </Text>
                  <Text style={styles.notifBody}>{notif.body}</Text>

                  {/* Action Link for Requests */}
                  {notif.data?.request_id && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionLinkBtn}
                        onPress={() => {
                          if (isUnread) {
                            handleMarkAsRead(notif.id);
                          }
                          onSelectRequest(notif.data!.request_id!);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionLinkText}>View Request Details →</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Security Notice */}
        <View style={styles.trustFooter}>
          <Text style={styles.trustFooterIcon}>🛡️</Text>
          <Text style={styles.trustFooterText}>
            Notifications alert you to access requests and document state changes. LifePass never
            acts on institutional requests without your affirmative consent.
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    maxWidth: 260,
    lineHeight: 18,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignSelf: 'center',
  },
  markAllBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
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
    gap: spacing.sm,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  notificationCardUnread: {
    borderColor: colors.primaryBorder,
    backgroundColor: '#F0F9FF',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  typeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  notifBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    alignItems: 'flex-start',
  },
  actionLinkBtn: {
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
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
