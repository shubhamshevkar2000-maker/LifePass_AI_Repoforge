import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const IndividualAuthView: React.FC = () => {
  const { login, signUpIndividual, error, clearError, setSelectedPortal } = useInstitutionAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [contact, setContact] = useState('');
  const [identityType, setIdentityType] = useState('National ID / Aadhaar');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateLogin = (): boolean => {
    const errs: Record<string, string> = {};
    if (!loginUsername.trim()) {
      errs.username = 'Username is required.';
    }
    if (!loginPassword) {
      errs.password = 'Password is required.';
    } else if (loginPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = (): boolean => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!signupUsername.trim()) {
      errs.signupUsername = 'Username is required.';
    } else if (signupUsername.trim().length < 3) {
      errs.signupUsername = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(signupUsername.trim())) {
      errs.signupUsername = 'Username may only contain letters, numbers, underscores, and dashes.';
    }
    if (!contact.trim()) {
      errs.contact = 'Contact phone number or email is required.';
    }
    if (!signupPassword) {
      errs.signupPassword = 'Password is required.';
    } else if (signupPassword.length < 6) {
      errs.signupPassword = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (confirmPassword !== signupPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessNotice(null);

    if (!validateLogin()) return;

    setIsSubmitting(true);
    await login(loginUsername, loginPassword, 'INDIVIDUAL');
    setIsSubmitting(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessNotice(null);

    if (!validateSignup()) return;

    setIsSubmitting(true);
    const res = await signUpIndividual({
      fullName,
      username: signupUsername,
      phone: contact,
      identityType,
      password: signupPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessNotice('Account created successfully. Logging you in...');
    }
  };

  return (
    <Card style={styles.card}>
      {/* Back to landing */}
      <button
        type="button"
        onClick={() => setSelectedPortal('landing')}
        style={styles.backButton}
      >
        ← Back to Experience Selection
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Badge variant="success" size="sm" style={{ marginBottom: '0.75rem' }}>
          INDIVIDUAL VAULT
        </Badge>
        <h1 style={styles.title}>
          {mode === 'login' ? 'Sign In to Your Vault' : 'Create Individual Account'}
        </h1>
        <p style={styles.subtitle}>
          {mode === 'login'
            ? 'Access your personal records, life-stage AI assistant, and consent controls.'
            : 'Register to manage your verified records and share only what you approve.'}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div style={styles.tabContainer}>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            clearError();
            setFormErrors({});
          }}
          style={mode === 'login' ? styles.tabActive : styles.tabInactive}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            clearError();
            setFormErrors({});
          }}
          style={mode === 'signup' ? styles.tabActive : styles.tabInactive}
        >
          Register
        </button>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div style={styles.successBanner}>
          {successNotice}
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div style={styles.errorBanner}>
          <strong>Authentication Notice:</strong> {error}
        </div>
      )}

      {/* Login Mode */}
      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit} style={styles.form}>
          <Input
            label="Portal Username"
            placeholder="e.g. rahul_sharma or john_citizen"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            error={formErrors.username}
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password (min 6 chars)"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            error={formErrors.password}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
            style={{ marginTop: '0.5rem' }}
          >
            Sign In to Personal Vault
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearError();
                setFormErrors({});
              }}
              style={styles.switchLink}
            >
              First time using LifePass? Create an account →
            </button>
          </div>
        </form>
      ) : (
        /* Signup Mode */
        <form onSubmit={handleSignupSubmit} style={styles.form}>
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={formErrors.fullName}
            required
          />

          <Input
            label="Choose Username"
            placeholder="e.g. rahul_sharma"
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            error={formErrors.signupUsername}
            hint="Lowercase letters, numbers, and underscores only"
            required
          />

          <Input
            label="Contact Phone / Email"
            placeholder="e.g. +91 98765 43210 or user@example.com"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            error={formErrors.contact}
            hint="Used for verification notices and access alerts"
            required
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={styles.selectLabel}>
              Primary Identity Document <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={identityType}
              onChange={(e) => setIdentityType(e.target.value)}
              style={styles.select}
            >
              <option value="National ID / Aadhaar">National ID / Aadhaar</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Student ID">Student ID</option>
            </select>
          </div>

          <Input
            label="Create Password"
            type="password"
            placeholder="At least 6 characters"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            error={formErrors.signupPassword}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={formErrors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
            style={{ marginTop: '0.5rem' }}
          >
            Create Personal Vault
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
                setFormErrors({});
              }}
              style={styles.switchLink}
            >
              Already have an account? Sign in here →
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        Personal record owner identity. Explicit consent required before any record is shared.
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    maxWidth: '480px',
    width: '100%',
    padding: '2rem',
    borderRadius: '1rem',
    backgroundColor: '#111827',
    border: '1px solid #1F2937',
    boxSizing: 'border-box',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#0EA5E9',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '1rem',
    textAlign: 'left',
    display: 'inline-block',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#F9FAFB',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#9CA3AF',
    margin: 0,
    lineHeight: 1.4,
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #1F2937',
    marginBottom: '1.5rem',
  },
  tabActive: {
    flex: 1,
    padding: '0.625rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid #10B981',
    color: '#F9FAFB',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  tabInactive: {
    flex: 1,
    padding: '0.625rem',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#6B7280',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  selectLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#D1D5DB',
  },
  select: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    backgroundColor: '#090D16',
    border: '1px solid #1F2937',
    borderRadius: '0.5rem',
    color: '#F9FAFB',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  switchLink: {
    background: 'none',
    border: 'none',
    color: '#10B981',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    padding: '0.25rem',
    fontWeight: 600,
  },
  successBanner: {
    backgroundColor: '#064E3B',
    border: '1px solid #059669',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#A7F3D0',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#450A0A',
    border: '1px solid #991B1B',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '0.75rem',
    color: '#FECACA',
    marginBottom: '1rem',
  },
  footer: {
    marginTop: '1.5rem',
    borderTop: '1px solid #1F2937',
    paddingTop: '1rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#9CA3AF',
    lineHeight: 1.4,
  },
};
