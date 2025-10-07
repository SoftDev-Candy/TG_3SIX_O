import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        'travel-guardian': {
          'primary': '#059669',        // Emerald-600 (our brand green)
          'primary-content': '#ffffff',
          'secondary': '#0d9488',      // Teal-600 (accent)
          'secondary-content': '#ffffff',
          'accent': '#3b82f6',         // Blue-500 (for highlights)
          'accent-content': '#ffffff',
          'neutral': '#374151',        // Gray-700
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',       // White background
          'base-200': '#f8fafc',       // Gray-50
          'base-300': '#f1f5f9',       // Gray-100
          'base-content': '#0f172a',   // Gray-900 (text)
          'info': '#3b82f6',           // Blue-500
          'info-content': '#ffffff',
          'success': '#22c55e',        // Green-500
          'success-content': '#ffffff',
          'warning': '#f59e0b',        // Amber-500
          'warning-content': '#ffffff',
          'error': '#ef4444',          // Red-500
          'error-content': '#ffffff',
        },
        'travel-guardian-dark': {
          'primary': '#3b82f6',        // Blue-500 (dark mode primary)
          'primary-content': '#ffffff',
          'secondary': '#6366f1',      // Indigo-500
          'secondary-content': '#ffffff',
          'accent': '#10b981',         // Emerald-500
          'accent-content': '#ffffff',
          'neutral': '#94a3b8',        // Slate-400
          'neutral-content': '#1e293b',
          'base-100': '#1e293b',       // Slate-800
          'base-200': '#334155',       // Slate-700
          'base-300': '#475569',       // Slate-600
          'base-content': '#f1f5f9',   // Slate-100 (text)
          'info': '#3b82f6',           // Blue-500
          'info-content': '#ffffff',
          'success': '#10b981',        // Emerald-500
          'success-content': '#ffffff',
          'warning': '#f59e0b',        // Amber-500
          'warning-content': '#ffffff',
          'error': '#f87171',          // Red-400
          'error-content': '#ffffff',
        },
      },
      'light',
      'dark',
    ],
    darkTheme: 'travel-guardian-dark',
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
}

export default config
