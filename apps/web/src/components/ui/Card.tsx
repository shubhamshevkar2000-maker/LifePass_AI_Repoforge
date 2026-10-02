import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  footer,
  padding = 'md',
  children,
  style,
  ...props
}) => {
  const paddingMap = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const hasHeader = Boolean(title || subtitle || headerAction);

  return (
    <div
      style={{
        backgroundColor: '#111827',
        border: '1px solid #1F2937',
        borderRadius: '0.75rem',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...props}
    >
      {hasHeader && (
        <div
          style={{
            padding: paddingMap[padding],
            paddingBottom: children ? '0.75rem' : paddingMap[padding],
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: children ? '1px solid #1F2937' : 'none',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#F9FAFB',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#9CA3AF',
                  margin: '0.25rem 0 0 0',
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div style={{ flexShrink: 0 }}>{headerAction}</div>}
        </div>
      )}

      {children && (
        <div
          style={{
            padding: paddingMap[padding],
            flex: 1,
          }}
        >
          {children}
        </div>
      )}

      {footer && (
        <div
          style={{
            padding: paddingMap[padding],
            paddingTop: '0.75rem',
            borderTop: '1px solid #1F2937',
            backgroundColor: '#0E1524',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
