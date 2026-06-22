import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#534AB7',
          50: '#EEEDFA',
          100: '#D9D6F3',
          200: '#B3ADE7',
          300: '#8D84DB',
          400: '#675BCF',
          500: '#534AB7',
          600: '#423B92',
          700: '#322C6E',
          800: '#211E49',
          900: '#110F25',
        },
        success: {
          DEFAULT: '#1D9E75',
          50: '#E8F7F2',
          500: '#1D9E75',
          700: '#146E52',
        },
        warning: {
          DEFAULT: '#BA7517',
          50: '#FBF3E6',
          500: '#BA7517',
          700: '#825210',
        },
        danger: {
          DEFAULT: '#A32D2D',
          50: '#F9EAEA',
          500: '#A32D2D',
          700: '#721F1F',
        },
        info: {
          DEFAULT: '#185FA5',
          50: '#E7F0F9',
          500: '#185FA5',
          700: '#104273',
        },
        surface: '#F1EFE8',
        border: '#D3D1C7',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
