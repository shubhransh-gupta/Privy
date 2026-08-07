export const SITE_URL = 'https://shubhransh-gupta.github.io/Privy'
export const SITE_NAME = 'Privy'
export const SITE_TAGLINE = 'Your private toolbox for the web'
export const DEFAULT_DESCRIPTION =
  'Free online tools for JSON formatting, PDF editing, image compression, JWT decoding, EMI calculator and more. 100% private — everything runs in your browser. No uploads.'

export interface SEOConfig {
  title: string
  description: string
  path?: string
  keywords?: string[]
  type?: 'website' | 'article' | 'WebApplication'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  noindex?: boolean
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

export function buildTitle(pageTitle: string, includeSite = true): string {
  if (!includeSite) return pageTitle
  return `${pageTitle} | ${SITE_NAME}`
}

export interface ToolSeoContent {
  title: string
  description: string
  keywords: string[]
  h1?: string
  about: string
  extraSections?: { heading: string; body: string }[]
  howItWorks: string[]
  features: string[]
  faqs: { q: string; a: string }[]
  relatedTools?: { name: string; path: string; description: string }[]
  limitations?: string[]
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildWebApplicationJsonLd(opts: {
  name: string
  description: string
  path: string
  category: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: opts.category,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    featureList: 'Runs entirely in browser, No file uploads, No account required, Privacy-first',
  }
}

export function buildFAQJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/favicon.svg'),
    sameAs: ['https://github.com/shubhransh-gupta/Privy'],
  }
}
