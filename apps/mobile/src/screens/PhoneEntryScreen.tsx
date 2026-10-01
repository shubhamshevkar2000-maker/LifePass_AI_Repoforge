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
              placeholderTextColor="#4B5563"
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
              <ActivityIndicator color="#090D16" />
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
    backgroundColor: '#090D16',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 14,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  instruction: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#090D16',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F9FAFB',
    fontSize: 15,
  },
  inputHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  warningBox: {
    backgroundColor: '#3B2900',
    borderColor: '#78350F',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningTitle: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  warningText: {
    color: '#FDE68A',
    fontSize: 11,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#450A0A',
    borderColor: '#7F1D1D',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#38BDF8',
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
    color: '#090D16',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    borderTopColor: '#1F2937',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
