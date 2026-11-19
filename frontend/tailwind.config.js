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
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',

        // Single intentional accent (Sky/Cyan instrument)
        accent: {
          DEFAULT: '#38bdf8',
          hover: '#0ea5e9',
          muted: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.25)',
        },

        // Semantic states (toned to sit quietly inside the palette)
        added: {
          DEFAULT: '#4cc38a',
          muted: 'rgba(76, 195, 138, 0.12)',
          border: 'rgba(76, 195, 138, 0.25)',
        },
        edited: {
          DEFAULT: '#e5a43b',
          muted: 'rgba(229, 164, 59, 0.12)',
          border: 'rgba(229, 164, 59, 0.25)',
        },
        removed: {
          DEFAULT: '#e5484d',
          muted: 'rgba(229, 72, 77, 0.12)',
          border: 'rgba(229, 72, 77, 0.25)',
        },
        parserFailure: {
          DEFAULT: '#a78bfa',
          muted: 'rgba(167, 139, 250, 0.12)',
          border: 'rgba(167, 139, 250, 0.25)',
        },
        sourceDown: {
          DEFAULT: '#94a3b8',
          muted: 'rgba(148, 163, 184, 0.12)',
          border: 'rgba(148, 163, 184, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
