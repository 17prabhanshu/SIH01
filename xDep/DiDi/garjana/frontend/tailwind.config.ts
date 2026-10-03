import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        g: {
          bg: '#0a0b0f',
          surface: '#12141c',
          panel: '#181a24',
          border: '#262936',
          'border-light': '#363948',
          text: '#e8eaf0',
          'text-dim': '#8b8fa3',
          'text-muted': '#565a6e',
          accent: '#6366f1',
          'accent-dim': '#4f46e5',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981',
          orange: '#f97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'metric': ['2rem', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'telemetry': ['0.6875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.08em' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sweep': 'sweep 2s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)', opacity: '0.8' },
          '100%': { transform: 'rotate(360deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99,102,241,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(99,102,241,0.4)' },
        },
      },
      backgroundImage: {
        'grid-subtle': 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
export default config
