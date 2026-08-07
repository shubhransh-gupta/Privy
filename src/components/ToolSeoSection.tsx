import { useMemo } from 'react'
import type { ToolDefinition } from '../lib/toolRegistry'
import { CATEGORY_META } from '../lib/toolRegistry'
import { getToolSeoContent } from '../lib/seoContent'
import {
  buildBreadcrumbJsonLd,
  buildFAQJsonLd,
  buildWebApplicationJsonLd,
} from '../lib/seo'
import { useSEO } from '../hooks/useSEO'

interface ToolSeoSectionProps {
  tool: ToolDefinition
}

export function ToolSeoSection({ tool }: ToolSeoSectionProps) {
  const seo = getToolSeoContent(tool)
  const cat = CATEGORY_META[tool.category]

  return (
    <section className="mt-8 space-y-6 text-sm" aria-label="About this tool">
      <div className="glass-card p-6 space-y-3">
        <h2 className="text-base font-semibold text-zinc-200">About {tool.name}</h2>
        <p className="text-zinc-400 leading-relaxed">{seo.about}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-6 space-y-3">
          <h2 className="text-base font-semibold text-zinc-200">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-zinc-400">
            {seo.howItWorks.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="glass-card p-6 space-y-3">
          <h2 className="text-base font-semibold text-zinc-200">Features</h2>
          <ul className="space-y-2 text-zinc-400">
            {seo.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-emerald-400 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-zinc-200">Frequently asked questions</h2>
        <dl className="space-y-4">
          {seo.faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="font-medium text-zinc-300">{faq.q}</dt>
              <dd className="text-zinc-400 mt-1 leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>

      {seo.limitations && seo.limitations.length > 0 && (
        <div className="glass-card p-6 space-y-2 border-amber-500/20">
          <h2 className="text-base font-semibold text-amber-400">Limitations</h2>
          <ul className="space-y-1 text-zinc-400">
            {seo.limitations.map((l) => (
              <li key={l}>• {l}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-zinc-600 text-center">
        Category: {cat.label} · 🔒 Runs entirely in your browser · Free & open source
      </p>
    </section>
  )
}

export function useToolSEO(tool: ToolDefinition) {
  const seo = useMemo(() => getToolSeoContent(tool), [tool])
  const cat = CATEGORY_META[tool.category]

  const config = useMemo(
    () => ({
      title: seo.title,
      description: seo.description,
      path: tool.route,
      keywords: seo.keywords,
      type: 'WebApplication' as const,
      jsonLd: [
        buildWebApplicationJsonLd({
          name: tool.name,
          description: seo.description,
          path: tool.route,
          category: cat.label,
        }),
        buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: cat.label, path: `/category/${tool.category}` },
          { name: tool.name, path: tool.route },
        ]),
        buildFAQJsonLd(seo.faqs),
      ],
    }),
    [tool, seo, cat.label]
  )

  useSEO(config)
}
