import React, { useState, useEffect } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';

export const InstitutionLoginView: React.FC = () => {
  const { sendOtp, verifyOtp, error, clearError, isConfigured } = useInstitutionAuth();
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (step === 'otp' && cooldown > 0) {
      t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [step, cooldown]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const cleaned = phone.trim().replace(/[\s-]/g, '');
    if (!cleaned || cleaned.length < 8) {
      setLocalError('Please enter a valid institution official phone number with country code (e.g. +14155552671)');
      return;
    }

    setIsSubmitting(true);
    const res = await sendOtp(cleaned);
    setIsSubmitting(false);

    if (res.success) {
      setStep('otp');
      setCooldown(60);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    const cleanedToken = token.trim();
    if (!cleanedToken || cleanedToken.length < 6) {
      setLocalError('Please enter the 6-digit code received via SMS.');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyOtp(phone, cleanedToken);
    setIsSubmitting(false);

    if (!res.success && res.error) {
      setLocalError(res.error);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.badge}>INSTITUTION PORTAL AUTHENTICATION</div>
        <h1 style={styles.title}>LifePass Institution Portal</h1>
        <p style={styles.subtitle}>Unified Life-Stage Digital Identity & Verification Network</p>
      </div>

      {!isConfigured && (
        <div style={styles.warningBox}>
          <strong>Configuration Notice:</strong> VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Real SMS OTP requires live Supabase credentials.
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSend} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Official Mobile Number</label>
            <input
              type="tel"
              style={styles.input}
              placeholder="+14155552671 or +919876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setLocalError(null);
                clearError();
              }}
              disabled={isSubmitting}
              autoFocus
            />
            <span style={styles.hint}>Include international country code with +</span>
          </div>

          {(localError || error) && (
            <div style={styles.errorBox}>{localError || error}</div>
          )}

          <button
            type="submit"
            style={{ ...styles.button, opacity: isSubmitting ? 0.6 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Requesting Code...' : 'Request Authentication Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} style={styles.form}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => setStep('phone')}
            disabled={isSubmitting}
          >
            ← Change phone number
          </button>

          <p style={styles.otpNotice}>
            Enter the 6-digit verification code dispatched to <strong>{phone}</strong>
          </p>

          <div style={styles.field}>
            <label style={styles.label}>6-Digit Security Code</label>
            <input
              type="text"
              maxLength={6}
              style={{ ...styles.input, textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }}
              placeholder="123456"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setLocalError(null);
                clearError();
              }}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {(localError || error) && (
            <div style={styles.errorBox}>{localError || error}</div>
          )}

          <button
            type="submit"
            style={{ ...styles.button, opacity: isSubmitting ? 0.6 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Enter Portal'}
          </button>

          <div style={styles.resendArea}>
            {cooldown > 0 ? (
              <span style={styles.resendCooldown}>Resend code in {cooldown}s</span>
            ) : (
              <button
                type="button"
                style={styles.resendBtn}
                onClick={handleSend}
                disabled={isSubmitting}
              >
                Resend SMS Code
              </button>
            )}
          </div>
        </form>
      )}

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Authentication is verified via Supabase Auth. Access to institution records is strictly restricted to active members registered in PostgreSQL.
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '1rem',
    padding: '2rem',
    maxWidth: '460px',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  },
  header: {
    marginBottom: '1.5rem',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#E0F2FE',
    border: '1px solid #BAE6FD',
    borderRadius: '0.375rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#0284C7',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 0.25rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748B',
    margin: 0,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#92400E',
    marginBottom: '1rem',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '0.5rem',
    padding: '0.75rem 0.875rem',
    color: '#0F172A',
    fontSize: '0.9375rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  hint: {
    fontSize: '0.6875rem',
    color: '#64748B',
  },
  button: {
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.25rem',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#0284C7',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
    marginBottom: '0.25rem',
  },
  otpNotice: {
    fontSize: '0.8125rem',
    color: '#334155',
    margin: '0 0 0.5rem 0',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.75rem',
    color: '#DC2626',
    lineHeight: '1.4',
  },
  resendArea: {
    textAlign: 'center',
    marginTop: '0.25rem',
  },
  resendCooldown: {
    fontSize: '0.75rem',
    color: '#64748B',
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#0284C7',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  footer: {
    marginTop: '1.5rem',
    borderTop: '1px solid #E2E8F0',
    paddingTop: '1rem',
  },
  footerText: {
    fontSize: '0.6875rem',
    color: '#64748B',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.4',
  },
};
