import { useMemo, useState, type ReactNode } from 'react'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  ToolInput,
  ToolButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'

const tool = getToolById('regex-tester')!

const PRESETS: { label: string; pattern: string; flags: string }[] = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { label: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+', flags: 'g' },
  { label: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g' },
  { label: 'Date (ISO)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { label: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' },
  { label: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
]

interface MatchResult {
  match: string
  index: number
  groups: (string | undefined)[]
}

function highlightMatches(text: string, matches: MatchResult[]): ReactNode[] {
  if (matches.length === 0) return [text]
  const nodes: ReactNode[] = []
  let lastIndex = 0
  matches.forEach((m, i) => {
    if (m.index > lastIndex) nodes.push(text.slice(lastIndex, m.index))
    nodes.push(
      <mark key={i} className="bg-indigo-500/40 text-indigo-100 rounded px-0.5">
        {m.match}
      </mark>
    )
    lastIndex = m.index + m.match.length
  })
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('[a-z]+')
  const [flags, setFlags] = useState('gi')
  const [testString, setTestString] = useState('Hello World 123 test TEST')

  const result = useMemo(() => {
    if (!pattern) return { error: 'Pattern is empty', matches: [] as MatchResult[], regex: null as RegExp | null }
    try {
      const regex = new RegExp(pattern, flags)
      const matches: MatchResult[] = []
      if (flags.includes('g')) {
        let m: RegExpExecArray | null
        const re = new RegExp(pattern, flags)
        while ((m = re.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
          if (m[0].length === 0) re.lastIndex++
        }
      } else {
        const m = regex.exec(testString)
        if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) })
      }
      return { error: null, matches, regex }
    } catch (e) {
      return { error: (e as Error).message, matches: [] as MatchResult[], regex: null }
    }
  }, [pattern, flags, testString])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <ToolButton
              key={p.label}
              variant="secondary"
              onClick={() => {
                setPattern(p.pattern)
                setFlags(p.flags)
              }}
            >
              {p.label}
            </ToolButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <ToolInput value={pattern} onChange={setPattern} label="Pattern" placeholder="Regular expression..." />
          <ToolInput value={flags} onChange={setFlags} label="Flags" placeholder="gimuy" className="md:w-24" />
        </div>

        <ToolSection title="Test string">
          <ToolTextarea value={testString} onChange={setTestString} rows={4} mono />
        </ToolSection>

        {result.error && (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            Invalid regex: {result.error}
          </div>
        )}

        {!result.error && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Matches" value={result.matches.length} />
              <StatBox label="Test length" value={testString.length} />
              <StatBox label="Flags" value={flags || '(none)'} />
            </div>

            <ToolSection title="Highlighted matches">
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 font-mono text-sm whitespace-pre-wrap break-all min-h-[3rem]">
                {highlightMatches(testString, result.matches)}
              </div>
            </ToolSection>

            {result.matches.length > 0 && (
              <ToolSection title="Match details">
                <div className="space-y-2 max-h-64 overflow-auto">
                  {result.matches.map((m, i) => (
                    <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm">
                      <div className="flex gap-4 font-mono">
                        <span className="text-zinc-500">#{i + 1}</span>
                        <span className="text-indigo-400">index {m.index}</span>
                        <span className="text-green-400">&quot;{m.match}&quot;</span>
                      </div>
                      {m.groups.length > 0 && (
                        <div className="mt-2 ml-6 space-y-1">
                          {m.groups.map((g, gi) => (
                            <div key={gi} className="text-xs text-zinc-400 font-mono">
                              Group {gi + 1}: <span className="text-amber-400">{g ?? '(empty)'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ToolSection>
            )}

            {result.matches.length === 0 && !result.error && (
              <p className={cn('text-sm text-zinc-500')}>No matches found.</p>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
