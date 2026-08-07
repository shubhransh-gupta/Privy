import { Link, useLocation } from 'react-router-dom'
import { CATEGORY_META, type ToolCategory } from '../lib/toolRegistry'
import { cn } from '../lib/utils'

const CATEGORIES: ToolCategory[] = ['documents', 'images', 'developer', 'india', 'privacy', 'business']

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r border-zinc-800/80 py-6 px-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 px-3 mb-3">All Tools</p>
      <nav className="space-y-0.5">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const active = location.pathname === `/category/${cat}`
          return (
            <Link
              key={cat}
              to={`/category/${cat}`}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              )}
            >
              <span>{meta.icon}</span>
              {meta.label}
            </Link>
          )
        })}
        <div className="my-3 border-t border-zinc-800" />
        <Link
          to="/favorites"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            location.pathname === '/favorites'
              ? 'bg-indigo-500/10 text-indigo-300 font-medium'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          )}
        >
          ⭐ Favorites
        </Link>
        <Link
          to="/security"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
            location.pathname === '/security'
              ? 'bg-indigo-500/10 text-indigo-300 font-medium'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          )}
        >
          🔒 Privacy
        </Link>
      </nav>
    </aside>
  )
}

export function MobileNav() {
  const location = useLocation()

  const items = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/category/documents', label: 'Tools', icon: '🧰' },
    { to: '/favorites', label: 'Favorites', icon: '⭐' },
    { to: '/security', label: 'Privacy', icon: '🔒' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
      <div className="flex justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] transition-colors',
              location.pathname === item.to ? 'text-indigo-400' : 'text-zinc-500'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
