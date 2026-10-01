import React, { useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PhoneEntryScreen } from './src/screens/PhoneEntryScreen';
import { OtpVerifyScreen } from './src/screens/OtpVerifyScreen';
import { AuthenticatedCitizenScreen } from './src/screens/AuthenticatedCitizenScreen';

const MainNavigator: React.FC = () => {
  const { session, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'phone' | 'otp'>('phone');

  // Loading / Session Restoration State
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Restoring LifePass Security Session...</Text>
      </View>
    );
  }

  // Authenticated State
  if (session) {
    return (
      <>
        <StatusBar style="light" />
        <AuthenticatedCitizenScreen />
      </>
    );
  }

  // Unauthenticated: Phone Entry or OTP Verification
  return (
    <>
      <StatusBar style="light" />
      {currentStep === 'phone' ? (
        <PhoneEntryScreen onOtpSent={() => setCurrentStep('otp')} />
      ) : (
        <OtpVerifyScreen onBackToPhone={() => setCurrentStep('phone')} />
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#9CA3AF',
    fontSize: 13,
  },
});
