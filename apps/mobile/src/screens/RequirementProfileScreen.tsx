/**
 * LifePass AI — Requirement Profile Screen
 *
 * PHASE 3: Life-Stage Knowledge / Requirement Experience
 *
 * Displays the controlled requirement profile retrieved for the life-stage task:
 * - Profile Name & Version (when supplied)
 * - Controlled Requirement Checklist (Identity proof, Address proof, Academic record,
 *   Income proof, Admission letter)
 * - Required / Optional and evaluation states via RequirementBadge
 * - Empty, unknown, and boundary states
 *
 * GOVERNANCE BOUNDARY:
 * Strictly does NOT calculate local matching or readiness percentages.
 * Displays only the facts supplied by the controlled knowledge layer.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { RequirementProfile } from '@lifepass/shared';
import { RequirementBadge } from '../components/RequirementBadge';

interface RequirementProfileScreenProps {
  profile: RequirementProfile;
  onCheckReadiness?: () => void;
  onBackToTask: () => void;
  onBackToHome: () => void;
  onStartNewGoal: () => void;
}

export const RequirementProfileScreen: React.FC<RequirementProfileScreenProps> = ({
  profile,
  onCheckReadiness,
  onBackToTask,
  onBackToHome,
  onStartNewGoal,
}) => {
  const hasRequirements = profile.requirements && profile.requirements.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBackToTask}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back to Task</Text>
          </TouchableOpacity>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>KNOWLEDGE BASE</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileTagRow}>
              <View style={styles.controlledBadge}>
                <Text style={styles.controlledBadgeText}>CONTROLLED PROFILE</Text>
              </View>
              {profile.version ? (
                <View style={styles.versionBadge}>
                  <Text style={styles.versionBadgeText}>v{profile.version}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.profileTitle}>{profile.name}</Text>
            {profile.description ? (
              <Text style={styles.profileDesc}>{profile.description}</Text>
            ) : null}

            <View style={styles.metaRow}>
              {profile.domain ? (
                <Text style={styles.metaChip}>Domain: {profile.domain}</Text>
              ) : null}
              {profile.task_code ? (
                <Text style={styles.metaChip}>Task: {profile.task_code}</Text>
              ) : null}
              <Text style={styles.metaChip}>
                {profile.requirements?.length || 0} Requirements Defined
              </Text>
            </View>
          </View>
        </View>

        {/* Requirements Checklist Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>REQUIREMENT CHECKLIST</Text>
          <Text style={styles.sectionSubtitle}>
            Official document specifications configured for this life-stage task:
          </Text>
        </View>

        {/* Empty State */}
        {!hasRequirements && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Requirements Configured</Text>
            <Text style={styles.emptyText}>
              This requirement profile does not currently have any document requirements
              configured in the controlled knowledge base.
            </Text>
          </View>
        )}

        {/* Requirements List */}
        {hasRequirements && (
          <View style={styles.reqList}>
            {profile.requirements.map((req, index) => (
              <View key={req.id || req.code || index} style={styles.reqCard}>
                <View style={styles.reqCardTop}>
                  <View style={styles.reqIndexBadge}>
                    <Text style={styles.reqIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.reqTitleGroup}>
                    <Text style={styles.reqName}>{req.name}</Text>
                    {req.category ? (
                      <Text style={styles.reqCategory}>
                        Category: {req.category.toUpperCase()}
                      </Text>
                    ) : null}
                  </View>
                  <RequirementBadge required={req.required} state={req.state} />
                </View>

                {/* Accepted Types */}
                {req.accepted_document_types && req.accepted_document_types.length > 0 ? (
                  <View style={styles.acceptedTypesBox}>
                    <Text style={styles.acceptedTypesLabel}>Accepted Types:</Text>
                    <View style={styles.typesRow}>
                      {req.accepted_document_types.map((type, tIdx) => (
                        <View key={tIdx} style={styles.typePill}>
                          <Text style={styles.typePillText}>{type.replace(/_/g, ' ')}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Phase Boundary Notice */}
        <View style={styles.boundaryBox}>
          <Text style={styles.boundaryTitle}>Deterministic Matching Boundary</Text>
          <Text style={styles.boundaryText}>
            This requirement checklist is derived directly from the LifePass Requirement
            Knowledge Layer. In upcoming phases, LifePass maps your uploaded records against
            these requirements to compute your verification readiness percentage.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {hasRequirements && onCheckReadiness ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onCheckReadiness}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Check Application Readiness →</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onStartNewGoal}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Explore Another Life-Stage Goal</Text>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  profileHeader: {
    gap: 8,
  },
  profileTagRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  controlledBadge: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  controlledBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  versionBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  profileDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metaChip: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#64748B',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  reqList: {
    gap: 12,
    marginBottom: 24,
  },
  reqCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  reqCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  reqIndexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqIndexText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
  },
  reqTitleGroup: {
    flex: 1,
  },
  reqName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  reqCategory: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  acceptedTypesBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  acceptedTypesLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typePill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typePillText: {
    color: '#475569',
    fontSize: 11,
  },
  boundaryBox: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  boundaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  boundaryText: {
    fontSize: 12,
    color: '#475569',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#334155',
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
