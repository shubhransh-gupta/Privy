import { useCallback, useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolTextarea, ToolButton, CopyButton } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { downloadBlob, cn } from '../../lib/utils'

const tool = getToolById('table-extractor')!

type OutputFormat = 'csv' | 'json' | 'markdown'

function parseHtmlTable(html: string): string[][] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const tables = doc.querySelectorAll('table')
  if (tables.length === 0) return []

  const table = tables[0]
  const rows: string[][] = []
  table.querySelectorAll('tr').forEach((tr) => {
    const cells: string[] = []
    tr.querySelectorAll('th, td').forEach((cell) => {
      cells.push(cell.textContent?.trim() ?? '')
    })
    if (cells.length) rows.push(cells)
  })
  return rows
}

function parseMarkdownTable(text: string): string[][] {
  const lines = text.split('\n').filter((l) => l.trim().startsWith('|'))
  if (lines.length < 2) return []

  const rows: string[][] = []
  for (const line of lines) {
    if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())
    if (cells.length) rows.push(cells)
  }
  return rows
}

function parseDelimitedTable(text: string): string[][] {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(',') ? ',' : '\t'
  return lines.map((line) => line.split(delimiter).map((c) => c.trim()))
}

function detectAndParse(input: string): string[][] {
  const trimmed = input.trim()
  if (trimmed.includes('<table')) return parseHtmlTable(trimmed)
  if (trimmed.includes('|') && trimmed.split('\n').filter((l) => l.includes('|')).length >= 2) {
    return parseMarkdownTable(trimmed)
  }
  return parseDelimitedTable(trimmed)
}

function toCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
}

function toJson(rows: string[][]): string {
  if (rows.length === 0) return '[]'
  const headers = rows[0]
  const data = rows.slice(1).map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h || `col_${i}`] = row[i] ?? '' })
    return obj
  })
  return JSON.stringify(data, null, 2)
}

function toMarkdown(rows: string[][]): string {
  if (rows.length === 0) return ''
  const header = rows[0]
  const sep = header.map(() => '---')
  const body = rows.slice(1)
  return [
    `| ${header.join(' | ')} |`,
    `| ${sep.join(' | ')} |`,
    ...body.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n')
}

export default function TableExtractor() {
  const [input, setInput] = useState('')
  const [format, setFormat] = useState<OutputFormat>('csv')

  const rows = useMemo(() => detectAndParse(input), [input])

  const output = useMemo(() => {
    if (rows.length === 0) return ''
    switch (format) {
      case 'csv': return toCsv(rows)
      case 'json': return toJson(rows)
      case 'markdown': return toMarkdown(rows)
    }
  }, [rows, format])

  const download = useCallback(() => {
    const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'csv'
    const mime = format === 'json' ? 'application/json' : 'text/plain'
    downloadBlob(new Blob([output], { type: mime }), `table.${ext}`)
  }, [output, format])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste HTML table, Markdown table, or tab/CSV-separated text..."
          rows={8}
          mono
        />

        {rows.length > 0 && (
          <>
            <ToolSection title={`Preview (${rows.length} rows × ${rows[0]?.length ?? 0} cols)`}>
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/80">
                      {rows[0]?.map((cell, i) => (
                        <th key={i} className="text-left py-2 px-3 text-zinc-400 font-medium">{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(1, 6).map((row, ri) => (
                      <tr key={ri} className="border-b border-zinc-800/50">
                        {row.map((cell, ci) => (
                          <td key={ci} className="py-2 px-3">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 6 && (
                  <p className="text-xs text-zinc-500 p-2">Showing 5 of {rows.length - 1} data rows</p>
                )}
              </div>
            </ToolSection>

            <div className="flex gap-2">
              {(['csv', 'json', 'markdown'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-all uppercase',
                    format === f
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <ToolTextarea value={output} onChange={() => {}} rows={6} mono />

            <div className="flex gap-2">
              <CopyButton text={output} />
              <ToolButton variant="secondary" onClick={download}>
                Download
              </ToolButton>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
