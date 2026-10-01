import React, { useState, useEffect } from 'react';
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

interface OtpVerifyScreenProps {
  onBackToPhone: () => void;
}

export const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({ onBackToPhone }) => {
  const { phoneEntered, verifyOtp, sendOtp, error, clearError } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [localError, setLocalError] = useState<string | null>(null);

  // Countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    clearError();
    setLocalError(null);

    const token = otpCode.trim();
    if (!token || token.length < 6) {
      setLocalError('Please enter the complete 6-digit code received via SMS.');
      return;
    }

    setIsVerifying(true);
    const result = await verifyOtp(phoneEntered, token);
    setIsVerifying(false);

    if (!result.success && result.error) {
      setLocalError(result.error);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    clearError();
    setLocalError(null);
    setIsResending(true);
    const result = await sendOtp(phoneEntered);
    setIsResending(false);
    if (result.success) {
      setResendCooldown(60);
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <TouchableOpacity style={styles.backButton} onPress={onBackToPhone} disabled={isVerifying}>
            <Text style={styles.backButtonText}>← Change Number</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Enter SMS Code</Text>
            <Text style={styles.subtitle}>
              A 6-digit verification code was dispatched to:
            </Text>
            <Text style={styles.phoneNumberHighlight}>{phoneEntered || 'your phone'}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>6-Digit Security Code</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor="#4B5563"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              value={otpCode}
              onChangeText={(text) => {
                setOtpCode(text);
                setLocalError(null);
                clearError();
              }}
              editable={!isVerifying}
            />
          </View>

          {(localError || error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isVerifying && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isVerifying}
            activeOpacity={0.8}
          >
            {isVerifying ? (
              <ActivityIndicator color="#090D16" />
            ) : (
              <Text style={styles.buttonText}>Verify & Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {resendCooldown > 0 ? (
              <Text style={styles.resendCooldownText}>
                Resend code available in {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={isResending}
                activeOpacity={0.7}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color="#38BDF8" />
                ) : (
                  <Text style={styles.resendActionText}>Resend SMS Code</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Codes expire quickly according to Supabase Auth provider policy.
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
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  phoneNumberHighlight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 2,
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
    paddingVertical: 14,
    color: '#F9FAFB',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#38BDF8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#090D16',
    fontSize: 15,
    fontWeight: '700',
  },
  resendContainer: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendCooldownText: {
    fontSize: 12,
    color: '#6B7280',
  },
  resendActionText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
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
