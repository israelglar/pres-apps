import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Expose to network (0.0.0.0)
    port: 5173
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tanstackRouter(),
VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pre.svg', 'pre.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Prés-adolescentes - Registo de Presenças',
        short_name: 'Prés App',
        description: 'Aplicação para registo de presenças dos pré-adolescentes',
        theme_color: '#0891b2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        lang: 'pt',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-auth',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ],
})
