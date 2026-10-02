import React from 'react';
import { InstitutionAuthProvider, useInstitutionAuth } from './context/InstitutionAuthContext';
import { LandingRoleSelectionView } from './components/LandingRoleSelectionView';
import { IndividualAuthView } from './components/IndividualAuthView';
import { InstitutionLoginView } from './components/InstitutionLoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { InstitutionDashboardFoundation } from './components/InstitutionDashboardFoundation';
import { IndividualDashboardFoundation } from './components/IndividualDashboardFoundation';
import { AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/ui/Spinner';

const WebRouter: React.FC = () => {
  const { session, user, isMemberVerified, isLoading, selectedPortal } = useInstitutionAuth();

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <Spinner size="lg" label="Initializing LifePass Platform..." />
        <p style={styles.loadingText}>Initializing LifePass Platform...</p>
      </div>
    );
  }

  // 1. Unauthenticated -> Route based on selectedPortal
  if (!session || !user) {
    if (selectedPortal === 'individual') {
      return (
        <div style={styles.centerContainer}>
          <IndividualAuthView />
        </div>
      );
    }

    if (selectedPortal === 'institution') {
      return (
        <div style={styles.centerContainer}>
          <InstitutionLoginView />
        </div>
      );
    }

    // Default entry is the two-sided Landing Screen
    return (
      <div style={styles.landingContainer}>
        <LandingRoleSelectionView />
      </div>
    );
  }

  // 2. Authenticated as Individual -> Individual Responsive Web Dashboard
  if (user.userType === 'INDIVIDUAL') {
    return <IndividualDashboardFoundation />;
  }

  // 3. Authenticated as Institution Member -> Verify institution membership
  if (!isMemberVerified) {
    return (
      <div style={styles.centerContainer}>
        <AccessDeniedView />
      </div>
    );
  }

  // 4. Authenticated & verified Institution Officer -> Mount inside AppLayout
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
  landingContainer: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    boxSizing: 'border-box',
  },
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
  loadingText: {
    marginTop: '1rem',
    color: '#64748B',
    fontSize: '0.875rem',
  },
};
