/**
 * LifePass AI — Institution Web Portal Foundation
 *
 * PHASE 0.1 BASELINE ONLY
 * Institution authentication, request workflows, and consented package viewing will be
 * implemented in subsequent phases according to IMPLEMENTATION_PLAN.md.
 */
export default function App() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #1F2937',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#F9FAFB' }}>
          LifePass AI Institution Portal
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 1.5rem 0' }}>
          Unified Life-Stage Digital Identity & Verification Network
        </p>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#1E293B',
          border: '1px solid #334155',
          borderRadius: '0.5rem',
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#38BDF8',
          margin: '0 0 1.5rem 0'
        }}>
          Phase 0.1 — Institution Web Foundation Baseline
        </div>
        <p style={{ fontSize: '0.875rem', color: '#D1D5DB', lineHeight: '1.5', margin: 0 }}>
          The institution web portal workspace foundation has been initialized.
          Institution workflows, request management, and consented record packages will be implemented in Phase 8.
        </p>
      </div>
    </div>
  );
}
