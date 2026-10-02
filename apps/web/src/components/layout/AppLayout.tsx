import React, { useState } from 'react';
import { useInstitutionAuth } from '../../context/InstitutionAuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';
import './layout.css';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, activeMembership, signOut } = useInstitutionAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

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
          onCreateRequestClick={() => setIsCreateModalOpen(true)}
          isOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="lifepass-main" role="main">
          <div className="lifepass-main-inner">
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<{ onCreateRequestClick?: () => void }>, {
                  onCreateRequestClick: () => setIsCreateModalOpen(true),
                })
              : children}
          </div>
        </main>
      </div>

      {/* 3. Create Request Modal (W-2 Deferred / W-3 Preview) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Verification Request"
        description="Select an applicant and attach a canonical requirement profile."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert('Request creation workflow will be implemented in Phase W-3.');
                setIsCreateModalOpen(false);
              }}
            >
              Acknowledge (W-3 Preview)
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: theme.colors.surfaceAccent,
              border: `1px solid ${theme.colors.primaryBorder}`,
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              color: theme.colors.textPrimary,
              lineHeight: 1.4,
            }}
          >
            <strong>Phase W-3 Notice:</strong> The interactive requirement profile selection, candidate dispatch, and custom document request wizard will be implemented in Phase W-3. Create Request is intentionally deferred in Phase W-2.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.colors.borderLight}`, fontSize: '0.8125rem' }}>
            <span style={{ color: theme.colors.textSecondary }}>Target Institution</span>
            <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{institutionName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${theme.colors.borderLight}`, fontSize: '0.8125rem' }}>
            <span style={{ color: theme.colors.textSecondary }}>Authorizing Officer</span>
            <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>{user?.fullName || user?.username || 'Verified Officer'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.8125rem' }}>
            <span style={{ color: theme.colors.textSecondary }}>Dispatch Mode</span>
            <span style={{ color: theme.colors.primary, fontWeight: 600 }}>Citizen LifePass Web Inbox</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
