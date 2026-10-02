import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, BadgeProps } from '../ui/Badge';
import {
  VaultRecord,
  RecordStatus,
  calculateVaultMetrics,
  filterVaultRecords,
} from '../../services/recordVaultRepository';
import { RecordDetailsModal } from './RecordDetailsModal';
import { UploadRecordModal } from './UploadRecordModal';
import { theme } from '../../styles/theme';

export interface RecordVaultViewProps {
  records: VaultRecord[];
  onAddRecord: (record: VaultRecord) => void;
  onNavigateHomeForTask?: (record: VaultRecord) => void;
}

const CATEGORY_TABS = [
  'All',
  'Identity',
  'Education',
  'Employment',
  'Finance',
  'Healthcare',
  'Address',
] as const;

const statusBadgeProps: Record<RecordStatus, { variant: BadgeProps['variant']; label: string }> = {
  VERIFIED: { variant: 'success', label: 'VERIFIED' },
  PENDING: { variant: 'warning', label: 'PENDING' },
  NEEDS_REVIEW: { variant: 'danger', label: 'NEEDS REVIEW' },
  EXPIRED: { variant: 'neutral', label: 'EXPIRED' },
  REJECTED: { variant: 'danger', label: 'REJECTED' },
};

const categoryIcons: Record<string, string> = {
  Identity: '🪪',
  Education: '🎓',
  Employment: '💼',
  Finance: '💳',
  Healthcare: '🏥',
  Address: '🏡',
};

export const RecordVaultView: React.FC<RecordVaultViewProps> = ({
  records,
  onAddRecord,
  onNavigateHomeForTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecord, setSelectedRecord] = useState<VaultRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  // Compute live summary metrics
  const summary = useMemo(() => calculateVaultMetrics(records), [records]);

  // Compute filtered records
  const filteredRecords = useMemo(
    () => filterVaultRecords(records, searchQuery, selectedCategory),
    [records, searchQuery, selectedCategory]
  );

  const handleOpenDetails = (record: VaultRecord) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  const handleUseForTask = (record: VaultRecord) => {
    if (onNavigateHomeForTask) {
      onNavigateHomeForTask(record);
    } else {
      setActionNotification(`"${record.name}" selected for LifePass task readiness check.`);
      setTimeout(() => setActionNotification(null), 4000);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div style={styles.container}>
      {/* 1. HEADER SECTION */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.headerTitleLine}>
            <h1 style={styles.title}>Personal Record Vault</h1>
            <Badge variant="info" size="md">
              DEMO VAULT
            </Badge>
          </div>
          <p style={styles.subtitle}>
            Manage and organize your documents for task readiness checks and permissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsUploadOpen(true)}
          style={styles.addRecordBtn}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
          <span>Add Record</span>
        </Button>
      </div>

      {/* Action Notification Banner */}
      {actionNotification && (
        <div style={styles.notificationBanner}>
          <span style={{ fontSize: '1rem' }}>✨</span>
          <span style={{ flex: 1 }}>{actionNotification}</span>
          <button
            type="button"
            onClick={() => setActionNotification(null)}
            style={styles.notificationClose}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. SUMMARY METRICS (4 Clean Light Cards) */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Total Vault Records</span>
            <span style={styles.metricIcon}>📁</span>
          </div>
          <div style={styles.metricValue}>{summary.total}</div>
          <span style={styles.metricSub}>All stored documents & proofs</span>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Verified Records</span>
            <span style={styles.metricIcon}>✅</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.colors.successText }}>
            {summary.verified}
          </div>
          <span style={styles.metricSub}>Marked verified in demo state</span>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Pending Verification</span>
            <span style={styles.metricIcon}>⏳</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.colors.warningText }}>
            {summary.pending}
          </div>
          <span style={styles.metricSub}>Pending review or match</span>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricHeader}>
            <span style={styles.metricLabel}>Needs Review</span>
            <span style={styles.metricIcon}>⚠️</span>
          </div>
          <div style={{ ...styles.metricValue, color: theme.colors.dangerText }}>
            {summary.needsReview}
          </div>
          <span style={styles.metricSub}>Action or renewal recommended</span>
        </div>
      </div>

      {/* 3. SEARCH & CATEGORY FILTER TOOLBAR */}
      <Card style={styles.filterCard}>
        <div style={styles.filterControls}>
          {/* Search Box */}
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records by name, type, source, or keywords..."
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Records Counter */}
          <div style={styles.countText}>
            Showing <strong style={{ color: theme.colors.textPrimary }}>{filteredRecords.length}</strong> of{' '}
            {records.length} records
          </div>
        </div>

        {/* Category Pills */}
        <div style={styles.pillsContainer}>
          <span style={styles.pillsLabel}>Category:</span>
          <div style={styles.pillsRow}>
            {CATEGORY_TABS.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={isActive ? styles.pillActive : styles.pill}
                >
                  {cat !== 'All' && <span>{categoryIcons[cat] || '📄'}</span>}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 4. RECORDS LIST / GRID */}
      {filteredRecords.length > 0 ? (
        <div style={styles.recordsGrid}>
          {filteredRecords.map((record) => {
            const statusConfig = statusBadgeProps[record.status] || {
              variant: 'neutral',
              label: record.status,
            };
            const icon = categoryIcons[record.category] || '📄';

            return (
              <Card key={record.id} style={styles.recordCard}>
                {/* Card Header */}
                <div style={styles.recordHeader}>
                  <div style={styles.recordIconBox}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.recordTitleRow}>
                      <h3 style={styles.recordName} title={record.name}>
                        {record.name}
                      </h3>
                    </div>
                    <div style={styles.recordSubRow}>
                      <Badge variant="info" size="sm">
                        {record.category}
                      </Badge>
                      <span style={styles.recordType}>{record.type}</span>
                    </div>
                  </div>
                  <Badge variant={statusConfig.variant} size="sm">
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Card Meta Details */}
                <div style={styles.recordMetaBody}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaKey}>Source:</span>
                    <span style={styles.metaVal}>{record.source}</span>
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaKey}>Added:</span>
                    <span style={styles.metaVal}>{record.addedAt}</span>
                  </div>

                  <div style={styles.metaRow}>
                    <span style={styles.metaKey}>File:</span>
                    <span style={styles.metaFileName} title={record.fileName}>
                      {record.fileName}
                    </span>
                  </div>
                </div>

                {/* Description snippet if present */}
                {record.description && (
                  <p style={styles.recordDescSnippet}>{record.description}</p>
                )}

                {/* Card Actions Footer */}
                <div style={styles.cardActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenDetails(record)}
                    style={{ flex: 1 }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUseForTask(record)}
                    style={styles.useTaskBtn}
                  >
                    Use for Task →
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* 5. EMPTY STATE */
        <div style={styles.emptyStateContainer}>
          <div style={styles.emptyIcon}>📂</div>
          <h3 style={styles.emptyTitle}>No records found</h3>
          <p style={styles.emptySubtitle}>
            {searchQuery || selectedCategory !== 'All'
              ? `No records match your criteria (Search: "${searchQuery || 'None'}", Category: "${selectedCategory}").`
              : 'Your vault is currently empty.'}
          </p>
          <div style={styles.emptyActions}>
            {(searchQuery || selectedCategory !== 'All') && (
              <Button variant="secondary" size="md" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsUploadOpen(true)}
            >
              + Add First Record
            </Button>
          </div>
        </div>
      )}

      {/* 6. MODALS */}
      <RecordDetailsModal
        record={selectedRecord}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRecord(null);
        }}
        onUseForTask={handleUseForTask}
      />

      <UploadRecordModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddRecord={onAddRecord}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  headerTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '0.375rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9375rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  addRecordBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: theme.shadows.sm,
  },
  notificationBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: theme.colors.infoBg,
    border: `1px solid ${theme.colors.infoBorder}`,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: theme.colors.infoText,
    fontWeight: 500,
  },
  notificationClose: {
    background: 'none',
    border: 'none',
    color: theme.colors.infoText,
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.625rem',
    padding: '1.25rem',
    boxShadow: theme.shadows.xs,
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  metricLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  metricIcon: {
    fontSize: '1.125rem',
  },
  metricValue: {
    fontSize: '1.875rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.02em',
    marginBottom: '0.25rem',
  },
  metricSub: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  filterCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem 1.25rem',
    backgroundColor: theme.colors.surface,
  },
  filterControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 340px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    fontSize: '0.875rem',
    color: theme.colors.textMuted,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '2.5rem',
    padding: '0 2rem 0 2.25rem',
    backgroundColor: theme.colors.pageBg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: theme.colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: theme.typography.fontFamily,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '0.625rem',
    background: 'none',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '0.875rem',
  },
  countText: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
  },
  pillsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    paddingTop: '0.5rem',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  pillsLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  pillsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: theme.colors.pageBg,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textSecondary,
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  pillActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '9999px',
    backgroundColor: theme.colors.primary,
    border: `1px solid ${theme.colors.primary}`,
    color: theme.colors.textInverse,
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: theme.shadows.xs,
  },
  recordsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  recordCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1.25rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.625rem',
    boxShadow: theme.shadows.xs,
    transition: 'border-color 0.15s ease',
  },
  recordHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.875rem',
  },
  recordIconBox: {
    fontSize: '1.5rem',
    lineHeight: 1,
    padding: '0.375rem',
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.borderLight}`,
  },
  recordTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordName: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0 0 0.25rem 0',
    lineHeight: 1.3,
  },
  recordSubRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  recordType: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  recordMetaBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    backgroundColor: theme.colors.pageBg,
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.borderLight}`,
    marginBottom: '0.75rem',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
  },
  metaKey: {
    color: theme.colors.textMuted,
    fontWeight: 500,
  },
  metaVal: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
    textAlign: 'right',
  },
  metaFileName: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontMono,
    fontSize: '0.6875rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
  },
  recordDescSnippet: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
    margin: '0 0 0.875rem 0',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  useTaskBtn: {
    color: theme.colors.primary,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  emptyStateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3.5rem 1.5rem',
    backgroundColor: theme.colors.surface,
    border: `1px dashed ${theme.colors.border}`,
    borderRadius: '0.75rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    lineHeight: 1,
    marginBottom: '1rem',
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0 0 0.5rem 0',
  },
  emptySubtitle: {
    fontSize: '0.875rem',
    color: theme.colors.textSecondary,
    maxWidth: '460px',
    lineHeight: 1.5,
    margin: '0 0 1.5rem 0',
  },
  emptyActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
};
