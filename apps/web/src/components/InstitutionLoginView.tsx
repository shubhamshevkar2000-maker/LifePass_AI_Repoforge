import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';

export const InstitutionLoginView: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, enableDemoMode, error, clearError, isConfigured } = useInstitutionAuth();

  // Auth mode: 'login' (default) or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Shared credential state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Enterprise Registration fields
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('bank');
  const [adminName, setAdminName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // UI / Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;

    if (mode === 'register') {
      if (!institutionName.trim()) {
        errors.institutionName = 'Institution name is required.';
      }
      if (!institutionType) {
        errors.institutionType = 'Please select an institution type.';
      }
      if (!adminName.trim()) {
        errors.adminName = 'Administrator full name is required.';
      }
      if (!contactNumber.trim()) {
        errors.contactNumber = 'Contact number is required.';
      } else {
        const digits = contactNumber.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15 || !phoneRegex.test(contactNumber.trim())) {
          errors.contactNumber = 'Enter a valid phone number with country code (e.g. +91 98765 43210).';
        }
      }
    }

    const cleanedEmail = email.trim();
    if (!cleanedEmail) {
      errors.email = mode === 'register' ? 'Official institution email is required.' : 'Please enter your email address.';
    } else if (!emailRegex.test(cleanedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter a password.';
    } else if (mode === 'register' && password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        errors.confirmPassword = 'Confirm password is required.';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    const cleanedEmail = email.trim();
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await signInWithEmail(cleanedEmail, password);
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    } else {
      const res = await signUpWithEmail(cleanedEmail, password, {
        institution_name: institutionName.trim(),
        institution_type: institutionType,
        full_name: adminName.trim(),
        phone: contactNumber.trim(),
      });

      if (!res.success && res.error) {
        setLocalError(res.error);
      } else {
        // Registration submitted successfully
        setSuccessMessage(
          res.error ||
          'Institution account registered successfully. Institutional access requires server-side membership verification before portal workspace is activated.'
        );
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    }

    setIsSubmitting(false);
  };

  const toggleMode = () => {
    const nextMode = mode === 'login' ? 'register' : 'login';
    setMode(nextMode);
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div style={{ ...styles.card, maxWidth: mode === 'register' ? '700px' : '460px' }}>
      <div style={styles.header}>
        <div style={styles.badge}>
          {mode === 'login' ? 'INSTITUTION PORTAL AUTHENTICATION' : 'ENTERPRISE ONBOARDING'}
        </div>
        <h1 style={styles.title}>
          {mode === 'login' ? 'LifePass Institution Portal' : 'Create Institution Account'}
        </h1>
        <p style={styles.subtitle}>
          Unified Life-Stage Digital Identity &amp; Verification Network
        </p>
      </div>

      {!isConfigured && (
        <div style={styles.warningBox}>
          <strong>Configuration Notice:</strong> VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured. Real authentication requires live Supabase credentials.
        </div>
      )}

      {(localError || error) && (
        <div style={styles.errorBox}>{localError || error}</div>
      )}

      {successMessage && (
        <div style={styles.successBox}>{successMessage}</div>
      )}

      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'login' ? (
            /* ================= LOGIN FORM (PRESERVED UNCHANGED) ================= */
            <>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  style={{
                    ...styles.input,
                    ...(validationErrors.email ? styles.inputError : {}),
                  }}
                  placeholder="name@institution.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLocalError(null);
                    clearError();
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                  autoFocus
                />
                {validationErrors.email && (
                  <span style={styles.inlineError}>{validationErrors.email}</span>
                )}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={{
                    ...styles.input,
                    ...(validationErrors.password ? styles.inputError : {}),
                  }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError(null);
                    clearError();
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                />
                {validationErrors.password && (
                  <span style={styles.inlineError}>{validationErrors.password}</span>
                )}
              </div>
            </>
          ) : (
            /* ================= ENTERPRISE CREATE ACCOUNT FORM ================= */
            <>
              {/* SECTION 1: INSTITUTION DETAILS */}
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Institution Details</span>
              </div>

              <div style={styles.twoColumnGrid}>
                {/* 1. Institution Name */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Institution Name <span style={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="text"
                    style={{
                      ...styles.input,
                      ...(validationErrors.institutionName ? styles.inputError : {}),
                    }}
                    placeholder="e.g. National Education Loan Authority"
                    value={institutionName}
                    onChange={(e) => {
                      setInstitutionName(e.target.value);
                      if (validationErrors.institutionName) {
                        setValidationErrors((prev) => ({ ...prev, institutionName: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {validationErrors.institutionName && (
                    <span style={styles.inlineError}>{validationErrors.institutionName}</span>
                  )}
                </div>

                {/* 2. Institution Type */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Institution Type <span style={styles.requiredMark}>*</span>
                  </label>
                  <select
                    style={{
                      ...styles.select,
                      ...(validationErrors.institutionType ? styles.inputError : {}),
                    }}
                    value={institutionType}
                    onChange={(e) => {
                      setInstitutionType(e.target.value);
                      if (validationErrors.institutionType) {
                        setValidationErrors((prev) => ({ ...prev, institutionType: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="bank">Banking / Financial Institution</option>
                    <option value="university">Higher Education / University</option>
                    <option value="employer">Enterprise / Employer</option>
                    <option value="government">Government / Regulatory Authority</option>
                  </select>
                  {validationErrors.institutionType && (
                    <span style={styles.inlineError}>{validationErrors.institutionType}</span>
                  )}
                </div>
              </div>

              {/* SECTION 2: ADMINISTRATOR DETAILS */}
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Administrator Details</span>
              </div>

              <div style={styles.twoColumnGrid}>
                {/* 3. Administrator Full Name */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Administrator Full Name <span style={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="text"
                    style={{
                      ...styles.input,
                      ...(validationErrors.adminName ? styles.inputError : {}),
                    }}
                    placeholder="Enter administrator name"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      if (validationErrors.adminName) {
                        setValidationErrors((prev) => ({ ...prev, adminName: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  {validationErrors.adminName && (
                    <span style={styles.inlineError}>{validationErrors.adminName}</span>
                  )}
                </div>

                {/* 4. Official Institution Email */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Official Institution Email <span style={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="email"
                    style={{
                      ...styles.input,
                      ...(validationErrors.email ? styles.inputError : {}),
                    }}
                    placeholder="admin@institution.org"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLocalError(null);
                      clearError();
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  {validationErrors.email && (
                    <span style={styles.inlineError}>{validationErrors.email}</span>
                  )}
                </div>
              </div>

              {/* 5. Contact Number */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Contact Number <span style={styles.requiredMark}>*</span>
                </label>
                <input
                  type="tel"
                  style={{
                    ...styles.input,
                    ...(validationErrors.contactNumber ? styles.inputError : {}),
                  }}
                  placeholder="+91 XXXXX XXXXX"
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    if (validationErrors.contactNumber) {
                      setValidationErrors((prev) => ({ ...prev, contactNumber: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                />
                {validationErrors.contactNumber ? (
                  <span style={styles.inlineError}>{validationErrors.contactNumber}</span>
                ) : (
                  <span style={styles.helperText}>
                    Standard format with country code (e.g. +91 98765 43210 or +1 415 555 2671)
                  </span>
                )}
              </div>

              {/* SECTION 3: ACCOUNT SECURITY */}
              <div style={styles.sectionHeader}>
                <span style={styles.sectionTitle}>Account Security</span>
              </div>

              <div style={styles.twoColumnGrid}>
                {/* 6. Password */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Password <span style={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="password"
                    style={{
                      ...styles.input,
                      ...(validationErrors.password ? styles.inputError : {}),
                    }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLocalError(null);
                      clearError();
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  {validationErrors.password ? (
                    <span style={styles.inlineError}>{validationErrors.password}</span>
                  ) : (
                    <span style={styles.helperText}>Minimum 8 characters</span>
                  )}
                </div>

                {/* 7. Confirm Password */}
                <div style={styles.field}>
                  <label style={styles.label}>
                    Confirm Password <span style={styles.requiredMark}>*</span>
                  </label>
                  <input
                    type="password"
                    style={{
                      ...styles.input,
                      ...(validationErrors.confirmPassword ? styles.inputError : {}),
                    }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLocalError(null);
                      clearError();
                      if (validationErrors.confirmPassword) {
                        setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  {validationErrors.confirmPassword && (
                    <span style={styles.inlineError}>{validationErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              {/* Governance Note */}
              <div style={styles.governanceNotice}>
                <strong>Governance Policy:</strong> Institutional membership access is strictly restricted to active members registered in PostgreSQL. Onboarding requests are submitted for server-side verification.
              </div>
            </>
          )}

          <button
            type="submit"
            style={{ ...styles.button, opacity: isSubmitting ? 0.6 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (mode === 'login' ? 'Signing In...' : 'Registering Account...')
              : (mode === 'login' ? 'Login' : 'Create Institution Account')}
          </button>
        </form>

        <div style={styles.toggleArea}>
          {mode === 'login' ? (
            <p style={styles.toggleText}>
              New to LifePass?{' '}
              <button type="button" onClick={toggleMode} style={styles.toggleBtn} disabled={isSubmitting}>
                Create Account
              </button>
            </p>
          ) : (
            <p style={styles.toggleText}>
              Already have an account?{' '}
              <button type="button" onClick={toggleMode} style={styles.toggleBtn} disabled={isSubmitting}>
                Login
              </button>
            </p>
          )}
        </div>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        <button
          onClick={enableDemoMode}
          style={styles.demoButton}
          disabled={isSubmitting}
          type="button"
        >
          Try Demo Institution
        </button>

        <div style={styles.demoNotice}>
          DEMO MODE: Synthetic institution environment. No real applicant data.
        </div>
      </div>

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
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    transition: 'max-width 0.2s ease-in-out',
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
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.75rem',
    color: '#DC2626',
    lineHeight: '1.4',
    marginBottom: '1rem',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.75rem',
    color: '#047857',
    lineHeight: '1.4',
    marginBottom: '1rem',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  sectionHeader: {
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '0.375rem',
    marginTop: '0.25rem',
    marginBottom: '0.125rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.875rem',
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
  requiredMark: {
    color: '#DC2626',
    fontWeight: 700,
  },
  input: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    color: '#0F172A',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    transition: 'border-color 0.15s ease',
  },
  select: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    color: '#0F172A',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1rem',
    paddingRight: '2.5rem',
    transition: 'border-color 0.15s ease',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inlineError: {
    fontSize: '0.6875rem',
    color: '#DC2626',
    fontWeight: 500,
    marginTop: '0.125rem',
  },
  helperText: {
    fontSize: '0.6875rem',
    color: '#64748B',
    lineHeight: '1.3',
    marginTop: '0.125rem',
  },
  governanceNotice: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.6875rem',
    color: '#475569',
    lineHeight: '1.4',
    marginTop: '0.25rem',
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
    marginTop: '0.5rem',
  },
  toggleArea: {
    textAlign: 'center',
    margin: '0.25rem 0',
  },
  toggleText: {
    fontSize: '0.8125rem',
    color: '#475569',
    margin: 0,
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#0284C7',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0 0.25rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '0.5rem 0',
  },
  dividerLine: {
    flex: 1,
    borderBottom: '1px solid #E2E8F0',
  },
  dividerText: {
    padding: '0 1rem',
    color: '#94A3B8',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  demoButton: {
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1px dashed #CBD5E1',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  demoNotice: {
    fontSize: '0.6875rem',
    color: '#64748B',
    textAlign: 'center',
    marginTop: '0.25rem',
    lineHeight: '1.4',
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
