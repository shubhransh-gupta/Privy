/** Static route list for sitemap generation and SEO prerendering */
export const SITEMAP_ROUTES = [
  '/',
  '/security',
  '/favorites',
  '/category/documents',
  '/category/images',
  '/category/developer',
  '/category/india',
  '/category/privacy',
  '/category/business',
  '/tools/pdf-to-text',
  '/tools/pdf-merge',
  '/tools/pdf-split',
  '/tools/pdf-compress',
  '/tools/image-to-pdf',
  '/tools/image-compressor',
  '/tools/image-resizer',
  '/tools/image-converter',
  '/tools/image-cropper',
  '/tools/image-redactor',
  '/tools/screenshot-cleanup',
  '/tools/json',
  '/tools/jwt-decoder',
  '/tools/base64',
  '/tools/uuid-generator',
  '/tools/unicode-inspector',
  '/tools/regex-tester',
  '/tools/api-generator',
  '/tools/diff',
  '/tools/yaml-json',
  '/tools/gst-calculator',
  '/tools/bill-splitter',
  '/tools/rupee-formatter',
  '/tools/salary-calculator',
  '/tools/emi-calculator',
  '/tools/age-calculator',
  '/tools/date-calculator',
  '/tools/metadata-remover',
  '/tools/exif-viewer',
  '/tools/password-generator',
  '/tools/hash-generator',
  '/tools/file-encryption',
  '/tools/csv-cleaner',
  '/tools/invoice-parser',
  '/tools/table-extractor',
  '/tools/duplicate-detector',
]

export const SITE_URL = 'https://shubhransh-gupta.github.io/Privy'

export function generateSitemap() {
  const urls = SITEMAP_ROUTES.map((route) => {
    const loc = `${SITE_URL}${route === '/' ? '/' : route}`
    const priority = route === '/'
      ? '1.0'
      : route === '/tools/json' || route === '/tools/diff'
        ? '0.95'
        : route.startsWith('/tools/')
          ? '0.9'
          : '0.7'
    const changefreq = route === '/' ? 'weekly' : 'monthly'
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
}
