/**
 * Post-build static SEO prerendering.
 * Generates per-route index.html files with full meta tags + JSON-LD baked into HTML
 * so Google/Bing/Brave crawlers see SEO content without executing JavaScript.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITEMAP_ROUTES, SITE_URL, generateSitemap, generateRobotsTxt } from './sitemap.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '../dist')

/** Route → SEO data (priority pages get rich content) */
const PAGES = {
  '/': {
    title: 'Privy — Free Online Tools | JSON Formatter, PDF, Image & More',
    description:
      'Privy — 36+ free online tools. JSON formatter, JSON diff, PDF merge, image compress, JWT decoder, EMI calculator. 100% private, runs in your browser. No uploads ever.',
    keywords: 'online tools free, json formatter online, json diff online, pdf tools, privacy tools, browser tools',
    h1: 'Privy — Free Online Tools',
    body: `<p>Privy offers 36+ free online tools including <strong>JSON Formatter</strong>, <strong>JSON Diff</strong>, PDF Merge, Image Compressor, JWT Decoder, EMI Calculator, and more. Everything runs locally in your browser — no uploads, no accounts.</p>`,
  },
  '/tools/json': {
    title: 'JSON Formatter Online Free — Beautify, Validate & Minify JSON | Privy',
    description:
      'Free JSON formatter online — beautify, validate, minify & pretty print JSON instantly. No upload, no signup. Best private JSON formatter. Format JSON online free.',
    keywords:
      'json formatter, json formatter online, json formatter online free, format json, json beautifier, json validator, pretty print json, free json formatter, best json formatter',
    h1: 'JSON Formatter Online — Free, Fast & 100% Private',
    body: `<p>Free online <strong>JSON formatter</strong> to beautify, validate, minify and pretty print JSON. No upload required — runs 100% in your browser.</p>
<h2>Format JSON Online Free</h2>
<p>Paste JSON and instantly format it with proper indentation. Validate syntax, sort keys, explore with tree view, and minify for production. Your data never leaves your device.</p>
<h2>Why Privy JSON Formatter?</h2>
<ul><li>100% free, no account</li><li>No file uploads — privacy first</li><li>Pretty print, minify, validate, tree view</li><li>Works offline as PWA</li><li>Faster than server-based formatters</li></ul>
<h2>Related Tools</h2>
<p><a href="/Privy/tools/diff">JSON Diff Tool</a> · <a href="/Privy/tools/jwt-decoder">JWT Decoder</a> · <a href="/Privy/tools/yaml-json">YAML to JSON</a></p>`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Formatter',
        url: `${SITE_URL}/tools/json`,
        description: 'Free online JSON formatter — beautify, validate, minify JSON locally in your browser.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'What is the best free JSON formatter online?', acceptedAnswer: { '@type': 'Answer', text: 'Privy JSON Formatter is a top-rated free JSON formatter that runs entirely in your browser with no uploads.' }},
          { '@type': 'Question', name: 'Is my JSON uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens locally in your browser.' }},
        ],
      },
    ],
  },
  '/tools/diff': {
    title: 'JSON Diff Online Free — JSON Differ & Compare Tool | Privy',
    description:
      'Free JSON diff tool online — compare two JSON files side by side. JSON differ with added, removed & changed highlighting. No upload. Best JSON comparison tool.',
    keywords:
      'json diff, json differ, json diff online, compare json, json comparison, json difference, json diff tool, diff json online, json diff free',
    h1: 'JSON Diff Tool — Compare & Find Differences in JSON',
    body: `<p>Free online <strong>JSON diff</strong> and <strong>JSON differ</strong> tool. Compare two JSON files side by side with color-coded highlights for additions, removals, and changes.</p>
<h2>JSON Differ — Compare JSON Files</h2>
<p>Paste two JSON documents and instantly see differences. Supports JSON-aware diff and plain text diff. 100% browser-local — your data is never uploaded.</p>
<h2>Features</h2>
<ul><li>Side-by-side JSON comparison</li><li>Green/red/yellow diff highlighting</li><li>JSON and text diff modes</li><li>Free, no account required</li><li>Works offline</li></ul>
<h2>Related Tools</h2>
<p><a href="/Privy/tools/json">JSON Formatter</a> · <a href="/Privy/tools/yaml-json">YAML to JSON</a> · <a href="/Privy/tools/jwt-decoder">JWT Decoder</a></p>`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Diff Tool',
        url: `${SITE_URL}/tools/diff`,
        description: 'Free online JSON diff and JSON differ tool. Compare JSON files locally in your browser.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  },
}

function defaultPage(route) {
  const slug = route.split('/').pop()?.replace(/-/g, ' ') ?? 'tool'
  const name = slug.charAt(0).toUpperCase() + slug.slice(1)
  return {
    title: `${name} Online Free — Private Browser Tool | Privy`,
    description: `Free online ${slug} tool. Runs 100% in your browser on Privy. No uploads, no account, no tracking.`,
    keywords: `${slug}, ${slug} online, free ${slug}, ${slug} no upload`,
    h1: name,
    body: `<p>Free online <strong>${slug}</strong> tool on Privy. Runs locally in your browser — no uploads required.</p>`,
  }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function injectSeo(baseHtml, route, seo) {
  const url = route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}`
  const title = escapeHtml(seo.title)
  const desc = escapeHtml(seo.description)
  const keywords = escapeHtml(seo.keywords)

  let html = baseHtml

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${desc}"`)
  html = html.replace(/<meta name="keywords" content="[^"]*"/, `<meta name="keywords" content="${keywords}"`)
  html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
  html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${desc}"`)
  html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`)
  html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
  html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${desc}"`)
  html = html.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)

  const jsonLdScripts = (seo.jsonLd ?? [{
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: seo.title,
    description: seo.description,
    url,
  }]).map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join('\n    ')

  html = html.replace('</head>', `    ${jsonLdScripts}\n  </head>`)

  const seoArticle = `
    <article id="seo-static" style="max-width:720px;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;color:#a1a1aa;font-size:14px;line-height:1.7">
      <h1 style="color:#fafafa;font-size:1.5rem;margin-bottom:1rem">${escapeHtml(seo.h1)}</h1>
      ${seo.body}
      <p style="margin-top:1.5rem"><a href="/Privy/" style="color:#818cf8">← All Privy Tools</a></p>
    </article>`

  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n${seoArticle}`)

  return html
}

function main() {
  const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf-8')

  for (const route of SITEMAP_ROUTES) {
    const seo = PAGES[route] ?? defaultPage(route)
    const html = injectSeo(baseHtml, route, seo)

    if (route === '/') {
      writeFileSync(join(DIST, 'index.html'), html)
    } else {
      const dir = join(DIST, route)
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, 'index.html'), html)
    }
  }

  console.log(`✓ Prerendered SEO for ${SITEMAP_ROUTES.length} routes`)

  writeFileSync(join(DIST, 'sitemap.xml'), generateSitemap())
  writeFileSync(join(DIST, 'robots.txt'), generateRobotsTxt())
  console.log('✓ Generated sitemap.xml and robots.txt')
}

main()
