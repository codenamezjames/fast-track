import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Base path - use VITE_BASE_PATH for Docker (default '/'), '/fast-track/' for GitHub Pages
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? '/fast-track/' : '/'),
  server: {
    host: '0.0.0.0',  // Listen on all interfaces for Docker
    port: 5173,
    hmr: {
      clientPort: 5173,  // Match exposed port
    },
    watch: {
      usePolling: true,  // Required for Docker volume file watching
    },
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Fast Track',
        short_name: 'FastTrack',
        description: 'Personal fitness and lifestyle tracking PWA',
        theme_color: '#1976d2',
        background_color: '#171717',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
