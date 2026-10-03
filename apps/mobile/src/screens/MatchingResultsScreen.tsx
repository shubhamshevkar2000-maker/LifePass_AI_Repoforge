/**
 * LifePass AI — Matching & Readiness Results Screen
 *
 * SCOPE: Matching & Readiness Results UI Only
 *
 * Implements the citizen-facing evaluation results:
 * - Application Readiness Header (readiness_percent, count summary)
 * - Deterministic Explanation Area
 * - Matched Records Section (requirement name, record title, processing & verification badges)
 * - Missing Records Section (requirement name, reason, "+ Add Record" CTA connecting to Upload)
 * - Attention Needed Section (when supplied)
 *
 * GOVERNANCE RULES:
 * - NEVER calculate readiness_percent or counts locally. Values must come from backend evaluation data.
 * - NEVER claim verification merely from processing. processed != source_verified.
 * - Do not infer verification from processing/OCR/classification.
 * - No consent or request flow in this task.
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
  RequirementProfile,
  MatchingEvaluateResponse,
  MatchedRequirementItem,
  MissingRequirementItem,
  AttentionNeededRequirementItem,
  ApiError,
  RecordCategory,
} from '@lifepass/shared';
import { evaluateRecordMatching } from '../services/matchingService';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

interface MatchingResultsScreenProps {
  requirementProfile: RequirementProfile;
  onNavigateToUpload: (category?: RecordCategory) => void;
  onNavigateToReviewShare?: (
    matched: MatchedRequirementItem[],
    missing: MissingRequirementItem[],
    attention: AttentionNeededRequirementItem[]
  ) => void;
  onBackToRequirements: () => void;
  onBackToHome: () => void;
}

export const MatchingResultsScreen: React.FC<MatchingResultsScreenProps> = ({
  requirementProfile,
  onNavigateToUpload,
  onNavigateToReviewShare,
  onBackToRequirements,
  onBackToHome,
}) => {
  const { isDemoMode } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [evaluationData, setEvaluationData] = useState<MatchingEvaluateResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isFixtureUsed, setIsFixtureUsed] = useState(false);

  const loadEvaluation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await evaluateRecordMatching(requirementProfile.profile_id, isDemoMode);
    setIsLoading(false);
    setIsFixtureUsed(result.isDevFixture);

    if (result.error || !result.data) {
      setError(
        result.error || {
          code: 'PROCESSING_FAILED',
          message: 'Unable to evaluate record readiness at this time.',
        }
      );
      return;
    }

    setEvaluationData(result.data);
  }, [requirementProfile.profile_id, isDemoMode]);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
          <Text style={styles.loadingTitle}>Evaluating Personal Record Vault...</Text>
          <Text style={styles.loadingSubtitle}>
            Matching your documents against the {requirementProfile.name} specifications.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error || !evaluationData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBackToRequirements}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Requirements</Text>
            </TouchableOpacity>
            <View style={styles.headerTag}>
              <Text style={styles.headerTagText}>EVALUATION ERROR</Text>
            </View>
          </View>

          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Text style={styles.errorCodeBadge}>{error?.code || 'ERROR'}</Text>
              <Text style={styles.errorTitle}>Matching Engine Unreachable</Text>
            </View>
            <Text style={styles.errorMessage}>
              {error?.message || 'Failed to retrieve deterministic matching evaluation.'}
            </Text>
            <View style={styles.errorActions}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={loadEvaluation}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Retry Evaluation</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.errorSecondaryBtn}
                onPress={onBackToRequirements}
                activeOpacity={0.8}
              >
                <Text style={styles.errorSecondaryBtnText}>Back to Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const {
    readiness_percent,
    matched = [],
    missing = [],
    attention_needed = [],
  } = evaluationData;

  const isComplete = readiness_percent === 100;
  const hasItems = matched.length > 0 || missing.length > 0 || attention_needed.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackToRequirements}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Requirements</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>EVALUATION RESULT</Text>
          </View>
        </View>

        {/* Development Fixture Notice */}
        {!isDemoMode && isFixtureUsed && (
          <View style={styles.fixtureNotice}>
            <Text style={styles.fixtureNoticeText}>
              OFFLINE MODE: Displaying local simulated matching results for UI verification.
            </Text>
          </View>
        )}

        {/* Readiness Summary Header Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.taskName}>{requirementProfile.name}</Text>
              <Text style={styles.summaryLabel}>Application Readiness</Text>
            </View>
            <View style={styles.readinessCircle}>
              <Text style={styles.readinessPercent}>{readiness_percent}%</Text>
            </View>
          </View>

          {/* Progress Indicator Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(Math.max(readiness_percent, 0), 100)}%` },
                isComplete ? styles.progressFillComplete : styles.progressFillPartial,
              ]}
            />
          </View>
        </View>

        {/* Empty State */}
        {!hasItems && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Matching Records Evaluated</Text>
            <Text style={styles.emptyText}>
              The matching engine returned no evaluated records for this requirement profile.
            </Text>
          </View>
        )}

        {/* 1. Matched Requirements Section */}
        {matched.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>MATCHED RECORDS</Text>
              <View style={styles.countBadgeSuccess}>
                <Text style={styles.countBadgeTextSuccess}>{matched.length}</Text>
              </View>
            </View>

            <View style={styles.listContainer}>
              {matched.map((item) => (
                <View key={item.requirement_id} style={styles.matchedCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.statusIndicatorGreen} />
                    <View style={styles.itemTitleGroup}>
                      <Text style={styles.itemRequirementName}>
                        {item.requirement_name}
                      </Text>
                      <Text style={styles.itemRecordTitle}>
                        {item.record_title || 'Document mapped'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badges */}
                  <View style={styles.badgeRow}>
                    {item.processing_status ? (
                      <StatusBadge
                        type="processing"
                        status={item.processing_status}
                      />
                    ) : null}
                    {item.external_verification_status ? (
                      <StatusBadge
                        type="external_verification"
                        status={item.external_verification_status}
                      />
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 2. Missing Requirements Section */}
        {missing.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>MISSING RECORDS</Text>
              <View style={styles.countBadgeWarning}>
                <Text style={styles.countBadgeTextWarning}>{missing.length}</Text>
              </View>
            </View>

            <View style={styles.listContainer}>
              {missing.map((item) => (
                <View key={item.requirement_id} style={styles.missingCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.statusIndicatorAmber} />
                    <View style={styles.itemTitleGroup}>
                      <View style={styles.missingTitleRow}>
                        <Text style={styles.itemRequirementName}>
                          {item.requirement_name}
                        </Text>
                        <View style={styles.missingTag}>
                          <Text style={styles.missingTagText}>MISSING</Text>
                        </View>
                      </View>
                      {item.reason ? (
                        <Text style={styles.missingReasonText}>{item.reason}</Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Action CTA connecting to Phase 2 Upload Record */}
                  <TouchableOpacity
                    style={styles.addRecordBtn}
                    onPress={() => onNavigateToUpload(item.category)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addRecordBtnText}>+ Add Record</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. Attention Needed Section */}
        {attention_needed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>ATTENTION NEEDED</Text>
              <View style={styles.countBadgeAlert}>
                <Text style={styles.countBadgeTextAlert}>{attention_needed.length}</Text>
              </View>
            </View>

            <View style={styles.listContainer}>
              {attention_needed.map((item) => (
                <View key={item.requirement_id} style={styles.attentionCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.statusIndicatorRed} />
                    <View style={styles.itemTitleGroup}>
                      <View style={styles.missingTitleRow}>
                        <Text style={styles.itemRequirementName}>
                          {item.requirement_name}
                        </Text>
                        <View style={styles.attentionTag}>
                          <Text style={styles.attentionTagText}>
                            {(item.state || 'NEEDS REVIEW').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      {item.record_title ? (
                        <Text style={styles.itemRecordTitle}>{item.record_title}</Text>
                      ) : null}
                      {item.reason ? (
                        <Text style={styles.attentionReasonText}>{item.reason}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Trust Boundary Governance Notice */}
        <View style={styles.trustBox}>
          <Text style={styles.trustTitle}>Trust & Verification Boundary</Text>
          <Text style={styles.trustText}>
            LifePass matching is computed deterministically. Extracted OCR metadata is
            distinguished from authoritative external issuer verification. Documents are
            never marked as verified without authoritative external issuer confirmation.
          </Text>
        </View>

        {/* Navigation Actions */}
        <View style={styles.actionSection}>
          {matched.length > 0 && onNavigateToReviewShare ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => onNavigateToReviewShare(matched, missing, attention_needed)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                Review & Share Records ({matched.length}) →
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onBackToRequirements}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Back to Requirements Checklist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={onBackToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryBtnText}>Return to Home</Text>
          </TouchableOpacity>
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
    lineHeight: 18,
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
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorMessage: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
    marginBottom: 14,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  errorSecondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  errorSecondaryBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  readinessCircle: {
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readinessPercent: {
    color: '#15803D',
    fontSize: 18,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFillPartial: {
    backgroundColor: '#0284C7',
  },
  progressFillComplete: {
    backgroundColor: '#10B981',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  section: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  countBadgeSuccess: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeTextSuccess: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '700',
  },
  countBadgeWarning: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeTextWarning: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '700',
  },
  countBadgeAlert: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeTextAlert: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  listContainer: {
    gap: 10,
  },
  matchedCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  statusIndicatorGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  statusIndicatorAmber: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
  },
  statusIndicatorRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginTop: 6,
  },
  itemTitleGroup: {
    flex: 1,
  },
  itemRequirementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemRecordTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  missingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
  },
  missingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  missingTag: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  missingTagText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  missingReasonText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  addRecordBtn: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  addRecordBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  attentionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
  },
  attentionTag: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  attentionTagText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  attentionReasonText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  trustBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginBottom: 4,
  },
  trustText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  actionSection: {
    gap: 10,
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
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  tertiaryBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  tertiaryBtnText: {
    color: '#64748B',
    fontSize: 13,
  },
});
