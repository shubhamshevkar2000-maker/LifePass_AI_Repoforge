import React from 'react';

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
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
      color: '#CBD5E1',
    },
    success: {
      backgroundColor: '#064E3B',
      border: '1px solid #059669',
      color: '#34D399',
    },
    warning: {
      backgroundColor: '#3B2900',
      border: '1px solid #78350F',
      color: '#FDE68A',
    },
    danger: {
      backgroundColor: '#450A0A',
      border: '1px solid #991B1B',
      color: '#F87171',
    },
    info: {
      backgroundColor: '#082F49',
      border: '1px solid #0284C7',
      color: '#38BDF8',
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
