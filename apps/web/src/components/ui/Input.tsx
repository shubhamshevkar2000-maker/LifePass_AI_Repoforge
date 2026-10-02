import React, { useId } from 'react';
import { theme } from '../../styles/theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  id,
  fullWidth = true,
  disabled = false,
  required = false,
  style,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        width: fullWidth ? '100%' : 'auto',
        boxSizing: 'border-box',
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: theme.colors.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: theme.colors.danger }}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${error ? theme.colors.danger : theme.colors.borderDark}`,
          borderRadius: '0.5rem',
          padding: '0.625rem 0.875rem',
          color: theme.colors.textPrimary,
          fontSize: '0.875rem',
          outline: 'none',
          boxSizing: 'border-box',
          width: '100%',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: theme.shadows.xs,
          ...style,
        }}
        {...props}
      />

      {error && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: theme.colors.dangerText,
            fontWeight: 500,
          }}
        >
          {error}
        </span>
      )}

      {!error && hint && (
        <span
          id={hintId}
          style={{
            fontSize: '0.6875rem',
            color: theme.colors.textMuted,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
};
