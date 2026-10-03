/**
 * LifePass AI — AI Task Entry Screen
 *
 * PHASE 3: Life-Stage Knowledge / Requirement Experience
 *
 * Implements the dedicated AI Assistant task discovery entry.
 * User prompt entry -> Calls /ai/intent -> Transitions to Interpreted Task.
 *
 * AESTHETIC & ARCHITECTURE:
 * - Serious identity/record infrastructure visual language.
 * - Focused task-understanding workflow, NOT a generic chatbot.
 * - Handles loading, empty input, invalid input, AI unavailable, and retry.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AiIntentResponse, ApiError } from '@lifepass/shared';
import { interpretTaskIntent } from '../services/aiRequirementService';
import { useAuth } from '../context/AuthContext';

interface AiTaskEntryScreenProps {
  initialGoal?: string;
  onTaskInterpreted: (result: AiIntentResponse, originalGoal: string) => void;
  onBackToHome: () => void;
}

const EXAMPLE_GOALS = [
  'I want to apply for an education loan.',
  'Applying for university master’s program.',
  'Applying for rental apartment lease.',
];

export const AiTaskEntryScreen: React.FC<AiTaskEntryScreenProps> = ({
  initialGoal,
  onTaskInterpreted,
  onBackToHome,
}) => {
  const { isDemoMode } = useAuth();
  const [goalText, setGoalText] = useState(initialGoal || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isFixtureUsed, setIsFixtureUsed] = useState(false);

  const handleSubmit = async (textToSubmit?: string) => {
    const text = (textToSubmit ?? goalText).trim();
    if (!text) {
      setError({
        code: 'INVALID_INPUT',
        message: 'Please describe the life-stage task or goal you are pursuing.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await interpretTaskIntent(text, isDemoMode);
    setIsLoading(false);
    setIsFixtureUsed(result.isDevFixture);

    if (result.error || !result.data) {
      setError(
        result.error || {
          code: 'AI_UNAVAILABLE',
          message: 'The LifePass AI task understanding service is currently unavailable.',
        }
      );
      return;
    }

    onTaskInterpreted(result.data, text);
  };

  const handleSelectExample = (example: string) => {
    setGoalText(example);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBackToHome}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.headerTag}>
              <Text style={styles.headerTagText}>AI ASSISTANT</Text>
            </View>
          </View>

          {/* Title & Context */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>What are you trying to do?</Text>
            <Text style={styles.subtitle}>
              Describe your life-stage goal. LifePass will structure your objective and
              retrieve the official document requirement profile from the controlled
              knowledge base.
            </Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorCard}>
              <View style={styles.errorHeader}>
                <Text style={styles.errorCodeBadge}>{error.code}</Text>
                <Text style={styles.errorTitle}>Task Analysis Issue</Text>
              </View>
              <Text style={styles.errorMessage}>{error.message}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => handleSubmit()}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Retry Analysis</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Development Fixture Badge Notice */}
          {!isDemoMode && isFixtureUsed && (
            <View style={styles.fixtureNotice}>
              <Text style={styles.fixtureNoticeText}>
                OFFLINE MODE: Displaying local requirement fixtures for preview.
              </Text>
            </View>
          )}

          {/* Input Card */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>YOUR GOAL / OBJECTIVE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., I want to apply for an education loan."
              placeholderTextColor="#94A3B8"
              value={goalText}
              onChangeText={(val) => {
                setGoalText(val);
                if (error) setError(null);
              }}
              multiline
              numberOfLines={4}
              editable={!isLoading}
              textAlignVertical="top"
            />

            <View style={styles.inputFooter}>
              <Text style={styles.charCount}>{goalText.length} characters</Text>
              {goalText.length > 0 && !isLoading && (
                <TouchableOpacity onPress={() => setGoalText('')}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!goalText.trim() || isLoading) && styles.submitButtonDisabled]}
            onPress={() => handleSubmit()}
            disabled={!goalText.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.loadingButtonText}>Analyzing Life-Stage Task...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Discover Requirements →</Text>
            )}
          </TouchableOpacity>

          {/* Suggested Examples */}
          <View style={styles.examplesSection}>
            <Text style={styles.examplesTitle}>EXAMPLE LIFE-STAGE TASKS</Text>
            <Text style={styles.examplesSubtitle}>
              Tap an example to test task understanding and requirement retrieval:
            </Text>
            {EXAMPLE_GOALS.map((example, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.examplePill}
                onPress={() => handleSelectExample(example)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.examplePillText}>"{example}"</Text>
                <Text style={styles.exampleArrow}>Use</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* System Governance Note */}
          <View style={styles.governanceBox}>
            <Text style={styles.governanceTitle}>Controlled Knowledge Boundary</Text>
            <Text style={styles.governanceText}>
              LifePass AI classifies your intent and maps it to versioned, verified requirement
              profiles. The AI does not invent documents, legal obligations, or approval decisions.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
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
    marginBottom: 10,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fixtureNotice: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  fixtureNoticeText: {
    color: '#1D4ED8',
    fontSize: 11,
    lineHeight: 16,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  clearText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  submitButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  examplesSection: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  examplesSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  examplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  examplePillText: {
    color: '#334155',
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  exampleArrow: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '600',
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
