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

interface CitizenLoginScreenProps {
  onBackToLanding?: () => void;
  onTryDemo?: () => void;
}

export const CitizenLoginScreen: React.FC<CitizenLoginScreenProps> = ({
  onBackToLanding,
  onTryDemo,
}) => {
  const { signInWithPassword, error, clearError, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    setLocalError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Please enter your citizen account email.');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithPassword(cleanEmail, password);
    setIsSubmitting(false);

    if (!result.success && result.error) {
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
          {onBackToLanding && (
            <TouchableOpacity onPress={onBackToLanding} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Back to Welcome</Text>
            </TouchableOpacity>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>LifePass AI</Text>
            <Text style={styles.subtitle}>Unified Life-Stage Digital Identity</Text>
          </View>

          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>LOCAL EMAIL LOGIN</Text>
          </View>

          {!isConfigured && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Configuration Required</Text>
              <Text style={styles.warningText}>
                Supabase credentials not configured in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.
              </Text>
            </View>
          )}

          <Text style={styles.instruction}>
            Sign in to your private Citizen LifePass Vault using your local development credentials.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Citizen Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ananya.test@local.dev"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLocalError(null);
                clearError();
              }}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLocalError(null);
                clearError();
              }}
              editable={!isSubmitting}
            />
          </View>

          {(localError || error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In with Email</Text>
            )}
          </TouchableOpacity>

          {onTryDemo && (
            <TouchableOpacity
              style={styles.demoShortcutBtn}
              onPress={onTryDemo}
              activeOpacity={0.8}
            >
              <Text style={styles.demoShortcutBtnText}>Switch to Demo Mode (Synthetic Records) →</Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Local Development Mode: Authenticates directly with local Supabase Auth without OTP verification.
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
    color: '#475569',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  demoShortcutBtn: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  demoShortcutBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});
