/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#2563EB', 50:'#EFF6FF', 100:'#DBEAFE', 500:'#3B82F6', 600:'#2563EB', 700:'#1D4ED8', 900:'#1E3A8A' },
        accent:   { DEFAULT: '#7C3AED', 500:'#8B5CF6', 600:'#7C3AED' },
        surface:  { DEFAULT: '#F8FAFC', dark:'#0F172A' },
        border:   { DEFAULT: '#E2E8F0', dark:'#1E293B' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem' },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.10)',
        glow: '0 0 20px rgb(37 99 235 / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                   to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}