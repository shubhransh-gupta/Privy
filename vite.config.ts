import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { generateRobotsTxt, generateSitemap } from './scripts/sitemap.js'

const base = process.env.GITHUB_PAGES === 'true' ? '/Privy/' : '/'
const isGhPages = process.env.GITHUB_PAGES === 'true'

const GH_PAGES_404 = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Privy</title>
    <script type="text/javascript">
      var segmentCount = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + segmentCount).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(segmentCount).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>`

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
        const dist = resolve(__dirname, 'dist')
        writeFileSync(resolve(dist, 'sitemap.xml'), generateSitemap())
        writeFileSync(resolve(dist, 'robots.txt'), generateRobotsTxt())
        if (!isGhPages) return
        writeFileSync(resolve(dist, '404.html'), GH_PAGES_404)
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
