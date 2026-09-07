import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'logo_emblem.png', 'logo_full.png', 'logo_horizontal.png'],
      manifest: {
        name: "DJ's Revolution 🕊️",
        short_name: "DJs Revolution",
        description: "Comunidad global de DJs y VJs Cristianos • Música de Adoración en Alta Definición",
        theme_color: "#0a0a10",
        background_color: "#0a0a10",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/logo_emblem.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
