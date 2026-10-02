import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const IndividualDashboardFoundation: React.FC = () => {
  const { user, signOut } = useInstitutionAuth();
  const [taskInput, setTaskInput] = useState('I need to apply for university admission');
  const [selectedTask, setSelectedTask] = useState<'college' | 'loan' | 'job' | 'hospital'>('college');

  const displayName = user?.fullName || user?.username || 'Record Owner';

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={styles.logoMark}>LP</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={styles.brandTitle}>LifePass AI</span>
              <Badge variant="success" size="sm">
                PERSONAL VAULT
              </Badge>
            </div>
            <span style={styles.userSubtitle}>
              Authenticated as <strong>{displayName}</strong> (@{user?.username || 'citizen'})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={styles.main}>
        {/* Welcome & Primary AI Task Prompt */}
        <section style={styles.heroSection}>
          <div style={{ marginBottom: '1.25rem' }}>
            <Badge variant="info" size="sm" style={{ marginBottom: '0.5rem' }}>
              AI CONTEXT ENGINE
            </Badge>
            <h1 style={styles.greetingTitle}>Hello, {displayName}</h1>
            <p style={styles.greetingSubtitle}>
              Tell LifePass what you are trying to accomplish. Our AI will understand your task, identify the
              governing requirements, map your vault records, and highlight what is missing.
            </p>
          </div>

          {/* AI Task Input Box */}
          <Card style={styles.taskInputCard}>
            <label style={styles.taskLabel}>What are you trying to accomplish?</label>
            <div style={styles.taskInputRow}>
              <div style={styles.inputWrapper}>
                <span style={styles.sparkleIcon}>✨</span>
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="e.g. I need to apply for college admission, loan, or employment..."
                  style={styles.taskTextInput}
                />
              </div>
              <Button variant="primary" size="md" style={styles.askButton}>
                Ask LifePass AI
              </Button>
            </div>
          </Card>
        </section>

        {/* Life-Stage Task Selector */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Life-Stage Tasks</h2>
            <span style={styles.sectionSub}>Select a workflow to inspect requirement mapping</span>
          </div>

          <div style={styles.taskGrid}>
            {/* Task 1: College Admission (Primary Hackathon Scenario) */}
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
                <span style={styles.readinessTag}>80% Readiness</span>
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
                <span style={styles.readinessTag}>60% Readiness</span>
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
                <span style={styles.readinessTag}>100% Ready</span>
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
                <span style={styles.readinessTag}>50% Readiness</span>
                <span style={styles.itemCount}>2 of 4 records</span>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Task Inspection (College Admission Preview) */}
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
                    AI-classified task: <code>university_admission</code> | Domain: <code>education</code>
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
                      <div style={styles.checkItemDetail}>Missing: No record found matching admission letter</div>
                    </div>
                    <Badge variant="danger" size="sm">
                      MISSING
                    </Badge>
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

        {/* Vault & Consent Summary Cards */}
        <section style={styles.gridTwoCol}>
          {/* Card A: Personal Record Vault */}
          <Card style={styles.summaryCard}>
            <div style={styles.summaryCardHeader}>
              <h3 style={styles.summaryTitle}>Personal Record Vault</h3>
              <Badge variant="info" size="sm">
                5 RECORDS
              </Badge>
            </div>
            <p style={styles.summaryDesc}>
              Personal records stored with end-to-end encryption. Only you decide which organizations may access them.
            </p>
            <div style={styles.vaultCategoryList}>
              <div style={styles.vaultCatItem}>
                <span>📁 Identity Documents</span>
                <span style={styles.vaultCount}>1 record</span>
              </div>
              <div style={styles.vaultCatItem}>
                <span>🎓 Academic Credentials</span>
                <span style={styles.vaultCount}>2 records</span>
              </div>
              <div style={styles.vaultCatItem}>
                <span>🏡 Residence & Domicile</span>
                <span style={styles.vaultCount}>1 record</span>
              </div>
              <div style={styles.vaultCatItem}>
                <span>💳 Financial Records</span>
                <span style={styles.vaultCount}>1 record</span>
              </div>
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
                <strong style={{ color: '#F9FAFB', fontSize: '0.875rem' }}>Apex National University</strong>
                <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: '0.125rem 0' }}>
                  Purpose: 2026 Admissions Verification (3 records requested)
                </p>
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

        {/* Prototype Architecture Notice */}
        <div style={styles.architectureBanner}>
          <strong>Frontend Architecture Preview:</strong> Responsive React web shell for Individual Data Owners.
          Runs in client-isolated mock mode without backend dependencies. Backend authentication, database models,
          and FastAPI AI service will connect during final cross-workstream integration.
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#090D16',
    color: '#F9FAFB',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#111827',
    borderBottom: '1px solid #1F2937',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logoMark: {
    width: '32px',
    height: '32px',
    borderRadius: '0.5rem',
    background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#090D16',
    fontWeight: 800,
    fontSize: '0.875rem',
    boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)',
  },
  brandTitle: {
    fontSize: '1.125rem',
    fontWeight: 800,
    color: '#F9FAFB',
    letterSpacing: '-0.02em',
  },
  userSubtitle: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
  },
  main: {
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  greetingTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#F9FAFB',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  greetingSubtitle: {
    fontSize: '0.9375rem',
    color: '#9CA3AF',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '750px',
  },
  taskInputCard: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    marginTop: '1rem',
  },
  taskLabel: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#D1D5DB',
    marginBottom: '0.5rem',
  },
  taskInputRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  inputWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    display: 'flex',
    alignItems: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    left: '0.875rem',
    fontSize: '1rem',
    color: '#38BDF8',
  },
  taskTextInput: {
    width: '100%',
    padding: '0.625rem 0.875rem 0.625rem 2.5rem',
    backgroundColor: '#090D16',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    color: '#F9FAFB',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  askButton: {
    flexShrink: 0,
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
    color: '#F9FAFB',
    margin: 0,
  },
  sectionSub: {
    fontSize: '0.8125rem',
    color: '#9CA3AF',
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '1rem',
  },
  taskCard: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  taskCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C1E2E',
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
    color: '#F9FAFB',
    margin: '0 0 0.375rem 0',
  },
  taskDesc: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  taskMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  },
  readinessTag: {
    color: '#34D399',
    fontWeight: 700,
  },
  itemCount: {
    color: '#6B7280',
  },
  detailCard: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '0.75rem',
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
    borderBottom: '1px solid #1F2937',
  },
  detailTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#F9FAFB',
    margin: 0,
  },
  detailSubtitle: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
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
    color: '#D1D5DB',
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
    backgroundColor: '#090D16',
    border: '1px solid #1F2937',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
  },
  checkIconMatched: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#064E3B',
    color: '#34D399',
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
    backgroundColor: '#200D11',
    border: '1px solid #7F1D1D',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
  },
  checkIconMissing: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#450A0A',
    color: '#F87171',
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
    color: '#F9FAFB',
  },
  checkItemDetail: {
    fontSize: '0.6875rem',
    color: '#9CA3AF',
  },
  explanationBox: {
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    padding: '0.875rem',
    fontSize: '0.8125rem',
    color: '#CBD5E1',
    lineHeight: 1.5,
  },
  gridTwoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  summaryCard: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '0.75rem',
    padding: '1.25rem',
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
    color: '#F9FAFB',
    margin: 0,
  },
  summaryDesc: {
    fontSize: '0.75rem',
    color: '#9CA3AF',
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
    color: '#D1D5DB',
    padding: '0.375rem 0',
    borderBottom: '1px solid #1F2937',
  },
  vaultCount: {
    color: '#9CA3AF',
    fontSize: '0.75rem',
  },
  requestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090D16',
    border: '1px solid #1F2937',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    marginBottom: '0.75rem',
  },
  consentNotice: {
    fontSize: '0.6875rem',
    color: '#6B7280',
    lineHeight: 1.4,
  },
  architectureBanner: {
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '0.5rem',
    padding: '1rem',
    fontSize: '0.75rem',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};
