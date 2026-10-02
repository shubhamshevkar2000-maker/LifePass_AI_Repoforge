import React from 'react';
import { InstitutionAuthProvider, useInstitutionAuth } from './context/InstitutionAuthContext';
import { InstitutionLoginView } from './components/InstitutionLoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { InstitutionDashboardFoundation } from './components/InstitutionDashboardFoundation';
import { AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/ui/Spinner';

const WebRouter: React.FC = () => {
  const { session, isMemberVerified, isLoading } = useInstitutionAuth();

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <Spinner size="lg" label="Verifying Institution Credentials..." />
        <p style={styles.loadingText}>Verifying Institution Credentials...</p>
      </div>
    );
  }

  // Unauthenticated -> Show Phone OTP login
  if (!session) {
    return (
      <div style={styles.centerContainer}>
        <InstitutionLoginView />
      </div>
    );
  }

  // Authenticated BUT not an active member in public.institution_members -> Access Denied
  if (!isMemberVerified) {
    return (
      <div style={styles.centerContainer}>
        <AccessDeniedView />
      </div>
    );
  }

  // Authenticated and verified active institution member -> Mount inside AppLayout
  return (
    <AppLayout>
      <InstitutionDashboardFoundation embedded />
    </AppLayout>
  );
};

export default function App() {
  return (
    <InstitutionAuthProvider>
      <WebRouter />
    </InstitutionAuthProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centerContainer: {
    minHeight: '100vh',
    backgroundColor: '#090D16',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    boxSizing: 'border-box',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#9CA3AF',
    fontSize: '0.875rem',
  },
};
