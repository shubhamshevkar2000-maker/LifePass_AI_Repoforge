/**
 * LifePass AI — Review & Share Screen
 *
 * SCOPE: Citizen Mobile Review & Sharing Flow
 *
 * Allows the citizen to inspect which records are proposed for sharing before consent:
 * - Requesting organization & purpose
 * - Matched records with granular selection control (select/unselect)
 * - Missing requirements clearly displayed as unselectable
 * - Selected record counter
 * - Strict rule: Default selection does NOT grant consent; user must proceed to Consent screen.
 * - Missing records are not selectable.
 * - No client-side authorization.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {
  RequirementProfile,
  MatchedRequirementItem,
  MissingRequirementItem,
  AttentionNeededRequirementItem,
} from '@lifepass/shared';
import { StatusBadge } from '../components/StatusBadge';

interface ReviewShareScreenProps {
  requirementProfile: RequirementProfile;
  matchedRecords: MatchedRequirementItem[];
  missingRequirements: MissingRequirementItem[];
  attentionNeeded?: AttentionNeededRequirementItem[];
  institutionName?: string;
  onProceedToConsent: (selectedRecordIds: string[]) => void;
  onBackToResults: () => void;
}

export const ReviewShareScreen: React.FC<ReviewShareScreenProps> = ({
  requirementProfile,
  matchedRecords,
  missingRequirements,
  attentionNeeded = [],
  institutionName = 'Demo Bank',
  onProceedToConsent,
  onBackToResults,
}) => {
  // Initialize selection with all matched record IDs
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>(() =>
    matchedRecords
      .map((r) => r.record_id)
      .filter((id): id is string => Boolean(id))
  );

  const toggleRecordSelection = (recordId?: string) => {
    if (!recordId) return;
    setSelectedRecordIds((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  };

  const isAllSelected =
    matchedRecords.length > 0 &&
    matchedRecords.every((r) => r.record_id && selectedRecordIds.includes(r.record_id));

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(
        matchedRecords
          .map((r) => r.record_id)
          .filter((id): id is string => Boolean(id))
      );
    }
  };

  const selectedCount = selectedRecordIds.length;
  const canProceed = selectedCount > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackToResults}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Results</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>STEP 1: REVIEW PROPOSED</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Review Records for Sharing</Text>
          <Text style={styles.subtitle}>
            Inspect which documents from your personal vault will be packaged for{' '}
            <Text style={styles.highlightText}>{institutionName}</Text>. You control which
            records are included before granting consent.
          </Text>
        </View>

        {/* Request Context Card */}
        <View style={styles.contextCard}>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>TARGET INSTITUTION</Text>
            <Text style={styles.contextValue}>{institutionName}</Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>APPLICATION PURPOSE</Text>
            <Text style={styles.contextValue}>{requirementProfile.name}</Text>
          </View>
          <View style={[styles.contextRow, styles.contextRowLast]}>
            <Text style={styles.contextLabel}>SELECTED FOR SHARING</Text>
            <Text style={styles.selectedCountText}>
              {selectedCount} of {matchedRecords.length} available records
            </Text>
          </View>
        </View>

        {/* Matched Records Selection Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>RECORDS AVAILABLE TO SHARE</Text>
              <Text style={styles.sectionSubtitle}>
                Select the records you authorize for this package:
              </Text>
            </View>
            <TouchableOpacity onPress={handleToggleAll} activeOpacity={0.7}>
              <Text style={styles.toggleAllText}>
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recordList}>
            {matchedRecords.map((item) => {
              const isSelected = item.record_id
                ? selectedRecordIds.includes(item.record_id)
                : false;

              return (
                <TouchableOpacity
                  key={item.requirement_id}
                  style={[
                    styles.recordCard,
                    isSelected ? styles.recordCardSelected : styles.recordCardUnselected,
                  ]}
                  onPress={() => toggleRecordSelection(item.record_id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeaderRow}>
                    {/* Checkbox indicator */}
                    <View
                      style={[
                        styles.checkbox,
                        isSelected ? styles.checkboxChecked : styles.checkboxUnchecked,
                      ]}
                    >
                      {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
                    </View>

                    <View style={styles.recordInfoGroup}>
                      <Text style={styles.requirementName}>{item.requirement_name}</Text>
                      <Text style={styles.recordTitle}>
                        {item.record_title || 'Document in vault'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Badges */}
                  <View style={styles.badgeRow}>
                    {item.processing_status ? (
                      <StatusBadge type="processing" status={item.processing_status} />
                    ) : null}
                    {item.external_verification_status ? (
                      <StatusBadge
                        type="external_verification"
                        status={item.external_verification_status}
                      />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Missing Requirements (Unselectable) */}
        {missingRequirements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>MISSING REQUIREMENTS</Text>
              <View style={styles.missingCountBadge}>
                <Text style={styles.missingCountText}>{missingRequirements.length}</Text>
              </View>
            </View>
            <Text style={styles.missingNotice}>
              These documents are missing from your vault and cannot be selected. The institution
              will be informed that these requirements are not yet satisfied.
            </Text>

            <View style={styles.missingList}>
              {missingRequirements.map((item) => (
                <View key={item.requirement_id} style={styles.missingCard}>
                  <View style={styles.missingDot} />
                  <View style={styles.missingInfo}>
                    <Text style={styles.missingName}>{item.requirement_name}</Text>
                    <Text style={styles.missingStatus}>Not in vault • Missing</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attention Needed Section (if any) */}
        {attentionNeeded.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ATTENTION ITEMS</Text>
            <View style={styles.missingList}>
              {attentionNeeded.map((item) => (
                <View key={item.requirement_id} style={styles.attentionCard}>
                  <Text style={styles.attentionName}>{item.requirement_name}</Text>
                  <Text style={styles.attentionStatus}>
                    {(item.state || 'Needs Review').toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Citizen Control Notice */}
        <View style={styles.controlBox}>
          <Text style={styles.controlTitle}>User-Controlled Sharing</Text>
          <Text style={styles.controlText}>
            Selecting records here prepares your package. No records are shared until you
            explicitly grant consent on the next screen. You may modify your selection at any time.
          </Text>
        </View>

        {/* Primary Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, !canProceed && styles.primaryBtnDisabled]}
            onPress={() => canProceed && onProceedToConsent(selectedRecordIds)}
            disabled={!canProceed}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>
              Continue to Consent ({selectedCount} Selected) →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onBackToResults}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>← Back to Matching Results</Text>
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
  highlightText: {
    color: '#0284C7',
    fontWeight: '600',
  },
  contextCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    marginBottom: 22,
    gap: 10,
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  contextRowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  contextLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  contextValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  toggleAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  recordList: {
    gap: 10,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  recordCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  recordCardUnselected: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    opacity: 0.85,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  checkboxUnchecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  recordInfoGroup: {
    flex: 1,
  },
  requirementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  recordTitle: {
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
    marginLeft: 32,
  },
  missingCountBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  missingCountText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
  },
  missingNotice: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },
  missingList: {
    gap: 8,
  },
  missingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  missingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  missingInfo: {
    flex: 1,
  },
  missingName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  missingStatus: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 1,
  },
  attentionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  attentionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  attentionStatus: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  controlBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  controlTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginBottom: 4,
  },
  controlText: {
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
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#CBD5E1',
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
});
