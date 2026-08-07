import { getFavorites } from '../lib/storage'
import { getToolById } from '../lib/toolRegistry'
import { ToolCard } from '../components/ToolCard'
import { useSEO } from '../hooks/useSEO'

export function FavoritesPage() {
  useSEO({
    title: 'My Favorite Tools',
    description: 'Your starred Privy tools, saved locally in this browser.',
    path: '/favorites',
    noindex: true,
  })
  const favorites = getFavorites().map(getToolById).filter(Boolean)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-semibold mb-2">⭐ My Tools</h1>
      <p className="text-zinc-400 text-sm mb-8">Your starred tools, saved locally in this browser.</p>
      {favorites.length === 0 ? (
        <p className="text-zinc-500 text-sm">No favorites yet. Star tools to add them here.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {favorites.map((tool) => tool && <ToolCard key={tool.id} tool={tool} />)}
        </div>
      )}
    </div>
  )
}
