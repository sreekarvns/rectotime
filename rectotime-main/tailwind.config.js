/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]', '[data-theme="midnight"]'],
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
          midnight: '#4F9EF8',
        },
        background: {
          light: '#FFFFFF',
          dark: '#000000',
          darkSecondary: '#1C1C1E',
          midnight: '#0A0F1E',
          midnightSecondary: '#111827',
        },
        // Clock Theme Colors
        clock: {
          face: {
            light: '#FAFAFA',
            dark: '#1C1C1E',
          },
          hand: {
            light: '#1C1C1E',
            dark: '#FFFFFF',
          },
          marker: {
            hour: '#D1D1D6',
            minute: '#E8E8ED',
          },
        },
        time: {
          morning: '#FFB84D',    // 6AM - Golden hour
          noon: '#FF6B35',       // 12PM - Peak sun
          evening: '#6B5CE8',    // 6PM - Dusk
          night: '#2D3561',      // 12AM - Midnight
        },
      },
      fontFamily: {
        sans: ['Inter', 'San Francisco Pro', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '12px',
        'input': '8px',
        'clock': '50%',
      },
      boxShadow: {
        'soft': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'medium': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'large': '0 12px 24px rgba(0, 0, 0, 0.15)',
        'clock': 'inset 0 0 30px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.08)',
        'clock-glow': '0 0 30px rgba(0, 122, 255, 0.2)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'rotate-clock': 'rotate-clock 60s linear infinite',
        'rotate-minute': 'rotate-clock 3600s linear infinite',
        'rotate-hour': 'rotate-clock 43200s linear infinite',
        'pulse-clock': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'rotate-clock': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 122, 255, 0.15)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(0, 122, 255, 0.15)',
            transform: 'scale(1.02)',
          },
        },
      },
    },
  },
  plugins: [],
}
