export const designTokens = {
  colors: {
    primary: 'oklch(0.66 0.20 258)',
    secondary: 'oklch(0.25 0.018 260)',
    accent: 'oklch(0.62 0.22 285)',
    success: 'oklch(0.72 0.16 160)',
    warning: 'oklch(0.78 0.16 70)',
    danger: 'oklch(0.62 0.22 22)',
    surface: 'oklch(0.20 0.014 260)',
    surfaceElevated: 'oklch(0.22 0.014 260 / 0.75)',
    glassSurface: 'oklch(0.22 0.014 260 / 0.55)',
    borderSubtle: 'oklch(1 0 0 / 0.08)',
    textPrimary: 'oklch(0.98 0.005 240)',
    textSecondary: 'oklch(0.68 0.018 250)',
  },
  gradients: {
    premium: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    surface: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  },
  shadows: {
    glow: '0 0 24px -6px color-mix(in oklab, var(--electric) 50%, transparent)',
    premium: '0 30px 60px -30px rgba(0,0,0,0.6), 0 18px 36px -18px rgba(0,0,0,0.4)',
    card: '0 1px 0 0 color-mix(in oklab, white 6%, transparent) inset, 0 12px 32px -16px rgba(0,0,0,0.6)',
  },
  radius: {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.75rem',
  },
  spacing: {
    xs: '0.375rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },
  motion: {
    fast: '150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    base: '240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    slow: '360ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
} as const;

export const themeTokens = designTokens;
