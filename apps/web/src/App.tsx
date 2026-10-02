import React from 'react';
import { InstitutionAuthProvider, useInstitutionAuth } from './context/InstitutionAuthContext';
import { InstitutionLoginView } from './components/InstitutionLoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { InstitutionDashboardFoundation } from './components/InstitutionDashboardFoundation';

const WebRouter: React.FC = () => {
  const { session, isMemberVerified, isLoading } = useInstitutionAuth();

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
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

  // Authenticated and verified active institution member -> Show Foundation Dashboard
  return <InstitutionDashboardFoundation />;
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
    backgroundColor: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    boxSizing: 'border-box',
  },
  spinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '3px solid #E2E8F0',
    borderTopColor: '#0284C7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748B',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
};
