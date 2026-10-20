/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Figtree', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Semantic Canvas & Surface Tokens
        canvas: 'var(--canvas)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--text-primary)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar-bg)',
          border: 'var(--sidebar-border)',
          foreground: 'var(--sidebar-text)',
          muted: 'var(--sidebar-muted)',
        },
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',

        // Primary Pedagogical Purple System
        primary: {
          DEFAULT: '#6541F5',
          deep: '#5230E8',
          tint: '#EAE7FF',
          dark: '#7C5CFA',
        },

        // Semantic Subject & Status Accents
        math: {
          DEFAULT: '#42A5E8',
          badge: 'var(--math-badge)',
        },
        science: {
          DEFAULT: '#19B99A',
          badge: 'var(--science-badge)',
        },
        streak: {
          DEFAULT: '#E95778',
          badge: 'var(--streak-badge)',
        },
        quest: {
          DEFAULT: '#F5A623',
          badge: 'var(--quest-badge)',
        },
        success: '#28B987',
        destructive: '#F43F5E',

        // Subject aliases for legacy / component compatibility
        brand: {
          50: '#F5F5FA',
          100: '#EAE7FF',
          200: '#D4CEFD',
          300: '#B0A3FB',
          400: '#8B76F8',
          500: '#6541F5',
          600: '#5230E8',
          700: '#4021CA',
          800: '#3117A1',
          900: '#230F77',
        },
        playlab: {
          50: '#FFF9ED',
          100: '#FFF0D5',
          400: '#F7B74A',
          500: '#F5A623',
          600: '#D9890F',
          700: '#B36D08',
          900: '#5A3402',
        },
        circuit: {
          50: '#EDFCF7',
          100: '#DDF8EE',
          400: '#2CD4B2',
          500: '#19B99A',
          600: '#139B80',
          700: '#0F7A65',
          900: '#073E34',
        },
        code: {
          50: '#F7F5FE',
          100: '#EAE7FF',
          400: '#8B76F8',
          500: '#6541F5',
          600: '#5230E8',
          700: '#4021CA',
          900: '#230F77',
        },
        surface: {
          50: 'var(--surface-50)',
          100: 'var(--surface-100)',
          200: 'var(--surface-200)',
          300: 'var(--surface-300)',
          400: 'var(--surface-400)',
          500: 'var(--surface-500)',
          600: 'var(--surface-600)',
          700: 'var(--surface-700)',
          800: 'var(--surface-800)',
          900: 'var(--surface-900)',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(101, 65, 245, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'purple-glow': '0 4px 16px -2px rgba(101, 65, 245, 0.25)',
        'card': '0 2px 8px 0 rgba(101, 65, 245, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 8px 24px -4px rgba(101, 65, 245, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'game': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glow-brand': '0 0 20px rgba(101, 65, 245, 0.3)',
        'glow-playlab': '0 0 20px rgba(245, 166, 35, 0.3)',
        'glow-circuit': '0 0 20px rgba(25, 185, 154, 0.3)',
        'glow-code': '0 0 20px rgba(101, 65, 245, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        'xl': '0.75rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'dice-roll': 'diceRoll 0.6s ease-out',
        'token-hop': 'tokenHop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        diceRoll: { '0%': { transform: 'rotate(0deg) scale(1)' }, '25%': { transform: 'rotate(90deg) scale(1.2)' }, '50%': { transform: 'rotate(180deg) scale(1)' }, '75%': { transform: 'rotate(270deg) scale(1.2)' }, '100%': { transform: 'rotate(360deg) scale(1)' } },
        tokenHop: { '0%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-20px) scale(1.1)' }, '100%': { transform: 'translateY(0) scale(1)' } },
      },
    },
  },
  plugins: [],
};
