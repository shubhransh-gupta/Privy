import { useMemo, useState } from 'react'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  StatBox,
  CopyButton,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'

const tool = getToolById('unicode-inspector')!

const ASCII_NAMES: Record<number, string> = {
  0: 'NULL', 9: 'TAB', 10: 'LINE FEED', 13: 'CARRIAGE RETURN', 32: 'SPACE',
}

function toHex(n: number, pad = 4): string {
  return 'U+' + n.toString(16).toUpperCase().padStart(pad, '0')
}

function toUtf8Hex(codePoint: number): string {
  const bytes: number[] = []
  if (codePoint <= 0x7f) bytes.push(codePoint)
  else if (codePoint <= 0x7ff) {
    bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f))
  } else if (codePoint <= 0xffff) {
    bytes.push(0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f))
  } else {
    bytes.push(
      0xf0 | (codePoint >> 18),
      0x80 | ((codePoint >> 12) & 0x3f),
      0x80 | ((codePoint >> 6) & 0x3f),
      0x80 | (codePoint & 0x3f)
    )
  }
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

function getCategory(char: string): string {
  if (/^\p{L}/u.test(char)) return 'Letter'
  if (/^\p{N}/u.test(char)) return 'Number'
  if (/^\p{P}/u.test(char)) return 'Punctuation'
  if (/^\p{S}/u.test(char)) return 'Symbol'
  if (/^\p{Z}/u.test(char)) return 'Separator'
  if (/^\p{M}/u.test(char)) return 'Mark'
  if (/^\p{C}/u.test(char)) return 'Control'
  return 'Other'
}

function getCharName(codePoint: number, char: string): string {
  if (ASCII_NAMES[codePoint]) return ASCII_NAMES[codePoint]
  if (codePoint >= 0x41 && codePoint <= 0x5a) return `LATIN CAPITAL LETTER ${char}`
  if (codePoint >= 0x61 && codePoint <= 0x7a) return `LATIN SMALL LETTER ${char}`
  if (codePoint >= 0x30 && codePoint <= 0x39) return `DIGIT ${char}`
  return toHex(codePoint)
}

function segmentGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return [...segmenter.segment(text)].map((s) => s.segment)
  }
  return [...text]
}

interface CharInfo {
  index: number
  char: string
  display: string
  codePoint: number
  name: string
  utf8: string
  category: string
}

export default function UnicodeInspector() {
  const [input, setInput] = useState('Hello 🌍 — DevToolBoxs')

  const chars = useMemo((): CharInfo[] => {
    const graphemes = segmentGraphemes(input)
    return graphemes.map((char, index) => {
      const codePoint = char.codePointAt(0) ?? 0
      const display = char.length === 1 && char.charCodeAt(0) < 32 ? `[${getCharName(codePoint, char)}]` : char
      return {
        index,
        char,
        display,
        codePoint,
        name: getCharName(codePoint, char),
        utf8: toUtf8Hex(codePoint),
        category: getCategory(char),
      }
    })
  }, [input])

  const summary = useMemo(() => {
    const codePoints = chars.map((c) => c.codePoint)
    return {
      graphemes: chars.length,
      codePoints: codePoints.length,
      bytes: chars.reduce((sum, c) => sum + c.utf8.split(' ').length, 0),
    }
  }, [chars])

  const exportText = chars
    .map((c) => `${c.index}\t${c.display}\t${toHex(c.codePoint)}\t${c.name}\t${c.utf8}\t${c.category}`)
    .join('\n')

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <ToolSection title="Text to inspect">
          <ToolTextarea value={input} onChange={setInput} rows={3} placeholder="Enter text..." />
        </ToolSection>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Graphemes" value={summary.graphemes} />
          <StatBox label="Code points" value={summary.codePoints} />
          <StatBox label="UTF-8 bytes" value={summary.bytes} />
        </div>

        <ToolSection title="Character breakdown">
          <div className="rounded-lg border border-zinc-700 overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_6rem_1fr_5rem_5rem] gap-2 px-4 py-2 bg-zinc-800/50 text-xs font-medium text-zinc-500 border-b border-zinc-700">
              <span>#</span>
              <span>Char</span>
              <span>Code</span>
              <span>Name</span>
              <span>UTF-8</span>
              <span>Type</span>
            </div>
            <div className="max-h-96 overflow-auto">
              {chars.length === 0 ? (
                <p className="px-4 py-8 text-center text-zinc-500 text-sm">Enter text above</p>
              ) : (
                chars.map((c) => (
                  <div
                    key={c.index}
                    className="grid grid-cols-[3rem_1fr_6rem_1fr_5rem_5rem] gap-2 px-4 py-2 text-sm border-b border-zinc-800/50 hover:bg-zinc-800/30 font-mono"
                  >
                    <span className="text-zinc-500">{c.index}</span>
                    <span className={cn('text-lg', c.char.charCodeAt(0) < 32 && 'text-zinc-500 text-sm')}>
                      {c.display}
                    </span>
                    <span className="text-indigo-400">{toHex(c.codePoint)}</span>
                    <span className="text-zinc-400 text-xs truncate" title={c.name}>{c.name}</span>
                    <span className="text-zinc-500 text-xs">{c.utf8}</span>
                    <span className="text-zinc-500 text-xs">{c.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          {chars.length > 0 && <CopyButton text={exportText} label="Copy Table" />}
        </ToolSection>
      </div>
    </ToolLayout>
  )
}
