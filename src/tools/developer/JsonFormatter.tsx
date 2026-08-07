import { useMemo, useState } from 'react'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  ToolInput,
  ToolButton,
  CopyButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'

const tool = getToolById('json-formatter')!

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

function flattenObject(obj: unknown, prefix = '', result: Record<string, unknown> = {}): Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') {
    if (prefix) result[prefix] = obj
    return result
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenObject(item, prefix ? `${prefix}[${i}]` : `[${i}]`, result))
    return result
  }
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (val !== null && typeof val === 'object') flattenObject(val, path, result)
    else result[path] = val
  }
  return result
}

function JsonTreeNode({ name, value, depth, search }: { name?: string; value: unknown; depth: number; search: string }) {
  const [open, setOpen] = useState(depth < 2)
  const isObj = value !== null && typeof value === 'object'
  const isArray = Array.isArray(value)
  const entries = isObj ? (isArray ? (value as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, unknown>)) : []
  const label = name ?? 'root'
  const searchHit = search && JSON.stringify(value).toLowerCase().includes(search.toLowerCase())

  if (!isObj) {
    const display = typeof value === 'string' ? `"${value}"` : String(value)
    return (
      <div className={cn('font-mono text-xs py-0.5', searchHit && 'bg-indigo-500/20 rounded px-1')}>
        {name !== undefined && <span className="text-indigo-400">{label}: </span>}
        <span className={cn(typeof value === 'string' ? 'text-green-400' : 'text-amber-400')}>{display}</span>
      </div>
    )
  }

  return (
    <div className="font-mono text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn('flex items-center gap-1 py-0.5 hover:text-indigo-300', searchHit && 'bg-indigo-500/20 rounded px-1')}
      >
        <span className="text-zinc-500 w-3">{open ? '▼' : '▶'}</span>
        {name !== undefined && <span className="text-indigo-400">{label}: </span>}
        <span className="text-zinc-500">{isArray ? `[${entries.length}]` : `{${entries.length}}`}</span>
      </button>
      {open && (
        <div className="ml-4 border-l border-zinc-800 pl-2">
          {entries.map(([k, v]) => (
            <JsonTreeNode key={k} name={k} value={v} depth={depth + 1} search={search} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function JsonFormatter() {
  const [input, setInput] = useState('{\n  "name": "DevToolBoxs",\n  "version": 1\n}')
  const [indent, setIndent] = useState(2)
  const [treeView, setTreeView] = useState(false)
  const [sortKeysEnabled, setSortKeysEnabled] = useState(false)
  const [flatten, setFlatten] = useState(false)
  const [search, setSearch] = useState('')
  const [minify, setMinify] = useState(false)

  const result = useMemo(() => {
    if (!input.trim()) return { error: null, parsed: null, output: '' }
    try {
      let parsed = JSON.parse(input) as unknown
      if (sortKeysEnabled) parsed = sortKeys(parsed)
      if (flatten) parsed = flattenObject(parsed)
      const output = minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent)
      return { error: null, parsed, output }
    } catch (e) {
      return { error: (e as Error).message, parsed: null, output: '' }
    }
  }, [input, indent, sortKeysEnabled, flatten, minify])

  const stats = useMemo(() => {
    if (!result.parsed) return null
    const str = JSON.stringify(result.parsed)
    return { chars: str.length, keys: typeof result.parsed === 'object' && result.parsed ? Object.keys(result.parsed as object).length : 0 }
  }, [result.parsed])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <ToolSection title="Input JSON">
          <ToolTextarea value={input} onChange={setInput} rows={10} mono placeholder="Paste JSON here..." />
        </ToolSection>

        <div className="flex flex-wrap gap-2 items-center">
          <ToolButton variant={minify ? 'primary' : 'secondary'} onClick={() => setMinify(!minify)}>
            {minify ? 'Minified' : 'Pretty'}
          </ToolButton>
          <ToolButton variant={treeView ? 'primary' : 'secondary'} onClick={() => setTreeView(!treeView)}>
            {treeView ? 'Tree View' : 'Text View'}
          </ToolButton>
          <ToolButton variant={sortKeysEnabled ? 'primary' : 'secondary'} onClick={() => setSortKeysEnabled(!sortKeysEnabled)}>
            Sort Keys
          </ToolButton>
          <ToolButton variant={flatten ? 'primary' : 'secondary'} onClick={() => setFlatten(!flatten)}>
            Flatten
          </ToolButton>
          {!minify && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Indent</label>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-2 py-1.5 text-sm text-zinc-200"
              >
                {[2, 4, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
          <ToolInput value={search} onChange={setSearch} placeholder="Search..." className="max-w-xs ml-auto" />
        </div>

        {result.error ? (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            Invalid JSON: {result.error}
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Status" value="Valid ✓" />
                <StatBox label="Characters" value={stats.chars} />
                <StatBox label="Top-level keys" value={stats.keys} />
              </div>
            )}
            <ToolSection title="Output">
              {treeView && result.parsed !== null ? (
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4 max-h-96 overflow-auto">
                  <JsonTreeNode value={result.parsed} depth={0} search={search} />
                </div>
              ) : (
                <ToolTextarea value={result.output} onChange={() => {}} rows={12} mono className="opacity-90" />
              )}
              {result.output && <CopyButton text={result.output} label="Copy Output" />}
            </ToolSection>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
