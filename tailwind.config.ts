import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: '#0a0e14',
          panel: '#121820',
          border: '#1e2530',
          accent: '#2dd4bf',
          warning: '#fbbf24',
          danger: '#ef4444',
          text: '#e5e7eb',
          textDim: '#9ca3af',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
