import React from 'react';

export type NavTab = 'dashboard' | 'applications' | 'create_request' | 'audit' | 'settings';

interface InstitutionSidebarProps {
  activeNav: NavTab;
  onSelectNav: (tab: NavTab) => void;
  institutionName: string;
  officerRole: string;
  officerPhone?: string | null;
  onSignOut: () => void;
}

export const InstitutionSidebar: React.FC<InstitutionSidebarProps> = ({
  activeNav,
  onSelectNav,
  institutionName,
  officerRole,
  officerPhone,
  onSignOut,
}) => {
  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brandHeader}>
        <div style={styles.brandEmblem}>
          <div style={styles.emblemMarkBlue} />
          <div style={styles.emblemMarkGreen} />
        </div>
        <div>
          <div style={styles.brandTitle}>LifePass AI</div>
          <div style={styles.brandTag}>INSTITUTION PORTAL</div>
        </div>
      </div>

      {/* Navigation Items (CRITICAL: STRICT SPEC — NO Requirement Library sidebar item) */}
      <nav style={styles.navMenu}>
        <button
          type="button"
          style={{
            ...styles.navItem,
            ...(activeNav === 'dashboard' ? styles.navItemActive : {}),
          }}
          onClick={() => onSelectNav('dashboard')}
        >
          <span style={styles.navIcon}>📊</span>
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.navItem,
            ...(activeNav === 'applications' ? styles.navItemActive : {}),
          }}
          onClick={() => onSelectNav('applications')}
        >
          <span style={styles.navIcon}>📁</span>
          <span>Applications / Requests</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.navItem,
            ...(activeNav === 'create_request' ? styles.navItemActive : {}),
          }}
          onClick={() => onSelectNav('create_request')}
        >
          <span style={styles.navIcon}>➕</span>
          <span>Create Request</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.navItem,
            ...(activeNav === 'audit' ? styles.navItemActive : {}),
          }}
          onClick={() => onSelectNav('audit')}
        >
          <span style={styles.navIcon}>📜</span>
          <span>Audit Log</span>
        </button>

        <button
          type="button"
          style={{
            ...styles.navItem,
            ...(activeNav === 'settings' ? styles.navItemActive : {}),
          }}
          onClick={() => onSelectNav('settings')}
        >
          <span style={styles.navIcon}>⚙️</span>
          <span>Settings</span>
        </button>
      </nav>

      {/* Sidebar Footer: Officer & Institution Info */}
      <div style={styles.sidebarFooter}>
        <div style={styles.institutionCard}>
          <div style={styles.instName}>{institutionName}</div>
          <div style={styles.instMeta}>
            Role: <span style={styles.roleHighlight}>{officerRole}</span>
          </div>
          <div style={styles.officerId}>
            {officerPhone ? `Officer: ${officerPhone}` : 'Officer Identity: Verified (Demo)'}
          </div>
        </div>
        <button type="button" style={styles.signOutBtn} onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: '260px',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #1E293B',
    flexShrink: 0,
  },
  brandHeader: {
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid #1E293B',
  },
  brandEmblem: {
    width: '28px',
    height: '28px',
    position: 'relative',
  },
  emblemMarkBlue: {
    position: 'absolute',
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    backgroundColor: '#0284C7',
    top: 0,
    left: 0,
  },
  emblemMarkGreen: {
    position: 'absolute',
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    backgroundColor: '#10B981',
    bottom: 0,
    right: 0,
    opacity: 0.9,
  },
  brandTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  brandTag: {
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#94A3B8',
    letterSpacing: '0.08em',
  },
  navMenu: {
    padding: '1rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    borderRadius: '6px',
    color: '#94A3B8',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  navItemActive: {
    color: '#FFFFFF',
    backgroundColor: '#1E293B',
    fontWeight: 600,
  },
  navIcon: {
    fontSize: '1rem',
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  institutionCard: {
    backgroundColor: '#1E293B',
    padding: '0.75rem',
    borderRadius: '6px',
  },
  instName: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#F8FAFC',
    marginBottom: '0.25rem',
    lineHeight: 1.3,
  },
  instMeta: {
    fontSize: '0.6875rem',
    color: '#94A3B8',
  },
  roleHighlight: {
    color: '#38BDF8',
    fontWeight: 600,
  },
  officerId: {
    fontSize: '0.6875rem',
    color: '#64748B',
    marginTop: '0.25rem',
  },
  signOutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    color: '#94A3B8',
    padding: '0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};
