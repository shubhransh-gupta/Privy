import { cn } from '../lib/utils'

interface PrivacyBadgeProps {
  className?: string
  onClick?: () => void
  compact?: boolean
}

export function PrivacyBadge({ className, onClick, compact }: PrivacyBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/15',
        compact && 'px-2 py-0.5 text-[10px]',
        className
      )}
    >
      <span>🔒</span>
      {compact ? 'Local' : 'Runs entirely in your browser'}
    </button>
  )
}

export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative max-w-md glass-card p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3">🔒 Your data stays on this device</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Files are processed locally using browser APIs</li>
          <li>• No upload endpoint is required for core tools</li>
          <li>• Data is never stored on remote servers</li>
          <li>• Favorites and history stay in your browser only</li>
          <li>• Web Crypto API is used for encryption</li>
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-zinc-800 py-2 text-sm hover:bg-zinc-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
