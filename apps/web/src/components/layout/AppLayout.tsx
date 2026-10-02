import React, { useState } from 'react';
import { useInstitutionAuth } from '../../context/InstitutionAuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import './layout.css';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, activeMembership, signOut } = useInstitutionAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const institutionName = activeMembership?.institution?.name || 'Verified Institution';
  const institutionType = activeMembership?.institution?.type?.toUpperCase() || 'INSTITUTION';
  const userPhone = user?.phone || user?.email || undefined;
  const userRole = activeMembership?.role?.toUpperCase() || 'OFFICER';

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
          activeId={activeTab}
          onSelectNav={(id) => setActiveTab(id)}
          onCreateRequestClick={() => setIsCreateModalOpen(true)}
          isOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="lifepass-main" role="main">
          <div className="lifepass-main-inner">
            {activeTab === 'dashboard' && (
              <div>{children}</div>
            )}

            {activeTab === 'applications' && (
              <Card
                title="Applications & Requests"
                subtitle="Manage verification workflows dispatched to citizens"
                headerAction={<Badge variant="warning">Scheduled for Phase W-4</Badge>}
              >
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  The Applications table and detailed applicant checklist views will be connected in Phase W-4 in accordance with <code>docs/FRONTEND_SPEC.md</code> §10 & §13.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </Button>
              </Card>
            )}

            {activeTab === 'audit' && (
              <Card
                title="Compliance Audit Trail"
                subtitle="Historical log of request creation, dispatch, and record package access"
                headerAction={<Badge variant="warning">Scheduled for Phase W-6</Badge>}
              >
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  The Audit log table will be connected to <code>public.audit_events</code> in Phase W-6 in accordance with <code>docs/SECURITY_CONSENT.md</code> §10.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </Button>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card
                title="Institution Settings"
                subtitle="Organization credentials, registered member roster, and security parameters"
                headerAction={<Badge variant="warning">Scheduled for Phase W-6</Badge>}
              >
                <p style={{ color: '#9CA3AF', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                  Organization configuration and officer roster management will be connected in Phase W-6.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab('dashboard')}>
                  ← Back to Dashboard
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* 3. Create Request Modal (Primitive Verification) */}
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
                alert('Request creation form logic will be implemented in Phase W-3.');
                setIsCreateModalOpen(false);
              }}
            >
              Confirm Placeholder
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              color: '#CBD5E1',
              lineHeight: 1.4,
            }}
          >
            <strong>Phase W-1 Notice:</strong> This modal verifies that the reusable <code>Modal</code> primitive is fully accessible, traps body scroll, and responds to Escape key presses. The full requirement profile selection and applicant dispatch form will be implemented in Phase W-3.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1F2937', fontSize: '0.8125rem' }}>
            <span style={{ color: '#9CA3AF' }}>Target Institution</span>
            <span style={{ color: '#F9FAFB', fontWeight: 600 }}>{institutionName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1F2937', fontSize: '0.8125rem' }}>
            <span style={{ color: '#9CA3AF' }}>Requesting Officer</span>
            <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>{user?.phone || user?.id}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
