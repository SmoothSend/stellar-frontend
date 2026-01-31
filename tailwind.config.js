/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0C15',
        foreground: '#E2E8F0',
        card: '#13141F',
        'card-foreground': '#E2E8F0',
        popover: '#13141F',
        'popover-foreground': '#E2E8F0',
        primary: {
          DEFAULT: '#7595FF',
          foreground: '#0B0C15',
        },
        secondary: {
          DEFAULT: '#1E2030',
          foreground: '#E2E8F0',
        },
        muted: {
          DEFAULT: '#1E2030',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#2D3142',
          foreground: '#E2E8F0',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#F8FAFC',
        },
        border: '#2D3142',
        input: '#1E2030',
        ring: '#7595FF',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
}
