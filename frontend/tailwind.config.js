/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',

        // Semantic states
        added: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
          subtle: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.25)',
        },
        edited: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
          subtle: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.25)',
        },
        removed: {
          DEFAULT: '#F43F5E',
          light: '#FB7185',
          dark: '#E11D48',
          subtle: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.25)',
        },
        parserFailure: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          subtle: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.25)',
        },
        sourceDown: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
          subtle: 'rgba(100, 116, 139, 0.12)',
          border: 'rgba(100, 116, 139, 0.25)',
        },

        // Radar Theme Accent Gradients
        cyan: {
          DEFAULT: '#22D3EE',
          glow: 'rgba(34, 211, 238, 0.3)',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          glow: 'rgba(139, 92, 246, 0.3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px -5px rgba(34, 211, 238, 0.15)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
