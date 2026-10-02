import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { theme } from '../styles/theme';
import { RecordVaultView } from './vault/RecordVaultView';
import { AskLifePassView } from './task/AskLifePassView';
import {
  VaultRecord,
  INITIAL_DEMO_RECORDS,
  calculateVaultMetrics,
} from '../services/recordVaultRepository';

export const IndividualDashboardFoundation: React.FC = () => {
  const { user, signOut } = useInstitutionAuth();
  const [taskInput, setTaskInput] = useState('I want to apply for university admission');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'education' | 'employment' | 'finance' | 'healthcare'>('all');
  const [selectedTask, setSelectedTask] = useState<'college' | 'loan' | 'job' | 'hospital'>('college');
  const [activeNav, setActiveNav] = useState<'home' | 'records' | 'ask' | 'permissions' | 'profile'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [records, setRecords] = useState<VaultRecord[]>(INITIAL_DEMO_RECORDS);

  const vaultMetrics = calculateVaultMetrics(records);

  const handleAddRecord = (newRecord: VaultRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleNavigateHomeForTask = (record: VaultRecord) => {
    setActiveNav('ask');
    if (record.category === 'Education') {
      setTaskInput('I want to apply for university admission');
    } else if (record.category === 'Finance') {
      setTaskInput('I need to apply for an educational loan for college');
    } else if (record.category === 'Employment') {
      setTaskInput('I am applying for a software engineering job');
    } else if (record.category === 'Healthcare') {
      setTaskInput('I need to arrange hospital admission and insurance');
    } else {
      setTaskInput('I want to apply for university admission');
    }
  };

  // Normalize display name to a clean, non-email mock identity
  let displayName = user?.fullName || user?.username || 'Shubham';
  if (displayName.includes('@')) {
    displayName = 'Shubham';
  }

  return (
    <div style={styles.container}>
      {/* 1. TOP NAVBAR */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.mobileMenuButton}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <div style={styles.brandRow}>
            <div style={styles.logoMark}>LP</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={styles.brandTitle}>LifePass AI</span>
                <Badge variant="info" size="sm">
                  INDIVIDUAL VAULT
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={styles.navLinks}>
          <button
            type="button"
            onClick={() => setActiveNav('home')}
            style={activeNav === 'home' ? styles.navItemActive : styles.navItem}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('records')}
            style={activeNav === 'records' ? styles.navItemActive : styles.navItem}
          >
            My Records
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('ask')}
            style={activeNav === 'ask' ? styles.navItemActive : styles.navItem}
          >
            Ask LifePass
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('permissions')}
            style={activeNav === 'permissions' ? styles.navItemActive : styles.navItem}
          >
            Shared / Permissions
          </button>
          <button
            type="button"
            onClick={() => setActiveNav('profile')}
            style={activeNav === 'profile' ? styles.navItemActive : styles.navItem}
          >
            Profile
          </button>
        </nav>

        {/* User Identity Chip & Sign Out */}
        <div style={styles.headerRight}>
          <div style={styles.userChip}>
            <div style={styles.userAvatar}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{displayName}</span>
              <span style={styles.userRole}>Verified Account</span>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Mobile Drawer (Responsive Navigation) */}
      {isMobileMenuOpen && (
        <div style={styles.mobileNavDrawer}>
          <button
            type="button"
            onClick={() => { setActiveNav('home'); setIsMobileMenuOpen(false); }}
            style={activeNav === 'home' ? styles.mobileNavItemActive : styles.mobileNavItem}
          >
            🏠 Home
          </button>
          <button
            type="button"
            onClick={() => { setActiveNav('records'); setIsMobileMenuOpen(false); }}
            style={activeNav === 'records' ? styles.mobileNavItemActive : styles.mobileNavItem}
          >
            📁 My Records
          </button>
          <button
            type="button"
            onClick={() => { setActiveNav('ask'); setIsMobileMenuOpen(false); }}
            style={activeNav === 'ask' ? styles.mobileNavItemActive : styles.mobileNavItem}
          >
            ✨ Ask LifePass AI
          </button>
          <button
            type="button"
            onClick={() => { setActiveNav('permissions'); setIsMobileMenuOpen(false); }}
            style={activeNav === 'permissions' ? styles.mobileNavItemActive : styles.mobileNavItem}
          >
            🛡️ Shared / Permissions
          </button>
          <button
            type="button"
            onClick={() => { setActiveNav('profile'); setIsMobileMenuOpen(false); }}
            style={activeNav === 'profile' ? styles.mobileNavItemActive : styles.mobileNavItem}
          >
            👤 Profile
          </button>
        </div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main style={styles.main}>
        {activeNav === 'records' ? (
          <RecordVaultView
            records={records}
            onAddRecord={handleAddRecord}
            onNavigateHomeForTask={handleNavigateHomeForTask}
          />
        ) : activeNav === 'ask' ? (
          <AskLifePassView
            initialTaskInput={taskInput}
            records={records}
            onAddRecord={handleAddRecord}
            onNavigateVault={() => setActiveNav('records')}
          />
        ) : (
          <>
            {/* Hero Section */}
            <section style={styles.heroSection}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={styles.greetingTitle}>Hello, {displayName}</h1>
            <p style={styles.greetingSubtitle}>
              Your verified records, for every next step.
            </p>
          </div>

          {/* AI Task Input Box */}
          <Card style={styles.taskInputCard}>
            <label style={styles.taskLabel}>
              <span style={{ fontSize: '1rem', color: theme.colors.primary }}>✨</span>
              <span>What are you trying to accomplish?</span>
            </label>
            <div style={styles.taskInputRow}>
              <div style={styles.inputWrapper}>
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g. I want to apply for university admission, educational loan, or employment..."
                  style={styles.taskTextInput}
                />
              </div>
              <Button
                variant="primary"
                size="md"
                style={styles.askButton}
                onClick={() => {
                  setActiveNav('ask');
                }}
              >
                Check Requirements
              </Button>
            </div>
            <div style={styles.aiHintText}>
              LifePass AI analyzes institutional prerequisites, verifies vault match readiness, and preserves user privacy.
            </div>
          </Card>
        </section>

        {/* 3. RECORD SUMMARY METRICS (4 Clean Cards) */}
        <section style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Verified Records</span>
              <span style={styles.metricIcon}>✅</span>
            </div>
            <div style={styles.metricValue}>{vaultMetrics.verified}</div>
            <span style={styles.metricSub}>Identity, Education, Finance</span>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Pending Verification</span>
              <span style={styles.metricIcon}>⏳</span>
            </div>
            <div style={{ ...styles.metricValue, color: theme.colors.warningText }}>
              {vaultMetrics.pending}
            </div>
            <span style={styles.metricSub}>Provisional document under review</span>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Active Permissions</span>
              <span style={styles.metricIcon}>🛡️</span>
            </div>
            <div style={styles.metricValue}>1</div>
            <span style={styles.metricSub}>Apex National University (Scoped)</span>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>Recent Accesses</span>
              <span style={styles.metricIcon}>👁️</span>
            </div>
            <div style={styles.metricValue}>2</div>
            <span style={styles.metricSub}>Logged in immutable audit trail</span>
          </div>
        </section>

        {/* 4. LIFE-STAGE CATEGORIES */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Life-Stage Categories</h2>
              <p style={styles.sectionSub}>Select a category to filter goal-oriented record workflows</p>
            </div>
          </div>

          <div style={styles.categoriesGrid}>
            <button
              type="button"
              onClick={() => { setSelectedCategory('education'); setSelectedTask('college'); }}
              style={selectedCategory === 'education' ? styles.catCardActive : styles.catCard}
            >
              <span style={styles.catIcon}>🎓</span>
              <div style={styles.catInfo}>
                <div style={styles.catTitle}>Education</div>
                <div style={styles.catDesc}>University enrollment, degrees & marksheets</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedCategory('employment'); setSelectedTask('job'); }}
              style={selectedCategory === 'employment' ? styles.catCardActive : styles.catCard}
            >
              <span style={styles.catIcon}>💼</span>
              <div style={styles.catInfo}>
                <div style={styles.catTitle}>Employment</div>
                <div style={styles.catDesc}>Job applications, KYC & experience letters</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedCategory('finance'); setSelectedTask('loan'); }}
              style={selectedCategory === 'finance' ? styles.catCardActive : styles.catCard}
            >
              <span style={styles.catIcon}>🏦</span>
              <div style={styles.catInfo}>
                <div style={styles.catTitle}>Finance</div>
                <div style={styles.catDesc}>Education loans, income proofs & banking</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedCategory('healthcare'); setSelectedTask('hospital'); }}
              style={selectedCategory === 'healthcare' ? styles.catCardActive : styles.catCard}
            >
              <span style={styles.catIcon}>🏥</span>
              <div style={styles.catInfo}>
                <div style={styles.catTitle}>Healthcare</div>
                <div style={styles.catDesc}>Hospital admission, insurance & health records</div>
              </div>
            </button>
          </div>
        </section>

        {/* 5. SUGGESTED TASKS / WORKFLOWS */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Suggested Tasks</h2>
              <p style={styles.sectionSub}>Select a task to inspect vault readiness and requirement matching</p>
            </div>
          </div>

          <div style={styles.taskGrid}>
            {/* Task 1: College Admission (Primary Hackathon Demo) */}
            <div
              onClick={() => setSelectedTask('college')}
              style={{
                ...styles.taskCard,
                ...(selectedTask === 'college' ? styles.taskCardSelected : {}),
              }}
            >
              <div style={styles.taskCardTop}>
                <Badge variant="info" size="sm">
                  PRIMARY DEMO
                </Badge>
                <span style={styles.taskIcon}>🎓</span>
              </div>
              <h3 style={styles.taskHeading}>College Admission</h3>
              <p style={styles.taskDesc}>University enrollment, academic certificates & identity verification</p>
              <div style={styles.taskMeta}>
                <span style={styles.readinessTagSuccess}>80% Readiness</span>
                <span style={styles.itemCount}>4 of 5 records</span>
              </div>
            </div>

            {/* Task 2: Education Loan */}
            <div
              onClick={() => setSelectedTask('loan')}
              style={{
                ...styles.taskCard,
                ...(selectedTask === 'loan' ? styles.taskCardSelected : {}),
              }}
            >
              <div style={styles.taskCardTop}>
                <Badge variant="neutral" size="sm">
                  FINANCE
                </Badge>
                <span style={styles.taskIcon}>🏦</span>
              </div>
              <h3 style={styles.taskHeading}>Education Loan</h3>
              <p style={styles.taskDesc}>Income proof, admission letter, and co-applicant KYC records</p>
              <div style={styles.taskMeta}>
                <span style={styles.readinessTagWarning}>60% Readiness</span>
                <span style={styles.itemCount}>3 of 5 records</span>
              </div>
            </div>

            {/* Task 3: Job Application */}
            <div
              onClick={() => setSelectedTask('job')}
              style={{
                ...styles.taskCard,
                ...(selectedTask === 'job' ? styles.taskCardSelected : {}),
              }}
            >
              <div style={styles.taskCardTop}>
                <Badge variant="neutral" size="sm">
                  CAREER
                </Badge>
                <span style={styles.taskIcon}>💼</span>
              </div>
              <h3 style={styles.taskHeading}>Job Application</h3>
              <p style={styles.taskDesc}>Degree verification, work experience letters, and identity proof</p>
              <div style={styles.taskMeta}>
                <span style={styles.readinessTagSuccess}>100% Ready</span>
                <span style={styles.itemCount}>4 of 4 records</span>
              </div>
            </div>

            {/* Task 4: Hospital Admission */}
            <div
              onClick={() => setSelectedTask('hospital')}
              style={{
                ...styles.taskCard,
                ...(selectedTask === 'hospital' ? styles.taskCardSelected : {}),
              }}
            >
              <div style={styles.taskCardTop}>
                <Badge variant="neutral" size="sm">
                  HEALTHCARE
                </Badge>
                <span style={styles.taskIcon}>🏥</span>
              </div>
              <h3 style={styles.taskHeading}>Hospital Admission</h3>
              <p style={styles.taskDesc}>Insurance policy cards, health ID, and prior diagnostic reports</p>
              <div style={styles.taskMeta}>
                <span style={styles.readinessTagWarning}>50% Readiness</span>
                <span style={styles.itemCount}>2 of 4 records</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SELECTED TASK INSPECTION (College Admission Demo) */}
        {selectedTask === 'college' && (
          <section style={styles.section}>
            <Card style={styles.detailCard}>
              <div style={styles.detailHeader}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h2 style={styles.detailTitle}>Target Workflow: University Admission</h2>
                    <Badge variant="success" size="sm">
                      80% READINESS
                    </Badge>
                  </div>
                  <p style={styles.detailSubtitle}>
                    AI-classified task: <code>university_admission</code> | Governing Domain: <code>education</code>
                  </p>
                </div>

                <Button variant="primary" size="md">
                  Prepare Sharing Package →
                </Button>
              </div>

              {/* Requirement Checklist Grid */}
              <div style={styles.checklistContainer}>
                <h4 style={styles.checklistTitle}>Required Documents & Vault Matching</h4>
                <div style={styles.checklistGrid}>
                  <div style={styles.checklistItemMatched}>
                    <div style={styles.checkIconMatched}>✓</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.checkItemName}>National Identity Proof</div>
                      <div style={styles.checkItemDetail}>Matched: Aadhaar_Card_2025.pdf (VERIFIED)</div>
                    </div>
                    <Badge variant="success" size="sm">
                      MATCHED
                    </Badge>
                  </div>

                  <div style={styles.checklistItemMatched}>
                    <div style={styles.checkIconMatched}>✓</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.checkItemName}>High School Graduation Certificate (12th Grade)</div>
                      <div style={styles.checkItemDetail}>Matched: CBSE_Class12_Marksheet.pdf (VERIFIED)</div>
                    </div>
                    <Badge variant="success" size="sm">
                      MATCHED
                    </Badge>
                  </div>

                  <div style={styles.checklistItemMatched}>
                    <div style={styles.checkIconMatched}>✓</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.checkItemName}>Secondary School Certificate (10th Grade)</div>
                      <div style={styles.checkItemDetail}>Matched: ICSE_Class10_Passing.pdf (VERIFIED)</div>
                    </div>
                    <Badge variant="success" size="sm">
                      MATCHED
                    </Badge>
                  </div>

                  <div style={styles.checklistItemMatched}>
                    <div style={styles.checkIconMatched}>✓</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.checkItemName}>Proof of Residential Address</div>
                      <div style={styles.checkItemDetail}>Matched: Domicile_Certificate_2024.pdf (VERIFIED)</div>
                    </div>
                    <Badge variant="success" size="sm">
                      MATCHED
                    </Badge>
                  </div>

                  <div style={styles.checklistItemMissing}>
                    <div style={styles.checkIconMissing}>✕</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.checkItemName}>Provisional University Admission Letter</div>
                      <div style={styles.checkItemDetail}>Missing: No record found matching admission letter in vault</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveNav('records')}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                      >
                        + Add to Vault
                      </Button>
                      <Badge variant="danger" size="sm">
                        MISSING
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* AI Explanation Callout */}
                <div style={styles.explanationBox}>
                  <strong>LifePass AI Context Summary:</strong> You have 4 of the 5 required documents.
                  Your National Identity, Class 10 & 12 certificates, and Residential Domicile are available and
                  ready. Upload your Provisional Admission Letter to reach 100% readiness before sharing with your
                  university.
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* 7. VAULT & ACTIVE PERMISSIONS OVERVIEW */}
        <section style={styles.gridTwoCol}>
          {/* Card A: Personal Record Vault */}
          <Card style={styles.summaryCard}>
            <div style={styles.summaryCardHeader}>
              <h3 style={styles.summaryTitle}>Personal Record Vault</h3>
              <Badge variant="info" size="sm">
                {vaultMetrics.total} RECORDS
              </Badge>
            </div>
            <p style={styles.summaryDesc}>
              Manage your personal records and decide which organizations may access them.
            </p>
            <div style={styles.vaultCategoryList}>
              <div style={styles.vaultCatItem}>
                <span>🪪 Identity Documents</span>
                <span style={styles.vaultCount}>
                  {records.filter((r) => r.category === 'Identity').length} record(s)
                </span>
              </div>
              <div style={styles.vaultCatItem}>
                <span>🎓 Academic Credentials</span>
                <span style={styles.vaultCount}>
                  {records.filter((r) => r.category === 'Education').length} record(s)
                </span>
              </div>
              <div style={styles.vaultCatItem}>
                <span>🏡 Residence & Domicile</span>
                <span style={styles.vaultCount}>
                  {records.filter((r) => r.category === 'Address').length} record(s)
                </span>
              </div>
              <div style={styles.vaultCatItem}>
                <span>💳 Financial Records</span>
                <span style={styles.vaultCount}>
                  {records.filter((r) => r.category === 'Finance').length} record(s)
                </span>
              </div>
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '0.875rem', borderTop: `1px solid ${theme.colors.borderLight}` }}>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setActiveNav('records')}
              >
                Open Record Vault ({vaultMetrics.total} records) →
              </Button>
            </div>
          </Card>

          {/* Card B: Active Institutional Permissions */}
          <Card style={styles.summaryCard}>
            <div style={styles.summaryCardHeader}>
              <h3 style={styles.summaryTitle}>Active Access Requests</h3>
              <Badge variant="warning" size="sm">
                1 PENDING REVIEW
              </Badge>
            </div>
            <p style={styles.summaryDesc}>
              Organizations that have requested access to your records through LifePass.
            </p>
            <div style={styles.requestItem}>
              <div>
                <strong style={{ color: theme.colors.textPrimary, fontSize: '0.875rem' }}>Apex National University</strong>
                <p style={{ color: theme.colors.textSecondary, fontSize: '0.75rem', margin: '0.25rem 0' }}>
                  Purpose: 2026 Admissions Verification (3 records requested)
                </p>
                <span style={{ fontSize: '0.6875rem', color: theme.colors.textMuted }}>
                  Expires in 14 days • Scoped Temporary Access
                </span>
              </div>
              <Badge variant="warning" size="sm">
                PENDING CONSENT
              </Badge>
            </div>
            <div style={styles.consentNotice}>
              <strong>Explicit Consent Rule:</strong> Institutions receive zero data until you review and approve the
              specific documents requested.
            </div>
          </Card>
        </section>

        {/* 8. RECENT ACTIVITY SECTION */}
        <section style={styles.section}>
          <Card style={styles.summaryCard}>
            <div style={styles.summaryCardHeader}>
              <h3 style={styles.summaryTitle}>Recent Activity</h3>
              <Badge variant="neutral" size="sm">
                LOGGED
              </Badge>
            </div>
            <p style={styles.summaryDesc}>
              Audit record of document matching, consent requests, and verified access events.
            </p>
            <div style={styles.activityList}>
              <div style={styles.activityItem}>
                <div style={styles.activityDot} />
                <div style={{ flex: 1 }}>
                  <div style={styles.activityText}>
                    <strong>Apex National University</strong> requested admission certificate verification
                  </div>
                  <div style={styles.activityTime}>2 hours ago • Automated Verification Request</div>
                </div>
              </div>

              <div style={styles.activityItem}>
                <div style={styles.activityDot} />
                <div style={{ flex: 1 }}>
                  <div style={styles.activityText}>
                    <strong>CBSE Class 12 Marksheet</strong> added to vault
                  </div>
                  <div style={styles.activityTime}>Yesterday • Demo Status Verified</div>
                </div>
              </div>

              <div style={styles.activityItem}>
                <div style={styles.activityDot} />
                <div style={{ flex: 1 }}>
                  <div style={styles.activityText}>
                    <strong>Consented 3 records</strong> to Apex National University for admission review
                  </div>
                  <div style={styles.activityTime}>2 days ago • Scoped Consent Granted</div>
                </div>
              </div>

              <div style={styles.activityItem}>
                <div style={styles.activityDot} />
                <div style={{ flex: 1 }}>
                  <div style={styles.activityText}>
                    <strong>Vault Snapshot</strong> saved to session
                  </div>
                  <div style={styles.activityTime}>3 days ago • System Event</div>
                </div>
              </div>
            </div>
          </Card>
        </section>
          </>
        )}

        {/* 9. PROTOTYPE ARCHITECTURE BANNER */}
        <div style={styles.architectureBanner}>
          <strong>Frontend Architecture Preview:</strong> Responsive React web application for Individual Data Owners.
          Running with client-side mock adapter for parallel frontend development. Backend authentication, PostgreSQL database models,
          and FastAPI AI service will connect during final cross-workstream integration.
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.pageBg,
    color: theme.colors.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: theme.typography.fontFamily,
  },
  header: {
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.xs,
    padding: '0.875rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    boxSizing: 'border-box',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  mobileMenuButton: {
    display: 'none',
    background: '#FFFFFF',
    border: `1px solid ${theme.colors.borderDark}`,
    borderRadius: '0.375rem',
    padding: '0.35rem 0.6rem',
    fontSize: '1rem',
    cursor: 'pointer',
    color: theme.colors.textPrimary,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoMark: {
    width: '32px',
    height: '32px',
    borderRadius: '0.5rem',
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 800,
    fontSize: '0.875rem',
    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
  },
  brandTitle: {
    fontSize: '1.125rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.5rem 0.875rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: theme.colors.surfaceAccent,
    border: 'none',
    color: theme.colors.primary,
    fontSize: '0.875rem',
    fontWeight: 700,
    padding: '0.5rem 0.875rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.border}`,
  },
  userAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
  },
  userRole: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
  },
  mobileNavDrawer: {
    backgroundColor: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    boxShadow: theme.shadows.md,
  },
  mobileNavItem: {
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: '0.875rem',
    fontWeight: 600,
    padding: '0.625rem',
    borderRadius: '0.375rem',
    textAlign: 'left',
    cursor: 'pointer',
  },
  mobileNavItemActive: {
    backgroundColor: theme.colors.surfaceAccent,
    border: 'none',
    color: theme.colors.primary,
    fontSize: '0.875rem',
    fontWeight: 700,
    padding: '0.625rem',
    borderRadius: '0.375rem',
    textAlign: 'left',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  greetingTitle: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  greetingSubtitle: {
    fontSize: '1rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '650px',
  },
  taskInputCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.sm,
    padding: '1.5rem',
    borderRadius: '0.75rem',
    marginTop: '1.25rem',
  },
  taskLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    marginBottom: '0.75rem',
  },
  taskInputRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  taskTextInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.borderDark}`,
    borderRadius: '0.5rem',
    color: theme.colors.textPrimary,
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: theme.shadows.xs,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  askButton: {
    flexShrink: 0,
    padding: '0.75rem 1.5rem',
  },
  aiHintText: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
    marginTop: '0.75rem',
    lineHeight: 1.4,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    width: '100%',
  },
  metricCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    boxShadow: theme.shadows.xs,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '0.5rem',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  metricIcon: {
    fontSize: '1rem',
  },
  metricValue: {
    fontSize: '1.875rem',
    fontWeight: 800,
    color: theme.colors.textPrimary,
    letterSpacing: '-0.03em',
  },
  metricSub: {
    fontSize: '0.75rem',
    color: theme.colors.textMuted,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.01em',
  },
  sectionSub: {
    fontSize: '0.8125rem',
    color: theme.colors.textSecondary,
    margin: '0.25rem 0 0 0',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
  },
  catCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: theme.shadows.xs,
    transition: 'all 0.15s ease',
  },
  catCardActive: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: '0.75rem',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
  },
  catIcon: {
    fontSize: '1.75rem',
  },
  catInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  catTitle: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
  },
  catDesc: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    marginTop: '0.125rem',
    lineHeight: 1.3,
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
  },
  taskCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    cursor: 'pointer',
    boxShadow: theme.shadows.xs,
    transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  taskCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    boxShadow: '0 0 0 1px #2563EB, 0 4px 12px rgba(37, 99, 235, 0.1)',
  },
  taskCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  taskIcon: {
    fontSize: '1.5rem',
  },
  taskHeading: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: '0 0 0.375rem 0',
  },
  taskDesc: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  taskMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  },
  readinessTagSuccess: {
    color: theme.colors.successText,
    fontWeight: 700,
  },
  readinessTagWarning: {
    color: theme.colors.warningText,
    fontWeight: 700,
  },
  itemCount: {
    color: theme.colors.textMuted,
  },
  detailCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    boxShadow: theme.shadows.sm,
    padding: '1.5rem',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  detailTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  detailSubtitle: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    margin: 0,
  },
  checklistContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  checklistTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  checklistGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
  },
  checklistItemMatched: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
  },
  checkIconMatched: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: theme.colors.successBg,
    color: theme.colors.successText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 800,
    flexShrink: 0,
  },
  checklistItemMissing: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: theme.colors.dangerBg,
    border: `1px solid ${theme.colors.dangerBorder}`,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
  },
  checkIconMissing: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#FCA5A5',
    color: theme.colors.dangerText,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 800,
    flexShrink: 0,
  },
  checkItemName: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: theme.colors.textPrimary,
  },
  checkItemDetail: {
    fontSize: '0.6875rem',
    color: theme.colors.textSecondary,
  },
  explanationBox: {
    backgroundColor: theme.colors.surfaceAccent,
    border: `1px solid ${theme.colors.primaryBorder}`,
    borderRadius: '0.5rem',
    padding: '0.875rem 1rem',
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    lineHeight: 1.5,
  },
  gridTwoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.75rem',
    boxShadow: theme.shadows.sm,
    padding: '1.5rem',
  },
  summaryCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  summaryTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  summaryDesc: {
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
    margin: '0 0 1rem 0',
  },
  vaultCategoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  vaultCatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    padding: '0.45rem 0',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  vaultCount: {
    color: theme.colors.textSecondary,
    fontSize: '0.75rem',
  },
  requestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem',
    padding: '0.875rem',
    marginBottom: '0.875rem',
  },
  consentNotice: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    lineHeight: 1.4,
    backgroundColor: theme.colors.neutralBg,
    padding: '0.625rem',
    borderRadius: '0.375rem',
    border: `1px solid ${theme.colors.border}`,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.5rem 0',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    marginTop: '0.35rem',
    flexShrink: 0,
  },
  activityText: {
    fontSize: '0.8125rem',
    color: theme.colors.textPrimary,
    lineHeight: 1.4,
  },
  activityTime: {
    fontSize: '0.6875rem',
    color: theme.colors.textMuted,
    marginTop: '0.125rem',
  },
  architectureBanner: {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '0.5rem',
    boxShadow: theme.shadows.xs,
    padding: '1rem',
    fontSize: '0.75rem',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 1.5,
  },
};
