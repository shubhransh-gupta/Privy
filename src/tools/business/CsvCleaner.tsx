import { useCallback, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { ToolLayout, ToolSection, ToolTextarea, ToolButton, StatBox } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { getToolById } from '../../lib/toolRegistry'
import { downloadBlob } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { AlertCircle, CheckCircle } from 'lucide-react'

const tool = getToolById('csv-cleaner')!

interface CsvIssue {
  type: 'duplicate' | 'empty' | 'whitespace' | 'header'
  message: string
  count: number
}

export default function CsvCleaner() {
  const [csvText, setCsvText] = useState('')
  const [cleaned, setCleaned] = useState('')
  const [issues, setIssues] = useState<CsvIssue[]>([])
  const [options, setOptions] = useState({
    removeDuplicates: true,
    removeEmptyRows: true,
    trimCells: true,
    normalizeHeaders: true,
  })

  const parseCsv = useCallback((text: string) => {
    const result = Papa.parse<string[]>(text, { skipEmptyLines: false })
    return result.data
  }, [])

  const analyze = useMemo(() => {
    if (!csvText.trim()) return []
    const rows = parseCsv(csvText)
    const found: CsvIssue[] = []

    const emptyRows = rows.filter((r) => r.every((c) => !c?.trim())).length
    if (emptyRows > 0) found.push({ type: 'empty', message: 'Empty rows detected', count: emptyRows })

    const trimmedNeeded = rows.some((r) => r.some((c) => c !== c?.trim()))
    if (trimmedNeeded) found.push({ type: 'whitespace', message: 'Cells with extra whitespace', count: -1 })

    const seen = new Set<string>()
    let dupes = 0
    for (const row of rows) {
      const key = row.join('|')
      if (seen.has(key)) dupes++
      else seen.add(key)
    }
    if (dupes > 0) found.push({ type: 'duplicate', message: 'Duplicate rows detected', count: dupes })

    if (rows.length > 0) {
      const headers = rows[0]
      const normalized = headers.map((h) => h?.trim().toLowerCase().replace(/\s+/g, '_') ?? '')
      const needsNorm = headers.some((h, i) => h !== normalized[i])
      if (needsNorm) found.push({ type: 'header', message: 'Headers need normalization', count: headers.length })
    }

    return found
  }, [csvText, parseCsv])

  const handleFile = useCallback(async (files: File[]) => {
    const text = await files[0].text()
    setCsvText(text)
  }, [])

  const clean = useCallback(() => {
    let rows = parseCsv(csvText)

    if (options.trimCells) {
      rows = rows.map((r) => r.map((c) => c?.trim() ?? ''))
    }

    if (options.normalizeHeaders && rows.length > 0) {
      rows[0] = rows[0].map((h) =>
        h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      )
    }

    if (options.removeEmptyRows) {
      rows = rows.filter((r) => r.some((c) => c.length > 0))
    }

    if (options.removeDuplicates) {
      const seen = new Set<string>()
      rows = rows.filter((r) => {
        const key = r.join('|')
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    const output = Papa.unparse(rows)
    setCleaned(output)
    setIssues(analyze)
  }, [csvText, options, parseCsv, analyze])

  const download = useCallback(() => {
    downloadBlob(new Blob([cleaned], { type: 'text/csv' }), 'cleaned.csv')
  }, [cleaned])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone onFiles={handleFile} accept=".csv,text/csv" label="Drop CSV file or paste below" />

        <ToolTextarea
          value={csvText}
          onChange={setCsvText}
          placeholder="Paste CSV data here..."
          rows={6}
          mono
        />

        <ToolSection title="Cleaning Options">
          <div className="grid grid-cols-2 gap-3">
            {([
              ['Remove duplicate rows', 'removeDuplicates'],
              ['Remove empty rows', 'removeEmptyRows'],
              ['Trim cell whitespace', 'trimCells'],
              ['Normalize headers', 'normalizeHeaders'],
            ] as const).map(([label, key]) => (
              <label
                key={key}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer',
                  options[key] ? 'border-indigo-600/50 bg-indigo-600/10' : 'border-zinc-800'
                )}
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                  className="rounded border-zinc-600 bg-zinc-900 text-indigo-600"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </ToolSection>

        <ToolButton onClick={clean} disabled={!csvText.trim()}>
          Clean CSV
        </ToolButton>

        {(analyze.length > 0 || issues.length > 0) && (
          <ToolSection title="Detected Issues">
            <div className="space-y-2">
              {(issues.length > 0 ? issues : analyze).map((issue, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-600/10 border border-yellow-600/20 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {issue.message}
                  {issue.count > 0 && ` (${issue.count})`}
                </div>
              ))}
            </div>
          </ToolSection>
        )}

        {cleaned && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Original Rows" value={parseCsv(csvText).length} />
              <StatBox label="Cleaned Rows" value={parseCsv(cleaned).length} />
            </div>
            <ToolSection title="Cleaned Output">
              <div className="flex items-center gap-2 text-sm text-green-400 mb-2">
                <CheckCircle className="h-4 w-4" /> CSV cleaned successfully
              </div>
              <ToolTextarea value={cleaned} onChange={() => {}} rows={6} mono />
              <div className="mt-3">
                <ToolButton variant="secondary" onClick={download}>
                  Download CSV
                </ToolButton>
              </div>
            </ToolSection>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
