import { cn, formatBytes } from '../lib/utils'

interface ProgressBarProps {
  progress: number
  label?: string
  processed?: number
  total?: number
  className?: string
}

export function ProgressBar({ progress, label, processed, total, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between text-sm text-zinc-400">
          <span>{label}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {processed !== undefined && total !== undefined && (
        <p className="text-xs text-zinc-500">
          {formatBytes(processed)} / {formatBytes(total)}
        </p>
      )}
    </div>
  )
}
