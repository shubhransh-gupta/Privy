import { CATEGORY_META, getToolsByCategory, type ToolCategory } from '../lib/toolRegistry'
import { ToolCard } from '../components/ToolCard'
import { getCategorySeo } from '../lib/seoContent'
import { useSEO } from '../hooks/useSEO'
import { useMemo } from 'react'

export function CategoryPage({ category }: { category: ToolCategory }) {
  const meta = CATEGORY_META[category]
  const tools = getToolsByCategory(category)

  const seoConfig = useMemo(() => getCategorySeo(category, meta.label, meta.description), [category, meta])
  useSEO(seoConfig)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <header className="mb-8">
        <span className="text-4xl" role="img" aria-label={meta.label}>{meta.icon}</span>
        <h1 className="text-2xl font-semibold mt-2">{meta.label} Tools — Free Online</h1>
        <p className="text-zinc-400 text-sm mt-1 max-w-2xl">{meta.description}. All tools run locally in your browser with no uploads.</p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      </div>
    </div>
  )
}
