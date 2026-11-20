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
          950: '#070b14', // Ultra Deep Midnight Studio
          900: '#0b1120', // Studio Midnight Navy
          850: '#0f172a', // Deep Slate Surface
          800: '#14203a', // Elevated Card & Modal Navy
          750: '#1b2a4d', // Interactive Card Navy
          700: '#233560', // Border & Hover Navy
          600: '#2f4577', // Secondary controls
        },
        brand: {
          cyan: '#00bafd',      // Ondas de audio y resplandor cian del logo
          cyanLight: '#38bdf8', // Brillo cian suave
          blue: '#0064c1',      // Azul eléctrico del contorno de REVOLUTION
          blueHover: '#1d4ed8', // Azul profundo hover
          navy: '#002751',      // Fondo interior del logo
          gold: '#f59e0b',      // Dorado oficial de "DJ's"
          goldLight: '#fbbf24', // Destello dorado
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 186, 253, 0.35)',
        'glow-blue': '0 0 25px rgba(0, 100, 193, 0.40)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-violet': '0 0 25px rgba(0, 186, 253, 0.35)', // Fallback alias
        'card-hover': '0 16px 36px -8px rgba(0, 100, 193, 0.25)',
      }
    },
  },
  plugins: [],
}
