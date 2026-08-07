import { useMemo, useState } from 'react'
import * as Diff from 'diff'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  ToolButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'

const tool = getToolById('diff-tool')!

type DiffMode = 'text' | 'json'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  leftNum?: number
  rightNum?: number
}

interface DiffResult {
  leftLines: DiffLine[]
  rightLines: DiffLine[]
  stats: { added: number; removed: number; changed: number }
  error?: string
}

function computeTextDiff(left: string, right: string): DiffResult {
  const changes = Diff.diffLines(left, right)
  const leftLines: DiffLine[] = []
  const rightLines: DiffLine[] = []
  let leftNum = 1
  let rightNum = 1
  let added = 0
  let removed = 0

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, '').split('\n')
    if (change.added) {
      for (const line of lines) {
        if (line === '' && change.value.endsWith('\n')) continue
        rightLines.push({ type: 'added', content: line, rightNum: rightNum++ })
        leftLines.push({ type: 'unchanged', content: '', leftNum: undefined })
        added++
      }
    } else if (change.removed) {
      for (const line of lines) {
        if (line === '' && change.value.endsWith('\n')) continue
        leftLines.push({ type: 'removed', content: line, leftNum: leftNum++ })
        rightLines.push({ type: 'unchanged', content: '', rightNum: undefined })
        removed++
      }
    } else {
      for (const line of lines) {
        if (line === '' && change.value.endsWith('\n') && lines.length > 1) continue
        leftLines.push({ type: 'unchanged', content: line, leftNum: leftNum++ })
        rightLines.push({ type: 'unchanged', content: line, rightNum: rightNum++ })
      }
    }
  }

  return { leftLines, rightLines, stats: { added, removed, changed: Math.min(added, removed) } }
}

function computeJsonDiff(left: string, right: string): DiffResult {
  try {
    const leftObj = JSON.parse(left)
    const rightObj = JSON.parse(right)
    const leftFormatted = JSON.stringify(leftObj, null, 2)
    const rightFormatted = JSON.stringify(rightObj, null, 2)
    const result = computeTextDiff(leftFormatted, rightFormatted)
    return result
  } catch (e) {
    return { leftLines: [], rightLines: [], stats: { added: 0, removed: 0, changed: 0 }, error: (e as Error).message }
  }
}

function DiffPanel({ lines, side }: { lines: DiffLine[]; side: 'left' | 'right' }) {
  return (
    <div className="font-mono text-xs overflow-auto max-h-[28rem]">
      {lines.map((line, i) => (
        <div
          key={i}
          className={cn(
            'flex min-h-[1.25rem]',
            line.type === 'added' && side === 'right' && 'bg-green-500/15',
            line.type === 'removed' && side === 'left' && 'bg-red-500/15',
            line.type === 'unchanged' && 'bg-transparent'
          )}
        >
          <span className="w-10 shrink-0 text-right pr-2 text-zinc-600 select-none border-r border-zinc-800">
            {side === 'left' ? line.leftNum ?? '' : line.rightNum ?? ''}
          </span>
          <span
            className={cn(
              'pl-2 whitespace-pre flex-1',
              line.type === 'added' && 'text-green-400',
              line.type === 'removed' && 'text-red-400',
              line.type === 'unchanged' && 'text-zinc-300'
            )}
          >
            {line.content || '\u00A0'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DiffTool() {
  const [left, setLeft] = useState('Hello World\nLine 2\nLine 3')
  const [right, setRight] = useState('Hello DevToolBoxs\nLine 2\nLine 4')
  const [mode, setMode] = useState<DiffMode>('text')

  const diff = useMemo(() => {
    if (mode === 'json') return computeJsonDiff(left, right)
    return computeTextDiff(left, right)
  }, [left, right, mode])

  const swap = () => {
    setLeft(right)
    setRight(left)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <ToolButton variant={mode === 'text' ? 'primary' : 'secondary'} onClick={() => setMode('text')}>
            Text Diff
          </ToolButton>
          <ToolButton variant={mode === 'json' ? 'primary' : 'secondary'} onClick={() => setMode('json')}>
            JSON Diff
          </ToolButton>
          <ToolButton variant="secondary" onClick={swap}>
            ⇄ Swap
          </ToolButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToolSection title="Original (Left)">
            <ToolTextarea value={left} onChange={setLeft} rows={8} mono />
          </ToolSection>
          <ToolSection title="Modified (Right)">
            <ToolTextarea value={right} onChange={setRight} rows={8} mono />
          </ToolSection>
        </div>

        {diff.error ? (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            JSON parse error: {diff.error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Added lines" value={diff.stats.added} />
              <StatBox label="Removed lines" value={diff.stats.removed} />
              <StatBox label="Mode" value={mode.toUpperCase()} />
            </div>

            <div className="flex gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30" /> Removed</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30" /> Added</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-lg border border-zinc-700 overflow-hidden">
              <div className="border-b md:border-b-0 md:border-r border-zinc-700">
                <div className="px-4 py-2 bg-zinc-800/50 text-xs font-medium text-zinc-400 border-b border-zinc-700">
                  Original
                </div>
                <DiffPanel lines={diff.leftLines} side="left" />
              </div>
              <div>
                <div className="px-4 py-2 bg-zinc-800/50 text-xs font-medium text-zinc-400 border-b border-zinc-700">
                  Modified
                </div>
                <DiffPanel lines={diff.rightLines} side="right" />
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
