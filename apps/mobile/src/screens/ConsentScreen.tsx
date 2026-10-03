/**
 * LifePass AI — Dedicated Consent Screen
 *
 * SCOPE: Citizen Mobile Consent UX
 *
 * Implements the explicit, unpressured consent decision workflow:
 * - WHO: Requesting Organization
 * - WHY: Purpose of request
 * - WHAT: Exact records selected for sharing
 * - DURATION: Expiry timestamp
 * - AFTER APPROVAL: Plain language explanation of access scope and revocation
 * - ACTIONS: [ Allow ] and [ Deny ]
 * - Calm Success / Denied states
 * - Expired / Error / Loading handling
 *
 * GOVERNANCE RULES:
 * - No hidden consent. No pre-selected irreversible approval.
 * - No pressure language.
 * - Never say "Verified by LifePass".
 * - Calls POST /requests/{id}/consent with { decision: 'grant' | 'deny', selected_record_ids }.
 * - Client NEVER updates database consent state directly.
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
import {
  MatchedRequirementItem,
  AccessRequestContext,
  ApiError,
} from '@lifepass/shared';
import {
  fetchAccessRequest,
  submitConsent,
  ConsentUiResult,
} from '../services/consentService';
import { useAuth } from '../context/AuthContext';

interface ConsentScreenProps {
  requestId?: string;
  selectedRecordIds: string[];
  matchedRecords: MatchedRequirementItem[];
  purposeTitle: string;
  onConsentCompleted: (result: ConsentUiResult) => void;
  onBackToReview: () => void;
  onReturnToHome: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  requestId = 'req-access-001',
  selectedRecordIds,
  matchedRecords,
  purposeTitle,
  onConsentCompleted,
  onBackToReview,
  onReturnToHome,
}) => {
  const { isDemoMode } = useAuth();
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [requestContext, setRequestContext] = useState<AccessRequestContext | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [consentResult, setConsentResult] = useState<ConsentUiResult | null>(null);
  const [isFixtureUsed, setIsFixtureUsed] = useState(false);

  // Filter matched records that user actually selected
  const selectedRecords = matchedRecords.filter(
    (r) => r.record_id && selectedRecordIds.includes(r.record_id)
  );

  const loadContext = useCallback(async () => {
    setIsLoadingContext(true);
    setError(null);

    const result = await fetchAccessRequest(requestId, isDemoMode);
    setIsLoadingContext(false);
    setIsFixtureUsed(result.isDevFixture);

    if (result.error || !result.data) {
      setError(
        result.error || {
          code: 'PROCESSING_FAILED',
          message: 'Unable to retrieve access request information.',
        }
      );
      return;
    }

    setRequestContext(result.data);
  }, [requestId, isDemoMode]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const handleDecision = async (decision: 'grant' | 'deny') => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      decision,
      selected_record_ids: decision === 'grant' ? selectedRecordIds : [],
    };

    const result = await submitConsent(requestId, payload, isDemoMode);
    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(
        result.error || {
          code: 'PROCESSING_FAILED',
          message: `Failed to submit consent ${decision} decision.`,
        }
      );
      return;
    }

    setConsentResult(result.data);
    onConsentCompleted(result.data);
  };

  const formatExpiryDate = (isoString?: string): string => {
    if (!isoString) return 'Standard review duration (30 days)';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // 1. Loading Context State
  if (isLoadingContext) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingTitle}>Loading Access Request Details...</Text>
          <Text style={styles.loadingSubtitle}>
            Verifying request authorization and consent parameters.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Granted Success State (Calm & Professional)
  if (consentResult && consentResult.status === 'granted') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.resultCardSuccess}>
            <View style={styles.resultBadgeSuccess}>
              <Text style={styles.resultBadgeTextSuccess}>CONSENT GRANTED</Text>
            </View>
            <Text style={styles.resultTitle}>Your records were shared for this request.</Text>
            <Text style={styles.resultDescription}>
              The selected documents have been packaged and authorized for{' '}
              <Text style={styles.boldText}>{consentResult.institution_name}</Text>.
            </Text>

            <View style={styles.resultMetaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ORGANIZATION</Text>
                <Text style={styles.metaValue}>{consentResult.institution_name}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PURPOSE</Text>
                <Text style={styles.metaValue}>{consentResult.purpose}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>RECORDS SHARED</Text>
                <Text style={styles.metaValue}>
                  {consentResult.selected_record_ids.length} documents
                </Text>
              </View>
              {consentResult.expires_at ? (
                <View style={[styles.metaRow, styles.metaRowLast]}>
                  <Text style={styles.metaLabel}>ACCESS EXPIRES</Text>
                  <Text style={styles.metaValue}>
                    {formatExpiryDate(consentResult.expires_at)}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.reminderBox}>
              <Text style={styles.reminderTitle}>Revocation Rights</Text>
              <Text style={styles.reminderText}>
                You retain complete ownership. You may revoke access to these records at any time
                from your security settings.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onReturnToHome}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. Denied Result State (Calm & Clear)
  if (consentResult && consentResult.status === 'denied') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.resultCardDenied}>
            <View style={styles.resultBadgeDenied}>
              <Text style={styles.resultBadgeTextDenied}>REQUEST DENIED</Text>
            </View>
            <Text style={styles.resultTitle}>Your records were not shared.</Text>
            <Text style={styles.resultDescription}>
              You have declined to share records with{' '}
              <Text style={styles.boldText}>{consentResult.institution_name}</Text> for this
              request.
            </Text>

            <View style={styles.resultMetaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>ORGANIZATION</Text>
                <Text style={styles.metaValue}>{consentResult.institution_name}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PURPOSE</Text>
                <Text style={styles.metaValue}>{consentResult.purpose}</Text>
              </View>
              <View style={[styles.metaRow, styles.metaRowLast]}>
                <Text style={styles.metaLabel}>STATUS</Text>
                <Text style={styles.deniedValueText}>Denied • Zero Documents Shared</Text>
              </View>
            </View>

            <View style={styles.deniedSecurityBox}>
              <Text style={styles.deniedSecurityTitle}>Data Protection Guarantee</Text>
              <Text style={styles.deniedSecurityText}>
                No documents, metadata, or identity information were made accessible to the
                requesting organization. Your personal vault remains private.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onReturnToHome}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isExpired = requestContext?.status === 'expired';
  const orgName = requestContext?.institution_name || 'Demo Bank';
  const purpose = requestContext?.purpose || purposeTitle;
  const expiryDateString = formatExpiryDate(requestContext?.expires_at);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackToReview}
            style={styles.backButton}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Review</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>STEP 2: EXPLICIT CONSENT</Text>
          </View>
        </View>

        {/* Development Fixture Notice */}
        {!isDemoMode && isFixtureUsed && (
          <View style={styles.fixtureNotice}>
            <Text style={styles.fixtureNoticeText}>
              OFFLINE MODE: Displaying local simulated authorization for UI verification.
            </Text>
          </View>
        )}

        {/* Screen Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Share Your Records</Text>
          <Text style={styles.subtitle}>
            Review the exact terms below. Your explicit authorization is required before any
            record is made accessible.
          </Text>
        </View>

        {/* Expired Request Warning */}
        {isExpired && (
          <View style={styles.expiredCard}>
            <Text style={styles.expiredTitle}>Access Request Expired</Text>
            <Text style={styles.expiredText}>
              This request from {orgName} has expired. Records cannot be shared for an expired
              request.
            </Text>
          </View>
        )}

        {/* Error Banner */}
        {error && (
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Text style={styles.errorCodeBadge}>{error.code}</Text>
              <Text style={styles.errorTitle}>Submission Error</Text>
            </View>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
        )}

        {/* Structured Consent Card (WHO, WHY, WHAT, DURATION, AFTER APPROVAL) */}
        <View style={styles.consentCard}>
          {/* WHO */}
          <View style={styles.specSection}>
            <Text style={styles.specTag}>WHO IS REQUESTING</Text>
            <Text style={styles.specValueMain}>{orgName}</Text>
            <Text style={styles.specSub}>Authorized Educational / Lending Institution</Text>
          </View>

          {/* WHY */}
          <View style={styles.specSection}>
            <Text style={styles.specTag}>PURPOSE OF THE REQUEST</Text>
            <Text style={styles.specValueMain}>{purpose}</Text>
            <Text style={styles.specSub}>
              Records will be used solely for evaluating this specific application.
            </Text>
          </View>

          {/* WHAT */}
          <View style={styles.specSection}>
            <Text style={styles.specTag}>
              WHAT WILL BE SHARED ({selectedRecords.length} RECORDS)
            </Text>
            <View style={styles.selectedRecordList}>
              {selectedRecords.map((item, index) => (
                <View key={item.requirement_id || index} style={styles.recordItemRow}>
                  <Text style={styles.recordCheck}>✓</Text>
                  <View style={styles.recordTextCol}>
                    <Text style={styles.recordItemName}>{item.requirement_name}</Text>
                    <Text style={styles.recordItemTitle}>
                      {item.record_title || 'Document from vault'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* DURATION */}
          <View style={styles.specSection}>
            <Text style={styles.specTag}>ACCESS DURATION</Text>
            <Text style={styles.specValueMain}>Access until {expiryDateString}</Text>
            <Text style={styles.specSub}>
              Access automatically terminates upon expiration or citizen revocation.
            </Text>
          </View>

          {/* AFTER APPROVAL */}
          <View style={[styles.specSection, styles.specSectionLast]}>
            <Text style={styles.specTag}>AFTER APPROVAL</Text>
            <Text style={styles.afterApprovalText}>
              Only the {selectedRecords.length} selected records will be available to {orgName} for
              this request. No unselected documents or raw credentials will ever be accessible.
            </Text>
          </View>
        </View>

        {/* Action Controls: ALLOW and DENY */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.allowBtn,
              (isSubmitting || isExpired || selectedRecords.length === 0) &&
                styles.allowBtnDisabled,
            ]}
            onPress={() => handleDecision('grant')}
            disabled={isSubmitting || isExpired || selectedRecords.length === 0}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#090D16" />
                <Text style={styles.allowBtnText}>Authorizing...</Text>
              </View>
            ) : (
              <Text style={styles.allowBtnText}>
                Allow ({selectedRecords.length} Records)
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.denyBtn, isSubmitting && styles.denyBtnDisabled]}
            onPress={() => handleDecision('deny')}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.denyBtnText}>Deny</Text>
          </TouchableOpacity>
        </View>

        {/* Security & No Hidden Consent Note */}
        <View style={styles.governanceNotice}>
          <Text style={styles.governanceTitle}>Explicit Consent Guarantee</Text>
          <Text style={styles.governanceText}>
            LifePass never shares data automatically. Denying this request prevents any record
            transfer. You maintain complete control over all identity and life-stage documents.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingTitle: {
    marginTop: 16,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingSubtitle: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  headerTag: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  headerTagText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fixtureNotice: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  fixtureNoticeText: {
    color: '#92400E',
    fontSize: 11,
    lineHeight: 16,
  },
  titleSection: {
    marginBottom: 18,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  expiredCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
  },
  expiredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  expiredText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  errorCodeBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorMessage: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
  consentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
  },
  specSection: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  specSectionLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  specTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValueMain: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  specSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  selectedRecordList: {
    gap: 8,
    marginTop: 6,
  },
  recordItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    padding: 10,
    gap: 8,
  },
  recordCheck: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  recordTextCol: {
    flex: 1,
  },
  recordItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  recordItemTitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  afterApprovalText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  actionSection: {
    gap: 12,
    marginBottom: 24,
  },
  allowBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  allowBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  denyBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DC2626',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  denyBtnDisabled: {
    opacity: 0.5,
  },
  denyBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  governanceNotice: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  governanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  governanceText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  resultCardSuccess: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 22,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resultBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  resultBadgeTextSuccess: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 18,
  },
  boldText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  resultMetaBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metaRowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  reminderBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 22,
  },
  reminderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 3,
  },
  reminderText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultCardDenied: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 22,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resultBadgeDenied: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  resultBadgeTextDenied: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  deniedValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  deniedSecurityBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 22,
  },
  deniedSecurityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 3,
  },
  deniedSecurityText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 16,
  },
});
