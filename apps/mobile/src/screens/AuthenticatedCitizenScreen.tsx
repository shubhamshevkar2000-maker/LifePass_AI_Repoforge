import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface AuthenticatedCitizenScreenProps {
  onBackToHome?: () => void;
}

export const AuthenticatedCitizenScreen: React.FC<AuthenticatedCitizenScreenProps> = ({
  onBackToHome,
}) => {
  const { user, profile, signOut, updateProfileName } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setUpdateMsg(null);
    setIsUpdating(true);
    const res = await updateProfileName(fullName);
    setIsUpdating(false);

    if (res.success) {
      setUpdateMsg({ type: 'success', text: 'Profile updated in Supabase database.' });
    } else {
      setUpdateMsg({ type: 'error', text: res.error || 'Failed to update profile' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {onBackToHome && (
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={onBackToHome}
            activeOpacity={0.7}
          >
            <Text style={styles.backHomeBtnText}>← Back to Home</Text>
          </TouchableOpacity>
        )}
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>AUTHENTICATED SESSION</Text>
            </View>
            <Text style={styles.title}>Citizen Identity & Profile</Text>
            <Text style={styles.subtitle}>LifePass Unified Digital Identity Foundation</Text>
          </View>

          {/* User & Identity Details */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionHeader}>Verified Identity</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not available'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Auth User ID</Text>
              <Text style={styles.infoValueMonospace} numberOfLines={1} ellipsizeMode="middle">
                {user?.id || ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Auth Authority</Text>
              <Text style={styles.infoValue}>Supabase Auth (SMS OTP)</Text>
            </View>
          </View>

          {/* Profile Management Section (Exercises RLS policies) */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionHeader}>Application Profile</Text>
            <Text style={styles.profileNote}>
              Stored in PostgreSQL `public.profiles` protected by Row Level Security.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full legal name"
                placeholderTextColor="#94A3B8"
                value={fullName}
                onChangeText={setFullName}
                editable={!isUpdating}
              />
            </View>

            {updateMsg && (
              <View
                style={[
                  styles.msgBox,
                  updateMsg.type === 'success' ? styles.msgBoxSuccess : styles.msgBoxError,
                ]}
              >
                <Text
                  style={[
                    styles.msgText,
                    updateMsg.type === 'success' ? styles.msgTextSuccess : styles.msgTextError,
                  ]}
                >
                  {updateMsg.text}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, isUpdating && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Profile Name</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Foundation Status Banner */}
          <View style={styles.foundationCard}>
            <Text style={styles.foundationTitle}>Phase 1 Foundation Verified</Text>
            <Text style={styles.foundationText}>
              Phone authentication, Supabase session restoration, and database profile RLS are active.
              Personal record upload, record management, and AI document matching are reserved for Phase 2+.
            </Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={signOut} activeOpacity={0.8}>
            <Text style={styles.signOutButtonText}>Sign Out of LifePass</Text>
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
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 20,
  },
  badgeSuccess: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeSuccessText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoValueMonospace: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#0284C7',
    maxWidth: '55%',
  },
  profileSection: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  profileNote: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  msgBox: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  msgBoxSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  msgBoxError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  msgText: {
    fontSize: 11,
    textAlign: 'center',
  },
  msgTextSuccess: {
    color: '#059669',
  },
  msgTextError: {
    color: '#DC2626',
  },
  foundationCard: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  foundationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  foundationText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  signOutButton: {
    borderColor: '#E2E8F0',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  backHomeBtn: {
    paddingVertical: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backHomeBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
});

