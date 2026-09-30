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
        garjana: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#0f3460',
          warning: '#e94560',
          success: '#00b894',
          info: '#0984e3',
          dark: '#0a0a1a',
        },
      },
    },
  },
  plugins: [],
}
export default config
