import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RecordCategory } from '@lifepass/shared';
import { colors, radius, spacing } from '../theme/theme';
import { LifePassBrand } from '../components/LifePassBrand';

interface HomeScreenProps {
  onNavigateToRecords: (category?: RecordCategory) => void;
  onNavigateToUpload: () => void;
  onNavigateToProfile: () => void;
  onNavigateToAiTask: (initialGoal?: string) => void;
  onNavigateToReviewShare?: () => void;
  onNavigateToRequirementProfile?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToRequests?: () => void;
  onNavigateToRequestDetail?: (requestId: string) => void;
}

const CATEGORY_SHORTCUTS: {
  label: string;
  value: RecordCategory;
  icon: string;
  tint: string;
  bg: string;
}[] = [
  { label: 'Education', value: 'education', icon: '🎓', tint: '#0284C7', bg: '#E0F2FE' },
  { label: 'Employment', value: 'employment', icon: '💼', tint: '#475569', bg: '#F1F5F9' },
  { label: 'Finance', value: 'finance', icon: '📊', tint: '#059669', bg: '#DCFCE7' },
  { label: 'Healthcare', value: 'healthcare', icon: '❤️', tint: '#E11D48', bg: '#FFE4E6' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToRecords,
  onNavigateToUpload,
  onNavigateToProfile,
  onNavigateToAiTask,
  onNavigateToReviewShare,
  onNavigateToRequirementProfile,
  onNavigateToNotifications,
  onNavigateToRequests,
  onNavigateToRequestDetail,
}) => {
  const { user, profile } = useAuth();
  const [goalInput, setGoalInput] = useState('I want to apply for an education loan');
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);

  const citizenFirstName = profile?.full_name?.split(' ')[0] || 'Ananya';

  const handleGoalSubmit = () => {
    onNavigateToAiTask(goalInput.trim() || undefined);
  };

  const handleNotificationPress = () => {
    if (onNavigateToNotifications) {
      onNavigateToNotifications();
    } else {
      setShowNotificationAlert(!showNotificationAlert);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Header: Brand + Notifications + Profile */}
        <View style={styles.topHeader}>
          <LifePassBrand size="md" />

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleNotificationPress}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Text style={styles.iconBtnText}>🔔</Text>
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={onNavigateToProfile}
              activeOpacity={0.7}
              accessibilityLabel="Profile"
            >
              <Text style={styles.avatarInitial}>
                {citizenFirstName.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification Modal / Banner Toast */}
        {showNotificationAlert && (
          <View style={styles.notificationBanner}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Access Requests & Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotificationAlert(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.notificationBody}>
              Demo Financial Institution (Demo Fixture) has requested access to verify your Education Loan documents.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              {onNavigateToRequestDetail ? (
                <TouchableOpacity
                  style={styles.notificationActionBtn}
                  onPress={() => {
                    setShowNotificationAlert(false);
                    onNavigateToRequestDetail('req-edu-001');
                  }}
                >
                  <Text style={styles.notificationActionText}>Review Request →</Text>
                </TouchableOpacity>
              ) : onNavigateToReviewShare ? (
                <TouchableOpacity
                  style={styles.notificationActionBtn}
                  onPress={() => {
                    setShowNotificationAlert(false);
                    onNavigateToReviewShare();
                  }}
                >
                  <Text style={styles.notificationActionText}>Review Request →</Text>
                </TouchableOpacity>
              ) : null}
              {onNavigateToNotifications && (
                <TouchableOpacity
                  style={[styles.notificationActionBtn, { backgroundColor: '#F1F5F9' }]}
                  onPress={() => {
                    setShowNotificationAlert(false);
                    onNavigateToNotifications();
                  }}
                >
                  <Text style={[styles.notificationActionText, { color: '#475569' }]}>
                    All Notifications
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Greeting & Subtitle */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Hello, {citizenFirstName} 👋</Text>
          <Text style={styles.greetingSubtitle}>
            Your verified records, for every next step.
          </Text>
        </View>

        {/* Current Requests Section (docs/FRONTEND_SPEC.md Section 3) */}
        <View style={styles.currentRequestBanner}>
          <View style={styles.currentRequestHeader}>
            <View style={styles.currentRequestTag}>
              <Text style={styles.currentRequestTagText}>ACTION REQUIRED</Text>
            </View>
            {onNavigateToRequests && (
              <TouchableOpacity onPress={onNavigateToRequests} activeOpacity={0.7}>
                <Text style={styles.viewAllRequestsText}>All Requests →</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.currentRequestTitle}>
            Demo Financial Institution (Demo Fixture)
          </Text>
          <Text style={styles.currentRequestDesc}>
            Requested access to Higher Education Loan documentation.
          </Text>
          <View style={styles.currentRequestActionRow}>
            <TouchableOpacity
              style={styles.reviewRequestBtn}
              onPress={() => {
                if (onNavigateToRequestDetail) {
                  onNavigateToRequestDetail('req-edu-001');
                } else if (onNavigateToReviewShare) {
                  onNavigateToReviewShare();
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.reviewRequestBtnText}>Review & Grant Consent →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Category Shortcuts */}
        <View style={styles.categoryRow}>
          {CATEGORY_SHORTCUTS.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={styles.categoryCard}
              onPress={() => onNavigateToRecords(cat.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.bg }]}>
                <Text style={styles.categoryIconText}>{cat.icon}</Text>
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* "What are you trying to do?" Primary Action Card */}
        <View style={styles.goalCard}>
          <Text style={styles.goalCardTitle}>What are you trying to do?</Text>
          <View style={styles.goalInputRow}>
            <TextInput
              style={styles.goalTextInput}
              value={goalInput}
              onChangeText={setGoalInput}
              placeholder="e.g. apply for an education loan"
              placeholderTextColor={colors.textMuted}
              returnKeyType="go"
              onSubmitEditing={handleGoalSubmit}
            />
            <TouchableOpacity
              style={styles.goalSubmitBtn}
              onPress={handleGoalSubmit}
              activeOpacity={0.8}
              accessibilityLabel="Explore Requirements"
            >
              <Text style={styles.goalSubmitArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LifePass AI Intelligence / Result Area */}
        <View style={styles.intelligenceCard}>
          <View style={styles.aiTagBadge}>
            <Text style={styles.aiTagSparkle}>✨</Text>
            <Text style={styles.aiTagText}>LifePass AI</Text>
          </View>
          <Text style={styles.intelligenceSubhead}>
            Here's what you need for an Education Loan based on current requirements.
          </Text>

          {/* Nested Readiness & Checklist Card */}
          <View style={styles.readinessCard}>
            {/* Header */}
            <View style={styles.readinessTopRow}>
              <View style={styles.profileTitleRow}>
                <Text style={styles.bankIcon}>🏛️</Text>
                <View>
                  <Text style={styles.profileNameText}>Education Loan</Text>
                  <Text style={styles.reqFoundText}>4 of 5 requirements found</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (onNavigateToRequirementProfile) {
                    onNavigateToRequirementProfile();
                  } else {
                    onNavigateToAiTask();
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewDetailsText}>View Details →</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Bar & Readiness Indicator */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: '80%' }]} />
              </View>
              <Text style={styles.readinessScoreText}>80% Ready</Text>
            </View>

            {/* Checklist Items */}
            <View style={styles.checklistContainer}>
              <View style={styles.checklistItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.checkCircleGreen}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                  <Text style={styles.requirementName}>Identity Proof (Aadhaar)</Text>
                </View>
                <View style={styles.badgeVerified}>
                  <Text style={styles.badgeVerifiedText}>Verified</Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.checkCircleGreen}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                  <Text style={styles.requirementName}>Address Proof</Text>
                </View>
                <View style={styles.badgeVerified}>
                  <Text style={styles.badgeVerifiedText}>Verified</Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.checkCircleGreen}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                  <Text style={styles.requirementName}>Academic Certificate (12th / Degree)</Text>
                </View>
                <View style={styles.badgeVerified}>
                  <Text style={styles.badgeVerifiedText}>Verified</Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.checkCircleGreen}>
                    <Text style={styles.checkMarkText}>✓</Text>
                  </View>
                  <Text style={styles.requirementName}>Income Proof (Self/Parent/Guardian)</Text>
                </View>
                <View style={styles.badgeVerified}>
                  <Text style={styles.badgeVerifiedText}>Verified</Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.crossCircleRed}>
                    <Text style={styles.crossMarkText}>✕</Text>
                  </View>
                  <Text style={styles.requirementNameMissing}>Admission Letter</Text>
                </View>
                <View style={styles.badgeMissing}>
                  <Text style={styles.badgeMissingText}>Missing</Text>
                </View>
              </View>
            </View>

            {/* Next Action Callout Banner */}
            <View style={styles.nextActionBanner}>
              <Text style={styles.actionBannerIcon}>📄</Text>
              <View style={styles.actionBannerContent}>
                <Text style={styles.actionBannerTitle}>You're almost ready!</Text>
                <Text style={styles.actionBannerDesc}>
                  Upload your admission letter to complete your application.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addRecordSmallBtn}
                onPress={onNavigateToUpload}
                activeOpacity={0.7}
              >
                <Text style={styles.addRecordSmallBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button: Review & Share */}
          <TouchableOpacity
            style={styles.primaryShareBtn}
            onPress={() => {
              if (onNavigateToReviewShare) {
                onNavigateToReviewShare();
              } else {
                onNavigateToAiTask();
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryShareBtnText}>Review & Share with Institution →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Vault Shortcut Bar */}
        <View style={styles.vaultCard}>
          <View style={styles.vaultHeader}>
            <Text style={styles.vaultTitle}>Personal Record Vault</Text>
            <Text style={styles.vaultSubtitle}>
              Private encrypted storage protected by Row Level Security.
            </Text>
          </View>

          <View style={styles.vaultActionRow}>
            <TouchableOpacity
              style={styles.vaultSecondaryBtn}
              onPress={() => onNavigateToRecords()}
              activeOpacity={0.7}
            >
              <Text style={styles.vaultSecondaryBtnText}>View My Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.vaultPrimaryBtn}
              onPress={onNavigateToUpload}
              activeOpacity={0.7}
            >
              <Text style={styles.vaultPrimaryBtnText}>+ Add Record</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security / Privacy Trust Boundary */}
        <View style={styles.trustFooter}>
          <Text style={styles.trustText}>
            🔒 Records are kept strictly private in your vault. They are only shared when you give explicit, purpose-bound consent.
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
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnText: {
    fontSize: 16,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  notificationBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  notificationBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  notificationActionBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  notificationActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  greetingSection: {
    marginBottom: spacing.md,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconText: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  goalCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  goalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  goalTextInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  goalSubmitBtn: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  goalSubmitArrow: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  intelligenceCard: {
    backgroundColor: '#F0F9FF', // Subtle light cyan tint matching reference
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  aiTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginBottom: 6,
  },
  aiTagSparkle: {
    fontSize: 12,
    marginRight: 4,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  intelligenceSubhead: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  readinessCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  readinessTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  profileNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  reqFoundText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accentGreen,
    borderRadius: 4,
  },
  readinessScoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  checklistContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 10,
    gap: 10,
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkCircleGreen: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkMarkText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentGreen,
  },
  crossCircleRed: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  crossMarkText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.danger,
  },
  requirementName: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  requirementNameMissing: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  badgeVerified: {
    backgroundColor: colors.accentGreenLight,
    borderColor: colors.accentGreenBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentGreen,
  },
  badgeMissing: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeMissingText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
  },
  nextActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 10,
    marginTop: 4,
  },
  actionBannerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionBannerContent: {
    flex: 1,
  },
  actionBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionBannerDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  addRecordSmallBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginLeft: 8,
  },
  addRecordSmallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  primaryShareBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryShareBtnText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  vaultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  vaultHeader: {
    marginBottom: 12,
  },
  vaultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vaultSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vaultActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  vaultSecondaryBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  vaultSecondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  vaultPrimaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  vaultPrimaryBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  trustFooter: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  trustText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  currentRequestBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  currentRequestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentRequestTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  currentRequestTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  viewAllRequestsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  currentRequestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  currentRequestDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  currentRequestActionRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
  },
  reviewRequestBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  reviewRequestBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
});
