import React from 'react';
import { theme } from '../../styles/theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  style,
  ...props
}) => {
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '0.15rem 0.45rem',
      fontSize: '0.625rem',
      letterSpacing: '0.04em',
    },
    md: {
      padding: '0.25rem 0.625rem',
      fontSize: '0.75rem',
      letterSpacing: '0.05em',
    },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    neutral: {
      backgroundColor: theme.colors.neutralBg,
      border: `1px solid ${theme.colors.neutralBorder}`,
      color: theme.colors.neutralText,
    },
    success: {
      backgroundColor: theme.colors.successBg,
      border: `1px solid ${theme.colors.successBorder}`,
      color: theme.colors.successText,
    },
    warning: {
      backgroundColor: theme.colors.warningBg,
      border: `1px solid ${theme.colors.warningBorder}`,
      color: theme.colors.warningText,
    },
    danger: {
      backgroundColor: theme.colors.dangerBg,
      border: `1px solid ${theme.colors.dangerBorder}`,
      color: theme.colors.dangerText,
    },
    info: {
      backgroundColor: theme.colors.infoBg,
      border: `1px solid ${theme.colors.infoBorder}`,
      color: theme.colors.infoText,
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.375rem',
        fontWeight: 700,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
