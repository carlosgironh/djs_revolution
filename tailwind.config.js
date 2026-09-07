/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#040407',
          900: '#07070d',
          850: '#0c0c16',
          800: '#121220',
          700: '#1a1a2e',
          600: '#25253e',
        },
        brand: {
          violet: '#8b5cf6',
          cyan: '#0ea5e9',
          gold: '#fbbf24',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 25px rgba(14, 165, 233, 0.35)',
        'glow-gold': '0 0 25px rgba(251, 191, 36, 0.35)',
      }
    },
  },
  plugins: [],
}
