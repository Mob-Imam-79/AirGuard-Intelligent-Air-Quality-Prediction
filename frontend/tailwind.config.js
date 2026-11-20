/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
          light: '#EFF6FF',
        },
        surface: '#FFFFFF',
        page: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        aqi: {
          good: '#16A34A',
          satisfactory: '#84CC16',
          moderate: '#EAB308',
          poor: '#F97316',
          veryPoor: '#DC2626',
          severe: '#7F1D1D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

