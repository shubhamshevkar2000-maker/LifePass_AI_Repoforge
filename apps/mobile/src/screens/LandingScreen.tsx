import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { LifePassBrand } from '../components/LifePassBrand';

interface LandingScreenProps {
  onTryDemo: () => void;
  onLogin: () => void;
  onSignUp: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onTryDemo,
  onLogin,
  onSignUp,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Branding Section */}
        <View style={styles.brandHeader}>
          <LifePassBrand size="lg" />
          <View style={styles.networkBadge}>
            <Text style={styles.networkBadgeText}>CITIZEN IDENTITY LAYER</Text>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Your documents. Your decisions.</Text>
          <Text style={styles.subtitle}>
            One secure identity layer.
          </Text>

          <Text style={styles.description}>
            LifePass AI organizes your verified life-stage documents, analyzes institutional
            requirements, and gives you complete control over what you share.
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✨</Text>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle}>AI Requirement Discovery</Text>
                <Text style={styles.featureDesc}>
                  Ask what you need for education loans, admissions, and more.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle}>Private Document Vault</Text>
                <Text style={styles.featureDesc}>
                  Your records remain private until you explicitly consent.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤝</Text>
              <View style={styles.featureTextCol}>
                <Text style={styles.featureTitle}>Consented Verification</Text>
                <Text style={styles.featureDesc}>
                  Share only the required documents with institutions.
                </Text>
              </View>
            </View>
          </View>

          {/* Primary Action: Try Demo */}
          <TouchableOpacity
            style={styles.primaryDemoBtn}
            onPress={onTryDemo}
            activeOpacity={0.85}
            accessibilityLabel="Try Demo"
          >
            <Text style={styles.primaryDemoBtnText}>Try Demo →</Text>
            <Text style={styles.primaryDemoSubtext}>
              Instant access • No OTP required • Preloaded demo records
            </Text>
          </TouchableOpacity>

          {/* Secondary Options: Login & Sign Up */}
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onLogin}
              activeOpacity={0.7}
              accessibilityLabel="Login with Phone"
            >
              <Text style={styles.secondaryBtnText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onSignUp}
              activeOpacity={0.7}
              accessibilityLabel="Sign Up"
            >
              <Text style={styles.secondaryBtnText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Demo Mode Notice */}
          <View style={styles.demoNoticeBox}>
            <View style={styles.demoNoticeTag}>
              <Text style={styles.demoNoticeTagText}>DEMO MODE</Text>
            </View>
            <Text style={styles.demoNoticeText}>
              Synthetic demo data — no real credentials or personal documents are accessed.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            LifePass AI • Unified Life-Stage Digital Identity & Record Network
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.md,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  networkBadge: {
    marginTop: 8,
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  networkBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  featureList: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 12,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  primaryDemoBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryDemoBtnText: {
    color: colors.textInverse,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  primaryDemoSubtext: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.borderMedium,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  demoNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 10,
    alignItems: 'center',
  },
  demoNoticeTag: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: 4,
  },
  demoNoticeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  demoNoticeText: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 15,
  },
  footer: {
    marginTop: spacing.lg,
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
