import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import type { ToolDefinition } from '../lib/toolRegistry'
import { CATEGORY_META } from '../lib/toolRegistry'
import { PrivacyBadge, PrivacyModal } from './PrivacyBadge'
import { isFavorite, toggleFavorite, addRecentTool } from '../lib/storage'
import { ToolSeoSection, useToolSEO } from './ToolSeoSection'
import { getToolSeoContent } from '../lib/seoContent'
import { useEffect } from 'react'
import { cn } from '../lib/utils'

interface ToolLayoutProps {
  tool: ToolDefinition
  children: ReactNode
  actions?: ReactNode
}

export function ToolLayout({ tool, children, actions }: ToolLayoutProps) {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [fav, setFav] = useState(() => isFavorite(tool.id))
  const cat = CATEGORY_META[tool.category]

  useToolSEO(tool)
  const seo = getToolSeoContent(tool)

  useEffect(() => {
    addRecentTool(tool.id)
  }, [tool.id])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <Link
          to={`/category/${tool.category}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {cat.icon} {cat.label}
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{tool.icon}</span>
              <h1 className="text-2xl font-semibold">{seo.h1 ?? tool.name}</h1>
            </div>
            <p className="text-zinc-400 text-sm">{tool.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFav(toggleFavorite(tool.id))}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors"
              title={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('h-4 w-4', fav ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-500')} />
            </button>
            {actions}
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mb-4">{children}</div>

      <div className="flex justify-center">
        <PrivacyBadge onClick={() => setPrivacyOpen(true)} />
      </div>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />

      <ToolSeoSection tool={tool} />
    </div>
  )
}

export function ToolSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-medium text-zinc-300">{title}</h3>}
      {children}
    </div>
  )
}

export function ToolButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-indigo-600 hover:bg-indigo-500 text-white',
        variant === 'secondary' && 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
        variant === 'danger' && 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30',
        className
      )}
    >
      {children}
    </button>
  )
}

export function ToolTextarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  mono,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  mono?: boolean
  className?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-y',
        mono && 'font-mono',
        className
      )}
    />
  )
}

export function ToolInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  label,
  className,
}: {
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  label?: string
  className?: string
}) {
  return (
    <div className={className}>
      {label && <label className="block text-xs text-zinc-500 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
      />
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <ToolButton
      variant="secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? '✓ Copied' : label}
    </ToolButton>
  )
}

export function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  )
}
