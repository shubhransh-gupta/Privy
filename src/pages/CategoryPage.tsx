import { CATEGORY_META, getToolsByCategory, type ToolCategory } from '../lib/toolRegistry'
import { ToolCard } from '../components/ToolCard'
import { useDocumentTitle } from '../hooks/useKeyboardShortcut'

export function CategoryPage({ category }: { category: ToolCategory }) {
  const meta = CATEGORY_META[category]
  const tools = getToolsByCategory(category)

  useDocumentTitle(meta.label)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <span className="text-4xl">{meta.icon}</span>
        <h1 className="text-2xl font-semibold mt-2">{meta.label}</h1>
        <p className="text-zinc-400 text-sm mt-1">{meta.description}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      </div>
    </div>
  )
}
