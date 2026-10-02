import React from 'react';

interface InstitutionTopHeaderProps {
  breadcrumbs: { label: string; active?: boolean; onClick?: () => void }[];
  statusBadge?: { label: string; bg?: string; text?: string; border?: string };
  isDevFixture?: boolean;
  onExportReport?: () => void;
}

export const InstitutionTopHeader: React.FC<InstitutionTopHeaderProps> = ({
  breadcrumbs,
  statusBadge,
  isDevFixture = true,
  onExportReport,
}) => {
  return (
    <header style={styles.topHeader}>
      <div style={styles.headerLeft}>
        <div style={styles.breadcrumbList}>
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={styles.breadcrumbDivider}>›</span>}
              {b.onClick ? (
                <button
                  type="button"
                  style={b.active ? styles.breadcrumbCurrentBtn : styles.breadcrumbBtn}
                  onClick={b.onClick}
                >
                  {b.label}
                </button>
              ) : (
                <span style={b.active ? styles.breadcrumbCurrent : styles.breadcrumbMuted}>
                  {b.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {statusBadge && (
          <span
            style={{
              ...styles.statusPill,
              backgroundColor: statusBadge.bg || '#FEF3C7',
              color: statusBadge.text || '#92400E',
              borderColor: statusBadge.border || '#FDE68A',
            }}
          >
            {statusBadge.label}
          </span>
        )}

        {isDevFixture && (
          <span style={styles.fixturePill}>DEV FIXTURE</span>
        )}
      </div>

      <div style={styles.headerRight}>
        {onExportReport && (
          <button
            type="button"
            style={styles.headerSecondaryBtn}
            onClick={onExportReport}
          >
            📥 Export Report
          </button>
        )}
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  topHeader: {
    height: '64px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  breadcrumbList: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  breadcrumbDivider: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
  breadcrumbMuted: {
    fontSize: '0.875rem',
    color: '#64748B',
    fontWeight: 500,
  },
  breadcrumbCurrent: {
    fontSize: '0.875rem',
    color: '#0F172A',
    fontWeight: 700,
  },
  breadcrumbBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.875rem',
    color: '#0284C7',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  breadcrumbCurrentBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '0.875rem',
    color: '#0F172A',
    fontWeight: 700,
    cursor: 'default',
  },
  statusPill: {
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    border: '1px solid transparent',
  },
  fixturePill: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: '#78350F',
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    letterSpacing: '0.05em',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerSecondaryBtn: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#334155',
    padding: '0.45rem 0.875rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
};
