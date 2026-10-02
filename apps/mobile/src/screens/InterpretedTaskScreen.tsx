/**
 * LifePass AI — Interpreted Task Screen
 *
 * PHASE 3: Life-Stage Knowledge / Requirement Experience
 *
 * Displays the structured task returned by POST /ai/intent:
 * - intent
 * - task
 * - domain
 * - institution_type
 * - confidence (strictly ONLY displayed when supplied by the API; never fabricated)
 *
 * ACTIONS:
 * - "View Requirements" -> Calls POST /ai/requirements -> Transitions to Requirement Profile
 * - "Edit Goal / Try Another Task" -> Returns to task entry
 */

import React, { useState } from 'react';
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
  AiIntentResponse,
  RequirementProfile,
  ApiError,
} from '@lifepass/shared';
import { fetchRequirementProfile } from '../services/aiRequirementService';

interface InterpretedTaskScreenProps {
  intentResult: AiIntentResponse;
  originalGoal?: string;
  onViewRequirements: (profile: RequirementProfile) => void;
  onEditGoal: () => void;
  onBackToHome: () => void;
}

export const InterpretedTaskScreen: React.FC<InterpretedTaskScreenProps> = ({
  intentResult,
  originalGoal,
  onViewRequirements,
  onEditGoal,
  onBackToHome,
}) => {
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const formatTaskName = (task: string): string => {
    return task
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleFetchRequirements = async () => {
    setIsLoadingRequirements(true);
    setError(null);

    const result = await fetchRequirementProfile(intentResult.task);
    setIsLoadingRequirements(false);

    if (result.error || !result.data) {
      setError(
        result.error || {
          code: 'REQUIREMENT_PROFILE_NOT_FOUND',
          message: `No controlled requirement profile found for task: "${intentResult.task}".`,
        }
      );
      return;
    }

    onViewRequirements(result.data);
  };

  const isUnknownTask =
    intentResult.task === 'unknown_task' ||
    intentResult.intent === 'unknown_intent';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onEditGoal}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Edit Goal</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>TASK STRUCTURED</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Interpreted Life-Stage Task</Text>
          <Text style={styles.subtitle}>
            LifePass AI has parsed your goal into a structured life-stage objective.
          </Text>
        </View>

        {/* Original Input Echo */}
        {originalGoal ? (
          <View style={styles.originalGoalBox}>
            <Text style={styles.originalGoalLabel}>YOUR INPUT</Text>
            <Text style={styles.originalGoalText}>"{originalGoal}"</Text>
          </View>
        ) : null}

        {/* Error Banner */}
        {error && (
          <View style={styles.errorCard}>
            <View style={styles.errorHeader}>
              <Text style={styles.errorCodeBadge}>{error.code}</Text>
              <Text style={styles.errorTitle}>Requirements Lookup Failed</Text>
            </View>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={handleFetchRequirements}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Retry Lookup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.errorSecondaryBtn}
                onPress={onEditGoal}
                activeOpacity={0.8}
              >
                <Text style={styles.errorSecondaryBtnText}>Edit Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Structured Task Card */}
        <View style={styles.taskCard}>
          <View style={styles.taskCardHeader}>
            <Text style={styles.taskCardHeaderLabel}>STRUCTURED OBJECTIVE</Text>
            {/* Confidence is ONLY displayed when supplied by the API */}
            {typeof intentResult.confidence === 'number' && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceBadgeText}>
                  {Math.round(intentResult.confidence * 100)}% CONFIDENCE
                </Text>
              </View>
            )}
          </View>

          {/* Task / Title */}
          <Text style={styles.taskName}>{formatTaskName(intentResult.task)}</Text>

          {/* Structured Attributes Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Domain</Text>
              <Text style={styles.metaValue}>{formatTaskName(intentResult.domain)}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Institution Type</Text>
              <Text style={styles.metaValue}>
                {formatTaskName(intentResult.institution_type)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Intent Identifier</Text>
              <Text style={styles.metaValueCode}>{intentResult.intent}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Task Code</Text>
              <Text style={styles.metaValueCode}>{intentResult.task}</Text>
            </View>
          </View>
        </View>

        {/* Unknown Task Warning if applicable */}
        {isUnknownTask && (
          <View style={styles.unknownBox}>
            <Text style={styles.unknownTitle}>Unrecognized Life-Stage Task</Text>
            <Text style={styles.unknownText}>
              LifePass cannot match this goal to an active institutional requirement
              profile in the knowledge base. Try rephrasing your goal (e.g. "I want to apply
              for an education loan").
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {!isUnknownTask && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                isLoadingRequirements && styles.primaryBtnDisabled,
              ]}
              onPress={handleFetchRequirements}
              disabled={isLoadingRequirements}
              activeOpacity={0.8}
            >
              {isLoadingRequirements ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Loading Profile...</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>View Requirement Profile →</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onEditGoal}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Edit Goal / Try Another Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={onBackToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Governance Box */}
        <View style={styles.governanceBox}>
          <Text style={styles.governanceTitle}>Source-of-Truth Architecture</Text>
          <Text style={styles.governanceText}>
            Requirement specifications are managed in the versioned LifePass Requirement
            Knowledge Layer. The LLM translates user intent into a task code, but does
            not invent document requirements.
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  originalGoalBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  originalGoalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  originalGoalText: {
    fontSize: 13,
    color: '#0F172A',
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
  },
  errorMessage: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorSecondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  errorSecondaryBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskCardHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  confidenceBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  confidenceBadgeText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  taskName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  metaGrid: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  metaValueCode: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0284C7',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unknownBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  unknownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
    marginBottom: 4,
  },
  unknownText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  actionSection: {
    gap: 10,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#334155',
    fontSize: 14,
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
  governanceBox: {
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
});
