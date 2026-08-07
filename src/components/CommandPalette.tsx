import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Lock, Moon, Sun } from 'lucide-react'
import { searchTools } from '../lib/search'
import { TOOLS, CATEGORY_META, type ToolCategory } from '../lib/toolRegistry'
import { cn } from '../lib/utils'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()

  const results = query.trim() ? searchTools(query, 12) : TOOLS.slice(0, 12)

  const commands = [
    { label: 'Open Documents tools', action: () => navigate('/category/documents') },
    { label: 'Open Image tools', action: () => navigate('/category/images') },
    { label: 'Open Developer tools', action: () => navigate('/category/developer') },
    { label: 'Open India tools', action: () => navigate('/category/india') },
    { label: 'Open Privacy tools', action: () => navigate('/category/privacy') },
    { label: 'Open Business tools', action: () => navigate('/category/business') },
    { label: 'View Privacy & Security', action: () => navigate('/security') },
    { label: 'Open GitHub', action: () => window.open('https://github.com/shubhransh-gupta/Privy', '_blank') },
  ]

  const items = query.trim()
    ? results
    : [...results.slice(0, 6), ...commands.map((c, i) => ({ id: `cmd-${i}`, name: c.label, icon: '⚡', category: 'developer' as ToolCategory, description: '', route: '', local: true, keywords: [], action: c.action }))]

  const execute = useCallback(
    (index: number) => {
      const item = items[index]
      if (!item) return
      if ('action' in item && typeof item.action === 'function') {
        item.action()
      } else if ('route' in item && item.route) {
        navigate(item.route)
      }
      onClose()
      setQuery('')
    },
    [items, navigate, onClose]
  )

  useEffect(() => {
    if (!open) { setQuery(''); setSelected(0) }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, items.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); execute(selected) }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, selected, items.length, execute, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl glass-card overflow-hidden animate-fade-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <Search className="h-4 w-4 text-zinc-500 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Privy..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
          />
          <kbd className="text-[10px] text-zinc-600 border border-zinc-700 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-2">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">No tools found</p>
          ) : (
            items.map((item, i) => (
              <button
                key={'id' in item ? item.id : i}
                onClick={() => execute(i)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                  i === selected ? 'bg-indigo-500/10 text-indigo-300' : 'hover:bg-zinc-800/50'
                )}
              >
                <span>{'icon' in item ? item.icon : '⚡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{'name' in item ? item.name : ''}</p>
                  {'description' in item && item.description && (
                    <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                  )}
                </div>
                {'category' in item && item.category && (
                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {CATEGORY_META[item.category]?.icon}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  useKeyboardShortcut('k', () => setOpen((o) => !o))
  return { open, setOpen, CommandPalette: () => <CommandPalette open={open} onClose={() => setOpen(false)} /> }
}

export function Header({ onSearchClick }: { onSearchClick: () => void }) {
  const [dark, setDark] = useState(true)

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        <a href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-indigo-400">◆</span>
          Privy
        </a>

        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-colors min-w-[200px]"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search tools...</span>
          <kbd className="ml-auto text-[10px] border border-zinc-700 rounded px-1">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2">
          <a
            href="/security"
            className="hidden md:flex items-center gap-1 text-xs text-emerald-400/80 hover:text-emerald-400 transition-colors"
          >
            <Lock className="h-3 w-3" />
            Private
          </a>
          <a
            href="https://github.com/shubhransh-gupta/Privy"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
