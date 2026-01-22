/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          dark: '#1C1C1E',
        },
        secondary: {
          light: '#F5F5F7',
          DEFAULT: '#E8E8ED',
        },
        accent: {
          blue: '#007AFF',
          purple: '#5E5CE6',
        },
        background: {
          light: '#FFFFFF',
          dark: '#000000',
          darkSecondary: '#1C1C1E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'San Francisco Pro', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '12px',
        'input': '8px',
      },
      boxShadow: {
        'soft': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'medium': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'large': '0 12px 24px rgba(0, 0, 0, 0.15)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
