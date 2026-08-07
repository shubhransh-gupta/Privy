import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { ToolDefinition } from '../lib/toolRegistry'
import { CATEGORY_META } from '../lib/toolRegistry'
import { PrivacyBadge } from './PrivacyBadge'
import { cn } from '../lib/utils'
import { isFavorite, toggleFavorite } from '../lib/storage'
import { useState } from 'react'

interface ToolCardProps {
  tool: ToolDefinition
  className?: string
  showCategory?: boolean
}

export function ToolCard({ tool, className, showCategory = true }: ToolCardProps) {
  const [fav, setFav] = useState(() => isFavorite(tool.id))
  const cat = CATEGORY_META[tool.category]

  return (
    <Link
      to={tool.route}
      className={cn(
        'group relative flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-indigo-500/5',
        className
      )}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setFav(toggleFavorite(tool.id))
        }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Star className={cn('h-4 w-4', fav ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600')} />
      </button>

      <div className="flex items-start gap-3">
        <span className="text-2xl">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{tool.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{tool.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2">
        {showCategory && (
          <span className="text-[10px] text-zinc-600">{cat.icon} {cat.label}</span>
        )}
        <PrivacyBadge compact />
      </div>
    </Link>
  )
}
