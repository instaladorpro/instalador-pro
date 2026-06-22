import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D8C3C',
          50: '#EDFBF0',
          100: '#D1F4D9',
          200: '#A3E9B3',
          300: '#5FD47A',
          400: '#38B854',
          500: '#2D8C3C',
          600: '#236E2F',
          700: '#1E5B27',
          800: '#194A21',
          900: '#0F2E14',
        },
        accent: {
          DEFAULT: '#E5A100',
          50: '#FFF9E6',
          100: '#FFF3D0',
          200: '#FFE599',
          300: '#FFD666',
          400: '#F0B800',
          500: '#E5A100',
          600: '#B88100',
          700: '#8A6100',
        },
        success: {
          DEFAULT: '#16A34A',
          50: '#EDFCF2',
          500: '#16A34A',
          700: '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          500: '#D97706',
          700: '#A16207',
        },
        danger: {
          DEFAULT: '#DC2626',
          50: '#FEF2F2',
          500: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          500: '#2563EB',
          700: '#1D4ED8',
        },
        surface: '#F8F7F4',
        border: '#E5E2DB',
        foreground: '#1A1A1A',
        secondary: '#6B7280',
        muted: '#9CA3AF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'modal': '0 20px 60px -12px rgb(0 0 0 / 0.15)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
