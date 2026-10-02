import React, { useState, useEffect, useCallback } from 'react';
import {
  AuditEventItem,
  fetchInstitutionAuditEvents,
} from '../services/institutionService';

export const AuditLogView: React.FC = () => {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAuditEvents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await fetchInstitutionAuditEvents();
    if (result.error) {
      setErrorMessage(result.error.message || 'Unable to retrieve audit log.');
    } else if (result.data) {
      setEvents(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadAuditEvents();
  }, [loadAuditEvents]);

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    if (filterType === 'consents') return ev.entityType === 'consent' || ev.eventType.includes('consent');
    if (filterType === 'records') return ev.entityType === 'record' || ev.eventType.includes('record');
    if (filterType === 'requests') return ev.entityType === 'access_request' || ev.eventType.includes('request');
    return true;
  });

  if (isLoading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Retrieving PostgreSQL audit events...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Failed to Load Audit Log</h3>
        <p style={styles.errorText}>{errorMessage}</p>
        <button type="button" style={styles.retryBtn} onClick={loadAuditEvents}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.pageHeading}>PostgreSQL Audit Log (public.audit_events)</h2>
        <p style={styles.pageSubheading}>
          Append-only database event log tracking officer document access, consent grants, and policy evaluations per docs/DATABASE_SCHEMA.md Section 6.
        </p>
      </div>

      {/* Governance Banner */}
      <div style={styles.governanceNotice}>
        <div style={styles.govTitle}>🛡️ Audit Architecture & Integrity Notice</div>
        <div style={styles.govText}>
          LifePass maintains a strict, append-only PostgreSQL database event log protected by Row Level Security (RLS).
          Every officer document view and citizen consent grant is recorded with immutable timestamps and actor IDs.
          The audit system is database-enforced and contains no third-party blockchains or fictitious hash ledgers.
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        {(
          [
            { label: 'All Events', value: 'all' },
            { label: 'Consent Events', value: 'consents' },
            { label: 'Document Accesses', value: 'records' },
            { label: 'Request & Policy', value: 'requests' },
          ] as const
        ).map((tab) => {
          const isActive = filterType === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              style={{
                ...styles.filterPill,
                ...(isActive ? styles.filterPillActive : {}),
              }}
              onClick={() => setFilterType(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Audit Events Table */}
      <div style={styles.tableCard}>
        {filteredEvents.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>No audit events recorded for this category.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Timestamp (UTC)</th>
                  <th style={styles.th}>Actor</th>
                  <th style={styles.th}>Event Type</th>
                  <th style={styles.th}>Entity Type</th>
                  <th style={styles.th}>Entity / Request ID</th>
                  <th style={styles.th}>Details & Purpose Context</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} style={styles.tableBodyRow}>
                    <td style={styles.tdMono}>{ev.timestamp}</td>
                    <td style={styles.tdBold}>{ev.actor}</td>
                    <td style={styles.td}>
                      <span style={styles.auditActionTag}>{ev.eventType}</span>
                    </td>
                    <td style={styles.tdMuted}>{ev.entityType}</td>
                    <td style={styles.tdMonoSub}>{ev.entityId || '—'}</td>
                    <td style={styles.td}>{ev.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  centerContainer: {
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '3px solid #E2E8F0',
    borderTopColor: '#0284C7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748B',
    fontSize: '0.875rem',
  },
  errorContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '2.5rem',
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  errorTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#DC2626',
    margin: '0 0 0.5rem 0',
  },
  errorText: {
    fontSize: '0.875rem',
    color: '#64748B',
    marginBottom: '1.5rem',
  },
  retryBtn: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  header: {
    marginBottom: '0.25rem',
  },
  pageHeading: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  pageSubheading: {
    fontSize: '0.875rem',
    color: '#64748B',
    marginTop: '0.25rem',
    lineHeight: 1.4,
  },
  governanceNotice: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
  },
  govTitle: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '0.25rem',
  },
  govText: {
    fontSize: '0.75rem',
    color: '#475569',
    lineHeight: 1.5,
  },
  filterRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '0.375rem 0.875rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#475569',
    cursor: 'pointer',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableBodyRow: {
    borderBottom: '1px solid #F1F5F9',
  },
  tdMono: {
    padding: '0.875rem 1rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#0F172A',
    fontWeight: 500,
  },
  tdMonoSub: {
    padding: '0.875rem 1rem',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#64748B',
  },
  tdBold: {
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#0F172A',
  },
  td: {
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    color: '#334155',
  },
  tdMuted: {
    padding: '0.875rem 1rem',
    fontSize: '0.75rem',
    color: '#64748B',
  },
  auditActionTag: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 700,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    padding: '3rem',
    textAlign: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: '0.875rem',
  },
};
