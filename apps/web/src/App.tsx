import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { InstitutionAuthProvider, useInstitutionAuth } from './context/InstitutionAuthContext';
import { InstitutionRequestProvider } from './context/InstitutionRequestContext';
import { LandingRoleSelectionView } from './components/LandingRoleSelectionView';
import { IndividualAuthView } from './components/IndividualAuthView';
import { InstitutionLoginView } from './components/InstitutionLoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { IndividualDashboardFoundation } from './components/IndividualDashboardFoundation';
import { AppLayout } from './components/layout/AppLayout';
import { InstitutionDashboardView } from './components/institution/InstitutionDashboardView';
import { InstitutionRequestsView } from './components/institution/InstitutionRequestsView';
import { InstitutionAuditView } from './components/institution/InstitutionAuditView';
import { InstitutionSettingsView } from './components/institution/InstitutionSettingsView';
import { Spinner } from './components/ui/Spinner';

/**
 * Protected wrapper for Institution Portal routes
 */
const InstitutionRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user, isMemberVerified, isLoading } = useInstitutionAuth();

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <Spinner size="lg" label="Initializing LifePass Institution Portal..." />
        <p style={styles.loadingText}>Initializing LifePass Institution Portal...</p>
      </div>
    );
  }

  // 1. Unauthenticated -> Redirect to Institution Login
  if (!session || !user) {
    return <Navigate to="/institution/login" replace />;
  }

  // 2. Individual user trying to access Institution portal -> Redirect to Individual dashboard
  if (user.userType === 'INDIVIDUAL') {
    return <Navigate to="/individual" replace />;
  }

  // 3. Institution membership not verified -> Access Denied view
  if (!isMemberVerified) {
    return (
      <div style={styles.centerContainer}>
        <AccessDeniedView />
      </div>
    );
  }

  // 4. Authenticated & verified Institution Officer -> Mount inside AppLayout
  return <AppLayout>{children}</AppLayout>;
};

const WebRouter: React.FC = () => {
  const { session, user, isLoading, selectedPortal } = useInstitutionAuth();

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <Spinner size="lg" label="Initializing LifePass Platform..." />
        <p style={styles.loadingText}>Initializing LifePass Platform...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 1. Root / Landing Selection Route */}
      <Route
        path="/"
        element={
          session && user ? (
            user.userType === 'INDIVIDUAL' ? (
              <Navigate to="/individual" replace />
            ) : (
              <Navigate to="/institution/dashboard" replace />
            )
          ) : selectedPortal === 'individual' ? (
            <Navigate to="/individual" replace />
          ) : selectedPortal === 'institution' ? (
            <Navigate to="/institution/login" replace />
          ) : (
            <div style={styles.landingContainer}>
              <LandingRoleSelectionView />
            </div>
          )
        }
      />

      {/* 2. Individual Experience (Auth or Responsive Dashboard) */}
      <Route
        path="/individual"
        element={
          session && user && user.userType === 'INDIVIDUAL' ? (
            <IndividualDashboardFoundation />
          ) : session && user && user.userType === 'INSTITUTION' ? (
            <Navigate to="/institution/dashboard" replace />
          ) : (
            <div style={styles.centerContainer}>
              <IndividualAuthView />
            </div>
          )
        }
      />
      <Route
        path="/individual/*"
        element={<Navigate to="/individual" replace />}
      />

      {/* 3. Institution Authentication Route */}
      <Route
        path="/institution/login"
        element={
          session && user ? (
            user.userType === 'INSTITUTION' ? (
              <Navigate to="/institution/dashboard" replace />
            ) : (
              <Navigate to="/individual" replace />
            )
          ) : (
            <div style={styles.centerContainer}>
              <InstitutionLoginView />
            </div>
          )
        }
      />

      {/* 4. Institution Protected Portal Routes */}
      <Route
        path="/institution"
        element={<Navigate to="/institution/dashboard" replace />}
      />
      <Route
        path="/institution/dashboard"
        element={
          <InstitutionRoute>
            <InstitutionDashboardView />
          </InstitutionRoute>
        }
      />
      <Route
        path="/institution/requests"
        element={
          <InstitutionRoute>
            <InstitutionRequestsView />
          </InstitutionRoute>
        }
      />
      <Route
        path="/institution/audit"
        element={
          <InstitutionRoute>
            <InstitutionAuditView />
          </InstitutionRoute>
        }
      />
      <Route
        path="/institution/settings"
        element={
          <InstitutionRoute>
            <InstitutionSettingsView />
          </InstitutionRoute>
        }
      />
      <Route
        path="/institution/*"
        element={<Navigate to="/institution/dashboard" replace />}
      />

      {/* 5. Fallback Route */}
      <Route
        path="*"
        element={
          session && user ? (
            user.userType === 'INDIVIDUAL' ? (
              <Navigate to="/individual" replace />
            ) : (
              <Navigate to="/institution/dashboard" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <InstitutionAuthProvider>
      <InstitutionRequestProvider>
        <BrowserRouter>
          <WebRouter />
        </BrowserRouter>
      </InstitutionRequestProvider>
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
