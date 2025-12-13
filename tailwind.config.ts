import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#ffffff',
          dark: '#0a0a0a',
        },
        surface: {
          light: '#f8f9fa',
          dark: '#1a1a1a',
        },
        border: {
          light: '#e9ecef',
          dark: '#333333',
        },
        text: {
          light: '#1a1a1a',
          dark: '#ffffff',
        },
        secondary: {
          light: '#666666',
          dark: '#b0b0b0',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config
