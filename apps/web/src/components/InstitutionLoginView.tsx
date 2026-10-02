import React, { useState } from 'react';
import { useInstitutionAuth } from '../context/InstitutionAuthContext';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const InstitutionLoginView: React.FC = () => {
  const { login, signUp, error, clearError } = useInstitutionAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [fullName, setFullName] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('bank');
  const [phone, setPhone] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    clearError();
    setFormErrors({});
    setSuccessNotice(null);
  };

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
    if (!fullName.trim()) errs.fullName = 'Officer Full Name is required.';
    if (!institutionName.trim()) errs.institutionName = 'Institution Name is required.';
    if (!institutionType.trim()) errs.institutionType = 'Institution Type is required.';
    
    const cleanedPhone = phone.trim().replace(/[\s-]/g, '');
    if (!phone.trim()) {
      errs.phone = 'Official Contact Phone is required.';
    } else if (cleanedPhone.length < 8) {
      errs.phone = 'Please enter a valid phone number with country code.';
    }

    if (!signupUsername.trim()) {
      errs.signupUsername = 'Portal Username is required.';
    } else if (signupUsername.trim().length < 3) {
      errs.signupUsername = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(signupUsername.trim())) {
      errs.signupUsername = 'Username may only contain letters, numbers, underscores, and dashes.';
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
    await login(loginUsername, loginPassword);
    setIsSubmitting(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessNotice(null);

    if (!validateSignup()) return;

    setIsSubmitting(true);
    const res = await signUp({
      fullName,
      institutionName,
      institutionType,
      phone,
      username: signupUsername,
      password: signupPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessNotice('Institution account registered successfully.');
    }
  };

  return (
    <Card
      style={{
        maxWidth: mode === 'signup' ? '540px' : '440px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
      padding="lg"
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Badge variant="info" size="sm" style={{ marginBottom: '0.75rem' }}>
          INSTITUTION PORTAL
        </Badge>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#F9FAFB',
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          LifePass Institution Portal
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: 0 }}>
          Unified Life-Stage Digital Identity & Verification Network
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#090D16',
          borderRadius: '0.5rem',
          padding: '0.25rem',
          marginBottom: '1.25rem',
          border: '1px solid #1F2937',
        }}
      >
        <button
          type="button"
          onClick={() => switchMode('login')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: mode === 'login' ? '#1E293B' : 'transparent',
            color: mode === 'login' ? '#38BDF8' : '#9CA3AF',
            transition: 'all 0.15s ease',
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: mode === 'signup' ? '#1E293B' : 'transparent',
            color: mode === 'signup' ? '#38BDF8' : '#9CA3AF',
            transition: 'all 0.15s ease',
          }}
        >
          Register Institution
        </button>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div
          style={{
            backgroundColor: '#064E3B',
            border: '1px solid #059669',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            fontSize: '0.75rem',
            color: '#34D399',
            marginBottom: '1rem',
            lineHeight: 1.4,
          }}
        >
          {successNotice}
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            backgroundColor: '#450A0A',
            border: '1px solid #991B1B',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            fontSize: '0.75rem',
            color: '#F87171',
            marginBottom: '1rem',
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. LOGIN FORM                                                   */}
      {/* ================================================================ */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Username"
            placeholder="e.g. sarah_jenkins"
            value={loginUsername}
            onChange={(e) => {
              setLoginUsername(e.target.value);
              if (formErrors.username) setFormErrors((prev) => ({ ...prev, username: '' }));
            }}
            error={formErrors.username}
            disabled={isSubmitting}
            autoFocus
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={loginPassword}
            onChange={(e) => {
              setLoginPassword(e.target.value);
              if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={formErrors.password}
            disabled={isSubmitting}
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
            Sign In
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Register Institution / Create Account →
            </button>
          </div>
        </form>
      )}

      {/* ================================================================ */}
      {/* 2. SIGN UP FORM                                                 */}
      {/* ================================================================ */}
      {mode === 'signup' && (
        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Input
            label="Officer Full Name"
            placeholder="e.g. Dr. Sarah Jenkins"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={formErrors.fullName}
            disabled={isSubmitting}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            <Input
              label="Institution Name"
              placeholder="e.g. Apex National Bank"
              value={institutionName}
              onChange={(e) => {
                setInstitutionName(e.target.value);
                if (formErrors.institutionName) setFormErrors((prev) => ({ ...prev, institutionName: '' }));
              }}
              error={formErrors.institutionName}
              disabled={isSubmitting}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E5E7EB' }}>
                Institution Type <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#090D16',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  color: '#F9FAFB',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                <option value="bank">Bank / Financial Institution</option>
                <option value="university">College / University</option>
                <option value="employer">Employer / Corporate</option>
                <option value="government">Government / Public Agency</option>
                <option value="other">Other Organization</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            <Input
              label="Official Contact Phone"
              type="tel"
              placeholder="+14155552671"
              hint="Include country code with +"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
              }}
              error={formErrors.phone}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Portal Username"
              placeholder="e.g. sarah_jenkins"
              value={signupUsername}
              onChange={(e) => {
                setSignupUsername(e.target.value);
                if (formErrors.signupUsername) setFormErrors((prev) => ({ ...prev, signupUsername: '' }));
              }}
              error={formErrors.signupUsername}
              disabled={isSubmitting}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              value={signupPassword}
              onChange={(e) => {
                setSignupPassword(e.target.value);
                if (formErrors.signupPassword) setFormErrors((prev) => ({ ...prev, signupPassword: '' }));
              }}
              error={formErrors.signupPassword}
              disabled={isSubmitting}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={formErrors.confirmPassword}
              disabled={isSubmitting}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isSubmitting}
            style={{ marginTop: '0.5rem' }}
          >
            Register Institution
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Already registered? Sign In →
            </button>
          </div>
        </form>
      )}

      {/* Neutral Footer Notice */}
      <div
        style={{
          marginTop: '1.5rem',
          borderTop: '1px solid #1F2937',
          paddingTop: '1rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9CA3AF',
          lineHeight: 1.4,
        }}
      >
        Secure institution access will be connected during final platform integration.
      </div>
    </Card>
  );
};
