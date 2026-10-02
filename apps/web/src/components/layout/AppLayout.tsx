import React, { useState } from 'react';
import { useInstitutionAuth } from '../../context/InstitutionAuthContext';
import { useInstitutionRequests } from '../../context/InstitutionRequestContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { InstitutionRequestWizard } from '../institution/InstitutionRequestWizard';
import { InstitutionRequestDetailsModal } from '../institution/InstitutionRequestDetailsModal';
import './layout.css';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, activeMembership, signOut } = useInstitutionAuth();
  const {
    isCreateWizardOpen,
    openCreateWizard,
    closeCreateWizard,
    selectedRequestForDetails,
    closeRequestDetails,
  } = useInstitutionRequests();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const institutionName = activeMembership?.institution?.name || user?.institutionName || 'Verified Institution';
  const institutionType = activeMembership?.institution?.type || user?.institutionType || 'bank';
  const userPhone = user?.fullName ? `${user.fullName} (@${user.username})` : user?.username || user?.phone || undefined;
  const userRole = activeMembership?.role?.toUpperCase() || user?.role || 'OFFICER';

  return (
    <div className="lifepass-shell">
      {/* 1. Header */}
      <Header
        institutionName={institutionName}
        institutionType={institutionType}
        userPhone={userPhone}
        userRole={userRole}
        onSignOut={signOut}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* 2. Main Body: Sidebar + Main Content */}
      <div className="lifepass-body">
        {/* Sidebar Navigation */}
        <Sidebar
          onCreateRequestClick={openCreateWizard}
          isOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="lifepass-main" role="main">
          <div className="lifepass-main-inner">
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<{ onCreateRequestClick?: () => void }>, {
                  onCreateRequestClick: openCreateWizard,
                })
              : children}
          </div>
        </main>
      </div>

      {/* 3. Multi-Step Request Creation & Dispatch Wizard */}
      <InstitutionRequestWizard
        isOpen={isCreateWizardOpen}
        onClose={closeCreateWizard}
      />

      {/* 4. Global Request Details Modal */}
      <InstitutionRequestDetailsModal
        request={selectedRequestForDetails}
        onClose={closeRequestDetails}
      />
    </div>
  );
};
