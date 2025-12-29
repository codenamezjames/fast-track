/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        'surface-variant': '#334155',
        primary: {
          DEFAULT: '#1976d2',
          dark: '#1565c0',
          light: '#42a5f5',
        },
        secondary: {
          DEFAULT: '#26a69a',
          dark: '#00897b',
          light: '#4db6ac',
        },
        accent: '#9c27b0',
        meals: '#f97316',
        workouts: '#ef4444',
        activity: '#3b82f6',
        fasting: '#8b5cf6',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
