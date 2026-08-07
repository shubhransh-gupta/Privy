import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { TOOLS, CATEGORY_META, getPopularTools, type ToolCategory } from '../lib/toolRegistry'
import { getRecentTools, getFavorites } from '../lib/storage'
import { ToolCard } from '../components/ToolCard'
import { getToolById } from '../lib/toolRegistry'

interface HomePageProps {
  onSearchClick: () => void
}

export function HomePage({ onSearchClick }: HomePageProps) {
  const popular = getPopularTools()
  const recentIds = getRecentTools()
  const favoriteIds = getFavorites()
  const recent = recentIds.map(getToolById).filter(Boolean)
  const favorites = favoriteIds.map(getToolById).filter(Boolean)

  const categories: ToolCategory[] = ['documents', 'images', 'developer', 'india', 'privacy', 'business']

  return (
    <div className="gradient-bg min-h-full">
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400 mb-6 privacy-glow">
          🔒 100% LOCAL PROCESSING
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Everything useful.<br />
          <span className="text-zinc-500">Nothing uploaded.</span>
        </h1>

        <p className="text-zinc-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
          A private toolbox for files, data, developers, and everyday calculations — running entirely in your browser.
        </p>

        <button
          onClick={onSearchClick}
          className="inline-flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3.5 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition-all w-full max-w-lg shadow-lg"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search tools...</span>
          <kbd className="text-[10px] border border-zinc-700 rounded px-1.5 py-0.5">⌘K</kbd>
        </button>

        <p className="text-xs text-zinc-600 mt-4">
          Try: "compress PDF" · "decode JWT" · "resize image" · "calculate EMI"
        </p>

        <p className="text-xs text-zinc-500 mt-6 font-medium">
          No signup · No uploads · No tracking
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-24 lg:pb-8">
        {/* Favorites / Recent */}
        {(favorites.length > 0 || recent.length > 0) && (
          <section className="mb-10">
            {favorites.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-zinc-400 mb-3">⭐ My Tools</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {favorites.slice(0, 6).map((tool) => tool && <ToolCard key={tool.id} tool={tool} showCategory={false} />)}
                </div>
              </div>
            )}
            {recent.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-zinc-400 mb-3">Recently Used</h2>
                <div className="flex flex-wrap gap-2">
                  {recent.slice(0, 5).map((tool) => tool && (
                    <Link
                      key={tool.id}
                      to={tool.route}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
                    >
                      {tool.icon} {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Popular */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">Popular Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {popular.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>

        {/* Categories */}
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat]
          const tools = TOOLS.filter((t) => t.category === cat)
          return (
            <section key={cat} className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-400">
                  {meta.icon} {meta.label.toUpperCase()}
                </h2>
                <Link to={`/category/${cat}`} className="text-xs text-indigo-400 hover:text-indigo-300">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
