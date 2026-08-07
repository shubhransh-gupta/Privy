/** Vite BASE_URL is `/Privy/` on GitHub Pages, `/` locally. React Router basename must NOT have a trailing slash. */
export function getBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.endsWith('/') ? base.slice(0, -1) : base
}

/** Full base path with trailing slash, e.g. `/Privy/` or `/` */
export function getBaseUrl(): string {
  return import.meta.env.BASE_URL
}

/** Build an absolute in-app href that works on GitHub Pages */
export function appHref(path: string): string {
  const base = getBaseUrl()
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${base}${normalized}`
}
