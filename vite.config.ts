import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const base = process.env.GITHUB_PAGES === 'true' ? '/Privy/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Privy',
        short_name: 'Privy',
        description: 'Your private toolbox for the web. Runs entirely in your browser.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: base,
        icons: [
          { src: `${base}favicon.svg`, sizes: '192x192', type: 'image/svg+xml' },
          { src: `${base}favicon.svg`, sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
    {
      name: 'gh-pages-spa-fallback',
      closeBundle() {
        const index = resolve(__dirname, 'dist/index.html')
        const notFound = resolve(__dirname, 'dist/404.html')
        if (existsSync(index)) {
          copyFileSync(index, notFound)
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdf-lib') || id.includes('pdfjs-dist')) return 'pdf'
          if (id.includes('js-yaml')) return 'yaml'
        },
      },
    },
  },
})
