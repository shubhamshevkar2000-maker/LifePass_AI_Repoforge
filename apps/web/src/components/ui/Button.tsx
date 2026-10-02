import React from 'react';
import { Spinner } from './Spinner';
import { theme } from '../../styles/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon,
  fullWidth = false,
  children,
  style,
  ...props
}) => {
  const isActionDisabled = disabled || isLoading;

  // Base sizing styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.75rem',
      gap: '0.375rem',
    },
    md: {
      padding: '0.55rem 1rem',
      fontSize: '0.875rem',
      gap: '0.5rem',
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      gap: '0.625rem',
    },
  };

  // Variant color styles
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textInverse,
      border: `1px solid ${theme.colors.primary}`,
      fontWeight: 600,
      boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.2)',
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.textPrimary,
      border: `1px solid ${theme.colors.borderDark}`,
      fontWeight: 600,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: theme.colors.textInverse,
      border: `1px solid ${theme.colors.danger}`,
      fontWeight: 600,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.textSecondary,
      border: '1px solid transparent',
      fontWeight: 600,
    },
  };

  const combinedStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.5rem',
    cursor: isActionDisabled ? 'not-allowed' : 'pointer',
    opacity: isActionDisabled ? 0.6 : 1,
    transition: 'background-color 0.15s ease, opacity 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
    outline: 'none',
    boxSizing: 'border-box',
    width: fullWidth ? '100%' : 'auto',
    lineHeight: 1.25,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  const spinnerColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.textInverse
      : theme.colors.primary;

  return (
    <button
      type={type}
      disabled={isActionDisabled}
      aria-busy={isLoading}
      aria-disabled={isActionDisabled}
      style={combinedStyles}
      {...props}
    >
      {isLoading && (
        <Spinner
          size={size === 'lg' ? 'md' : 'sm'}
          color={spinnerColor}
        />
      )}
      {!isLoading && icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
