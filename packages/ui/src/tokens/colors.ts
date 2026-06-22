// ---------------------------------------------------------------------------
// Design tokens — raw values + CSS variable names
// ---------------------------------------------------------------------------

export const colors = {
  primary: '#534AB7',
  primaryLight: '#EEEDFE',
  success: '#1D9E75',
  successLight: '#E1F5EE',
  warning: '#BA7517',
  warningLight: '#FAEEDA',
  danger: '#A32D2D',
  dangerLight: '#FCEBEB',
  info: '#185FA5',
  infoLight: '#E6F1FB',
  neutral: '#888780',
  neutralLight: '#F1EFE8',
  background: '#FFFFFF',
  surface: '#F1EFE8',
  border: '#D3D1C7',
  borderStrong: '#B4B2A9',
  textPrimary: '#2C2C2A',
  textSecondary: '#5F5E5A',
  textTertiary: '#888780',
} as const

export type ColorToken = keyof typeof colors

export const cssVarNames: Record<ColorToken, string> = {
  primary: '--color-primary',
  primaryLight: '--color-primary-light',
  success: '--color-success',
  successLight: '--color-success-light',
  warning: '--color-warning',
  warningLight: '--color-warning-light',
  danger: '--color-danger',
  dangerLight: '--color-danger-light',
  info: '--color-info',
  infoLight: '--color-info-light',
  neutral: '--color-neutral',
  neutralLight: '--color-neutral-light',
  background: '--color-background',
  surface: '--color-surface',
  border: '--color-border',
  borderStrong: '--color-border-strong',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textTertiary: '--color-text-tertiary',
}

/** Generate a CSS :root block with all color variables */
export function colorsCssRoot(): string {
  const lines = (Object.keys(colors) as ColorToken[]).map(
    (key) => `  ${cssVarNames[key]}: ${colors[key]};`,
  )
  return `:root {\n${lines.join('\n')}\n}`
}

// ---------------------------------------------------------------------------
// Status config (used across platforms)
// ---------------------------------------------------------------------------

export const STATUS_CONFIG = {
  agendada: { label: 'Agendada', color: '#185FA5', bg: '#E6F1FB' },
  em_andamento: { label: 'Em andamento', color: '#854F0B', bg: '#FAEEDA' },
  concluida: { label: 'Concluída', color: '#0F6E56', bg: '#E1F5EE' },
  paga: { label: 'Paga', color: '#3B6D11', bg: '#EAF3DE' },
  cancelada: { label: 'Cancelada', color: '#791F1F', bg: '#FCEBEB' },
} as const

// ---------------------------------------------------------------------------
// Spacing / radius / font size tokens
// ---------------------------------------------------------------------------

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
} as const

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
} as const

export const fontSize = {
  sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28,
} as const
