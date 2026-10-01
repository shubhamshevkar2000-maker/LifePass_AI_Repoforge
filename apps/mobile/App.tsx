import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

/**
 * LifePass AI — Citizen Mobile Application Foundation
 *
 * PHASE 0.1 BASELINE ONLY
 * Business features, authentication, and document processing will be implemented
 * in subsequent phases according to IMPLEMENTATION_PLAN.md.
 */
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.title}>LifePass AI</Text>
        <Text style={styles.subtitle}>Unified Life-Stage Digital Identity</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Phase 0.1 — Mobile Foundation Baseline</Text>
        </View>
        <Text style={styles.description}>
          The workspace environment and architecture foundation have been successfully initialized.
          Business features and OTP authentication will be implemented in Phase 1+.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  description: {
    fontSize: 13,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
});
