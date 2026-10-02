import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface PhoneEntryScreenProps {
  onOtpSent: () => void;
}

export const PhoneEntryScreen: React.FC<PhoneEntryScreenProps> = ({ onOtpSent }) => {
  const { sendOtp, error, clearError, isConfigured } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    clearError();
    setLocalError(null);

    const cleaned = phoneNumber.trim().replace(/[\s-]/g, '');
    if (!cleaned || cleaned.length < 8) {
      setLocalError('Please enter a valid phone number with country code (e.g. +14155552671)');
      return;
    }

    setIsSubmitting(true);
    const result = await sendOtp(cleaned);
    setIsSubmitting(false);

    if (result.success) {
      onOtpSent();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>LifePass AI</Text>
            <Text style={styles.subtitle}>Unified Life-Stage Digital Identity</Text>
          </View>

          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>CITIZEN MOBILE AUTHENTICATION</Text>
          </View>

          {!isConfigured && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Configuration Required</Text>
              <Text style={styles.warningText}>
                Supabase credentials not configured in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
                Real SMS OTP will be requested once credentials are set.
              </Text>
            </View>
          )}

          <Text style={styles.instruction}>
            Enter your mobile number to receive a secure SMS verification code.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+14155552671 or +919876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setLocalError(null);
                clearError();
              }}
              editable={!isSubmitting}
            />
            <Text style={styles.inputHint}>Include country code with + (e.g. +1 for US, +91 for India)</Text>
          </View>

          {(localError || error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Verification codes are sent securely via SMS. LifePass does not store or share your OTP.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  instruction: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 15,
  },
  inputHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  warningText: {
    color: '#92400E',
    fontSize: 11,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
});
