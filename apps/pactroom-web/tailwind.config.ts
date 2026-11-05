import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Lindy Warm Aesthetic Palette
        ivory: {
          DEFAULT: '#FAFAF8',
          surface: '#F5F5F0',
          border: '#EAE8E2',
          card: '#FFFFFF'
        },
        peach: {
          50: '#FFF8F4',
          100: '#FFF0E6',
          200: '#FFE0CC',
          300: '#FFCA99',
          400: '#FFAA66',
          500: '#F97316'
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B'
        },
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9'
        },
        emerald: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981'
        },
        violet: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6'
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
      },
      boxShadow: {
        'soft-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'soft-md': '0 6px 24px -4px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 16px 40px -8px rgba(0, 0, 0, 0.08)',
        'soft-xl': '0 25px 60px -15px rgba(0, 0, 0, 0.08)',
        'sunset-glow': '0 20px 80px -10px rgba(253, 164, 83, 0.25)'
      }
    }
  },
  plugins: []
};

export default config;
