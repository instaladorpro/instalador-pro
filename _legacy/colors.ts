export const colors = {
  primary:    '#534AB7',
  primaryLight: '#EEEDFE',
  success:    '#1D9E75',
  successLight: '#E1F5EE',
  warning:    '#BA7517',
  warningLight: '#FAEEDA',
  danger:     '#A32D2D',
  dangerLight: '#FCEBEB',
  info:       '#185FA5',
  infoLight:  '#E6F1FB',
  neutral:    '#888780',
  neutralLight: '#F1EFE8',
  background: '#FFFFFF',
  surface:    '#F1EFE8',
  border:     '#D3D1C7',
  borderStrong: '#B4B2A9',
  textPrimary:   '#2C2C2A',
  textSecondary: '#5F5E5A',
  textTertiary:  '#888780',
}

export const STATUS_CONFIG = {
  agendada:     { label: 'Agendada',     color: '#185FA5', bg: '#E6F1FB' },
  em_andamento: { label: 'Em andamento', color: '#854F0B', bg: '#FAEEDA' },
  concluida:    { label: 'Concluída',    color: '#0F6E56', bg: '#E1F5EE' },
  paga:         { label: 'Paga',         color: '#3B6D11', bg: '#EAF3DE' },
  cancelada:    { label: 'Cancelada',    color: '#791F1F', bg: '#FCEBEB' },
} as const

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
}

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
}

export const font = {
  sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28,
}
