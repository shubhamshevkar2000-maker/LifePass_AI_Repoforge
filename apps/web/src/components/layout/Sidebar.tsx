import React from 'react';
import { Button } from '../ui/Button';
import { theme } from '../../styles/theme';

export interface NavItem {
  id: string;
  label: string;
  iconSymbol: string;
  badge?: string;
}

export interface SidebarProps {
  activeId: string;
  onSelectNav: (id: string) => void;
  onCreateRequestClick: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconSymbol: '📊' },
  { id: 'applications', label: 'Applications', iconSymbol: '📁' },
  { id: 'audit', label: 'Audit Log', iconSymbol: '🛡️' },
  { id: 'settings', label: 'Settings', iconSymbol: '⚙️' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeId,
  onSelectNav,
  onCreateRequestClick,
  isOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="lifepass-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`lifepass-sidebar ${isOpen ? 'is-open' : ''}`}
        aria-label="Institution Portal Navigation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Top CTA: Create Request */}
          <div style={{ paddingBottom: '0.5rem', borderBottom: `1px solid ${theme.colors.borderLight}` }}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                onCreateRequestClick();
                onCloseMobile();
              }}
              icon={<span style={{ fontSize: '1rem', fontWeight: 800 }}>+</span>}
            >
              Create Request
            </Button>
          </div>

          {/* Navigation Links */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`lifepass-nav-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    onSelectNav(item.id);
                    onCloseMobile();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span style={{ fontSize: '1.125rem' }} role="img" aria-hidden="true">
                    {item.iconSymbol}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Boundary Notice */}
        <div
          style={{
            paddingTop: '1rem',
            borderTop: `1px solid ${theme.colors.borderLight}`,
            fontSize: '0.6875rem',
            color: theme.colors.textMuted,
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 600, color: theme.colors.textSecondary, marginBottom: '0.25rem' }}>
            Portal Preview Active
          </div>
          <div>Secure institution access will be connected during final platform integration.</div>
        </div>
      </aside>
    </>
  );
};
