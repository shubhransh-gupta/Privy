import { useEffect } from 'react'
import {
  type SEOConfig,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildTitle,
} from '../lib/seo'


function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  document.querySelectorAll('[id^="privy-jsonld"]').forEach((el) => el.remove())
  if (!data) return

  const scripts = Array.isArray(data) ? data : [data]
  scripts.forEach((item, i) => {
    const script = document.createElement('script')
    script.id = i === 0 ? 'privy-jsonld' : `privy-jsonld-${i}`
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(item)
    document.head.appendChild(script)
  })
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const title = buildTitle(config.title)
    const description = config.description
    const url = config.path ? absoluteUrl(config.path) : SITE_URL
    const keywords = config.keywords?.join(', ') ?? ''

    document.title = title
    setMeta('description', description)
    if (keywords) setMeta('keywords', keywords)
    setMeta('robots', config.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:url', url, true)
    setMeta('og:type', config.type ?? 'website', true)
    setMeta('og:site_name', SITE_NAME, true)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setCanonical(url)
    setJsonLd(config.jsonLd)

    return () => {
      document.querySelectorAll('[id^="privy-jsonld"]').forEach((el) => el.remove())
    }
  }, [config])
}

const HOME_SEO = {
  title: 'Free Online Tools — JSON Formatter, PDF, Image & More',
  description:
    'Privy — 36+ free online tools for JSON formatting, PDF merge/compress, image editing, JWT decode, EMI calculator, GST calculator and more. 100% private, runs in your browser. No uploads.',
  path: '/',
  keywords: [
    'online tools free',
    'json formatter online',
    'pdf tools online',
    'image compressor online',
    'privacy tools',
    'browser tools no upload',
    'developer tools online',
    'free online utilities',
  ],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Privy',
      url: SITE_URL,
      description: 'Free privacy-first online tools. JSON formatter, PDF tools, image tools and more.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Privy',
      url: SITE_URL,
      sameAs: ['https://github.com/shubhransh-gupta/Privy'],
    },
  ],
} as const satisfies SEOConfig

export function useHomeSEO() {
  useSEO(HOME_SEO)
}
