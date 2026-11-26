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
          950: '#070b16', // Deep Cosmic Studio Canvas
          900: '#0d1222', // Elevated Dark Surface
          850: '#12182d', // Panel Slate
          800: '#171f38', // Interactive Card Surface
          750: '#1e2744', // Hover Card Surface
          700: '#273356', // Border & Divider
          600: '#36456e', // Secondary controls
        },
        brand: {
          violet: '#8b5cf6',      // Acento principal Violeta Estudio
          violetLight: '#c4b5fd', // Brillo lila suave
          cyan: '#22d3ee',        // Acento secundario Cian
          cyanLight: '#67e8f9',   // Cian suave
          blue: '#3b82f6',        // Azul eléctrico
          blueHover: '#2563eb',   // Azul hover
          navy: '#0b1024',        // Fondo marino profundo
          gold: '#fbbf24',        // Dorado oficial de "DJ's"
          goldLight: '#fde68a',   // Destello dorado
          emerald: '#34d399',     // Live & GMT-5
          rose: '#fb7185',        // VJ Video & Corazón
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      },
      boxShadow: {
        'glow-violet': '0 8px 28px rgba(139, 92, 246, 0.42)',
        'glow-cyan': '0 8px 24px rgba(34, 211, 238, 0.30)',
        'glow-blue': '0 8px 24px rgba(59, 130, 246, 0.35)',
        'glow-gold': '0 8px 24px rgba(251, 191, 36, 0.32)',
        'card-hover': '0 22px 44px -16px rgba(0, 0, 0, 0.72)',
      }
    },
  },
  plugins: [],
}
