import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#111827',
        surface: '#1f2937',
        card: '#1f2937',
        border: '#374151',
        'border-hover': '#4b5563',
        'text-primary': '#f9fafb',
        'text-secondary': '#9ca3af',
        'text-muted': '#6b7280',
        accent: '#f97316',
        'accent-soft': 'rgba(249,115,22,0.12)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
