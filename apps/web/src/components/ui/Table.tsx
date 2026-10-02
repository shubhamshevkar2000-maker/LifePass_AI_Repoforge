import React from 'react';
import { Spinner } from './Spinner';
import { theme } from '../../styles/theme';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps {
  columns: TableColumn[];
  children?: React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}

export const Table: React.FC<TableProps> = ({
  columns,
  children,
  emptyMessage = 'No records found.',
  isLoading = false,
}) => {
  const hasRows = React.Children.count(children) > 0;

  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: '0.5rem',
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        boxShadow: theme.shadows.xs,
        boxSizing: 'border-box',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.8125rem',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: theme.colors.surfaceSubtle,
              borderBottom: `1px solid ${theme.colors.border}`,
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: theme.colors.textSecondary,
                  textAlign: col.align || 'left',
                  width: col.width || 'auto',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: theme.colors.textMuted,
                }}
              >
                <Spinner size="md" label="Loading table records..." />
              </td>
            </tr>
          )}

          {!isLoading && !hasRows && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: theme.colors.textMuted,
                  fontSize: '0.875rem',
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading && hasRows && children}
        </tbody>
      </table>
    </div>
  );
};
