import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { InstitutionSidebar, NavTab } from './InstitutionSidebar';
import { InstitutionTopHeader } from './InstitutionTopHeader';
import { InstitutionDashboardView } from './InstitutionDashboardView';
import { ApplicationsListView } from './ApplicationsListView';
import { ApplicationDetailWorkspace } from './ApplicationDetailWorkspace';
import { CreateRequestView } from './CreateRequestView';
import { AuditLogView } from './AuditLogView';
import { SettingsView } from './SettingsView';

export const InstitutionDashboardFoundation: React.FC = () => {
  const { user, activeMembership, signOut } = useInstitutionAuth();
  const [activeNav, setActiveNav] = useState<NavTab>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const institutionDisplayName =
    activeMembership?.institution?.name || 'Demo Financial Institution (Demo Fixture)';
  const officerRole = activeMembership?.role || 'Officer (Demo)';

  const handleOpenRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveNav('applications');
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
  };

  const handleNavSelect = (tab: NavTab) => {
    setActiveNav(tab);
    if (tab !== 'applications') {
      setSelectedRequestId(null);
    }
  };

  // Determine top header breadcrumbs
  const getBreadcrumbs = () => {
    switch (activeNav) {
      case 'dashboard':
        return [{ label: 'Dashboard', active: true }];
      case 'applications':
        if (selectedRequestId) {
          return [
            {
              label: 'Applications / Requests',
              onClick: handleBackToList,
            },
            {
              label: selectedRequestId === 'req-edu-001' ? 'Application #LP-2026-8841 (Demo)' : `Request ${selectedRequestId}`,
              active: true,
            },
          ];
        }
        return [{ label: 'Applications / Requests', active: true }];
      case 'create_request':
        return [{ label: 'Create Request', active: true }];
      case 'audit':
        return [{ label: 'PostgreSQL Audit Log', active: true }];
      case 'settings':
        return [{ label: 'Settings & Security', active: true }];
    }
  };

  const getStatusBadge = () => {
    if (activeNav === 'applications' && selectedRequestId) {
      return {
        label: 'UNDER REVIEW (DEMO)',
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FDE68A',
      };
    }
    return undefined;
  };

  return (
    <div style={styles.layout}>
      {/* 1. Left Dark Navy Sidebar */}
      <InstitutionSidebar
        activeNav={activeNav}
        onSelectNav={handleNavSelect}
        institutionName={institutionDisplayName}
        officerRole={officerRole}
        officerPhone={user?.phone}
        onSignOut={signOut}
      />

      {/* 2. Main Content Column */}
      <div style={styles.mainContent}>
        {/* Top Header Bar */}
        <InstitutionTopHeader
          breadcrumbs={getBreadcrumbs()}
          statusBadge={getStatusBadge()}
          isDevFixture={true}
          onExportReport={() => alert('Demo institutional report generated for offline audit.')}
        />

        {/* Workspace Body */}
        <main style={styles.workspaceBody}>
          {activeNav === 'dashboard' && (
            <InstitutionDashboardView
              institutionName={institutionDisplayName}
              onOpenRequest={handleOpenRequest}
              onNavigateToCreate={() => setActiveNav('create_request')}
            />
          )}

          {activeNav === 'applications' && !selectedRequestId && (
            <ApplicationsListView
              onOpenRequest={handleOpenRequest}
              onNavigateToCreate={() => setActiveNav('create_request')}
            />
          )}

          {activeNav === 'applications' && selectedRequestId && (
            <ApplicationDetailWorkspace
              requestId={selectedRequestId}
              institutionName={institutionDisplayName}
              onBackToList={handleBackToList}
            />
          )}

          {activeNav === 'create_request' && (
            <CreateRequestView
              institutionName={institutionDisplayName}
              onOpenRequest={handleOpenRequest}
              onNavigateToApplications={() => {
                setSelectedRequestId(null);
                setActiveNav('applications');
              }}
            />
          )}

          {activeNav === 'audit' && <AuditLogView />}

          {activeNav === 'settings' && (
            <SettingsView institutionDisplayName={institutionDisplayName} />
          )}
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflowY: 'auto',
  },
  workspaceBody: {
    padding: '2rem',
    flex: 1,
  },
};
