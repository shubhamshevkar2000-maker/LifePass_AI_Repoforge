import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface HeaderProps {
  institutionName?: string;
  institutionType?: string;
  userPhone?: string;
  userRole?: string;
  onSignOut: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  institutionName = 'Verified Institution',
  institutionType = 'INSTITUTION',
  userPhone,
  userRole = 'MEMBER',
  onSignOut,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  return (
    <header className="lifepass-header" role="banner">
      {/* Left: Hamburger & Brand */}
      <div className="lifepass-header-left">
        <button
          type="button"
          className="lifepass-hamburger"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '0.375rem',
              background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.8125rem',
              color: '#090D16',
              boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)',
            }}
          >
            LP
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#F9FAFB',
                }}
              >
                LifePass AI
              </span>
              <Badge variant="info" size="sm">
                PORTAL
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Institution Details, Officer Identity, Sign Out */}
      <div className="lifepass-header-right">
        {/* Institution Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="success" size="sm">
            {institutionType}
          </Badge>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#F9FAFB',
              maxWidth: '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={institutionName}
          >
            {institutionName}
          </span>
        </div>

        {/* Officer Identity (hidden on narrow screens via CSS) */}
        <div
          className="lifepass-header-officer-text"
          style={{
            borderLeft: '1px solid #1F2937',
            paddingLeft: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Officer</span>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#E5E7EB',
            }}
          >
            {userPhone || userRole}
          </span>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onSignOut}
          title="Sign out of portal"
        >
          Sign Out
        </Button>
      </div>
    </header>
  );
};
