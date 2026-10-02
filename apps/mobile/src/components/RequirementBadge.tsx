/**
 * LifePass AI — Requirement Badge Component
 *
 * Renders requirement specification states:
 * - Required vs Optional
 * - State flags when supplied by backend (found, missing, attention_needed)
 *
 * GOVERNANCE RULE:
 * This component ONLY renders states supplied by upstream data. It does not
 * evaluate or infer matching results locally.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RequirementState } from '@lifepass/shared';

interface RequirementBadgeProps {
  required?: boolean;
  state?: RequirementState;
}

export const RequirementBadge: React.FC<RequirementBadgeProps> = ({
  required,
  state,
}) => {
  // If a specific evaluation state is supplied by contract
  if (state) {
    switch (state) {
      case 'found':
        return (
          <View style={[styles.badge, styles.foundBadge]}>
            <Text style={[styles.text, styles.foundText]}>FOUND</Text>
          </View>
        );
      case 'missing':
        return (
          <View style={[styles.badge, styles.missingBadge]}>
            <Text style={[styles.text, styles.missingText]}>MISSING</Text>
          </View>
        );
      case 'attention_needed':
        return (
          <View style={[styles.badge, styles.attentionBadge]}>
            <Text style={[styles.text, styles.attentionText]}>ATTENTION NEEDED</Text>
          </View>
        );
      case 'optional':
        return (
          <View style={[styles.badge, styles.optionalBadge]}>
            <Text style={[styles.text, styles.optionalText]}>OPTIONAL</Text>
          </View>
        );
      case 'required':
      default:
        return (
          <View style={[styles.badge, styles.requiredBadge]}>
            <Text style={[styles.text, styles.requiredText]}>REQUIRED</Text>
          </View>
        );
    }
  }

  // Fallback to basic required boolean flag
  if (required === false) {
    return (
      <View style={[styles.badge, styles.optionalBadge]}>
        <Text style={[styles.text, styles.optionalText]}>OPTIONAL</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.requiredBadge]}>
      <Text style={[styles.text, styles.requiredText]}>REQUIRED</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  requiredBadge: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  requiredText: {
    color: '#38BDF8',
  },
  optionalBadge: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  optionalText: {
    color: '#9CA3AF',
  },
  foundBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: '#059669',
  },
  foundText: {
    color: '#34D399',
  },
  missingBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: '#D97706',
  },
  missingText: {
    color: '#FBBF24',
  },
  attentionBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: '#DC2626',
  },
  attentionText: {
    color: '#F87171',
  },
});
