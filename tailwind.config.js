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
          950: '#0b1120', // Studio Midnight Navy (suave a la vista, adiós al negro plano)
          900: '#0f172a', // Deep Slate Navy (superficie de página y paneles)
          850: '#14203a', // Elevated Surface Navy (tarjetas elevadas y modales)
          800: '#1b2a4d', // Card & Input Navy
          700: '#233560', // Borde interactivo y hover
          600: '#2f4577', // Controles secundarios
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
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 186, 253, 0.35)',
        'glow-blue': '0 0 25px rgba(0, 100, 193, 0.40)',
        'glow-gold': '0 0 25px rgba(245, 158, 11, 0.35)',
        'glow-violet': '0 0 25px rgba(0, 186, 253, 0.35)', // Fallback alias
      }
    },
  },
  plugins: [],
}
