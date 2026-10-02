/**
 * LifePass AI — Centralized Light Theme Tokens
 * Visual Source of Truth: Clean, modern SaaS / Product aesthetic
 *
 * Directional Reference:
 * - Page Background: Very light neutral / soft blue-tinted (#F8FAFC)
 * - White Surface: Pure white (#FFFFFF)
 * - Light Blue Accent: Soft blue (#EFF6FF / #E0F2FE)
 * - Primary Blue: LifePass Blue (#2563EB / #1D4ED8)
 * - Text Primary: Dark Navy (#0F172A)
 * - Text Secondary: Slate (#475569 / #64748B)
 * - Borders: Subtle Slate (#E2E8F0 / #CBD5E1)
 * - Success: Green (#16A34A / #22C55E)
 * - Warning: Amber (#D97706 / #F59E0B)
 * - Danger/Error: Red (#DC2626 / #EF4444)
 */

export const theme = {
  colors: {
    // Page & Canvas
    pageBg: '#F8FAFC',
    pageBgAlt: '#F1F5F9',

    // Surfaces & Cards
    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAFC',
    surfaceMuted: '#F1F5F9',
    surfaceAccent: '#EFF6FF',
    surfaceAccentHover: '#DBEAFE',

    // Primary Branding (LifePass Blue)
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primaryActive: '#1E40AF',
    primaryLight: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    primaryGlow: 'rgba(37, 99, 235, 0.12)',

    // Typography
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textDim: '#94A3B8',
    textInverse: '#FFFFFF',

    // Borders & Dividers
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',
    borderFocus: '#2563EB',

    // Semantic Status: Success
    success: '#16A34A',
    successBg: '#DCFCE7',
    successBorder: '#BBF7D0',
    successText: '#15803D',

    // Semantic Status: Warning
    warning: '#D97706',
    warningBg: '#FEF3C7',
    warningBorder: '#FDE68A',
    warningText: '#B45309',

    // Semantic Status: Danger / Missing / Error
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    dangerBorder: '#FECACA',
    dangerText: '#B91C1C',

    // Semantic Status: Info / Informational
    info: '#2563EB',
    infoBg: '#EFF6FF',
    infoBorder: '#BFDBFE',
    infoText: '#1D4ED8',

    // Neutral Badge
    neutralBg: '#F1F5F9',
    neutralBorder: '#E2E8F0',
    neutralText: '#475569',
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
  },
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
} as const;

export type Theme = typeof theme;
