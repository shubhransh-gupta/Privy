import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { Download } from 'lucide-react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, ToolInput, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { downloadBlob, formatBytes } from '../../lib/utils'

const tool = getToolById('pdf-split')!

type SplitMode = 'ranges' | 'every-n' | 'individual'

interface SplitResult {
  name: string
  blob: Blob
  pages: string
}

function parseRanges(input: string, maxPages: number): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = []
  const parts = input.split(',').map((p) => p.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map((n) => parseInt(n.trim(), 10))
      if (!isNaN(a) && !isNaN(b)) {
        ranges.push({ start: Math.max(1, a), end: Math.min(maxPages, b) })
      }
    } else {
      const n = parseInt(part, 10)
      if (!isNaN(n) && n >= 1 && n <= maxPages) {
        ranges.push({ start: n, end: n })
      }
    }
  }
  return ranges
}

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [mode, setMode] = useState<SplitMode>('ranges')
  const [rangeInput, setRangeInput] = useState('1-3, 5')
  const [everyN, setEveryN] = useState('5')
  const [results, setResults] = useState<SplitResult[]>([])
  const [splitting, setSplitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const loadPdf = useCallback(async (files: File[]) => {
    setError('')
    setResults([])
    const f = files[0]
    try {
      const buffer = await f.arrayBuffer()
      const doc = await PDFDocument.load(buffer)
      setFile(f)
      setPageCount(doc.getPageCount())
    } catch {
      setError('Could not read PDF file')
    }
  }, [])

  const createSplit = async (
    srcBytes: ArrayBuffer,
    ranges: { start: number; end: number }[],
    baseName: string
  ): Promise<SplitResult[]> => {
    const src = await PDFDocument.load(srcBytes)
    const output: SplitResult[] = []

    for (let i = 0; i < ranges.length; i++) {
      const { start, end } = ranges[i]
      const indices = Array.from({ length: end - start + 1 }, (_, j) => start - 1 + j)
      const doc = await PDFDocument.create()
      const pages = await doc.copyPages(src, indices)
      pages.forEach((p) => doc.addPage(p))
      const bytes = await doc.save()
      output.push({
        name: `${baseName}_pages_${start}${end !== start ? `-${end}` : ''}.pdf`,
        blob: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
        pages: end === start ? `${start}` : `${start}–${end}`,
      })
      setProgress(((i + 1) / ranges.length) * 100)
    }
    return output
  }

  const split = async () => {
    if (!file) return
    setSplitting(true)
    setProgress(0)
    setError('')
    setResults([])

    try {
      const buffer = await file.arrayBuffer()
      const baseName = file.name.replace(/\.pdf$/i, '') || 'split'
      let ranges: { start: number; end: number }[] = []

      if (mode === 'ranges') {
        ranges = parseRanges(rangeInput, pageCount)
        if (!ranges.length) {
          setError('Enter valid page ranges (e.g. 1-3, 5, 7-9)')
          return
        }
      } else if (mode === 'every-n') {
        const n = parseInt(everyN, 10)
        if (isNaN(n) || n < 1) {
          setError('Enter a valid number of pages per split')
          return
        }
        for (let start = 1; start <= pageCount; start += n) {
          ranges.push({ start, end: Math.min(start + n - 1, pageCount) })
        }
      } else {
        ranges = Array.from({ length: pageCount }, (_, i) => ({ start: i + 1, end: i + 1 }))
      }

      const output = await createSplit(buffer, ranges, baseName)
      setResults(output)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split PDF')
    } finally {
      setSplitting(false)
    }
  }

  const downloadAll = () => {
    results.forEach((r, i) => {
      setTimeout(() => downloadBlob(r.blob, r.name), i * 300)
    })
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf,application/pdf"
          onFiles={loadPdf}
          label="Drop a PDF to split"
        />

        {file && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="File" value={file.name} />
              <StatBox label="Pages" value={pageCount} />
            </div>

            <ToolSection title="Split mode">
              <div className="flex flex-wrap gap-2">
                {([
                  ['ranges', 'Page ranges'],
                  ['every-n', 'Every N pages'],
                  ['individual', 'Individual pages'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      mode === id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ToolSection>

            {mode === 'ranges' && (
              <ToolInput
                label="Page ranges (e.g. 1-3, 5, 7-9)"
                value={rangeInput}
                onChange={setRangeInput}
                placeholder="1-3, 5, 7-9"
              />
            )}

            {mode === 'every-n' && (
              <ToolInput
                label="Pages per file"
                type="number"
                value={everyN}
                onChange={setEveryN}
                placeholder="5"
              />
            )}

            {mode === 'individual' && (
              <p className="text-sm text-zinc-500">
                Creates {pageCount} separate PDF files, one per page.
              </p>
            )}

            {splitting && <ProgressBar progress={progress} label="Splitting…" />}

            <ToolButton onClick={split} disabled={splitting}>
              Split PDF
            </ToolButton>
          </>
        )}

        {results.length > 0 && (
          <ToolSection title={`${results.length} file(s) ready`}>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate">{r.name}</p>
                    <p className="text-xs text-zinc-500">
                      Pages {r.pages} · {formatBytes(r.blob.size)}
                    </p>
                  </div>
                  <ToolButton
                    variant="secondary"
                    onClick={() => downloadBlob(r.blob, r.name)}
                    className="shrink-0 !px-2 !py-1"
                  >
                    <Download className="h-4 w-4" />
                  </ToolButton>
                </div>
              ))}
            </div>
            {results.length > 1 && (
              <ToolButton variant="secondary" onClick={downloadAll} className="mt-3">
                Download all ({results.length})
              </ToolButton>
            )}
          </ToolSection>
        )}

        {error && (
          <p className="text-sm text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            {error}
          </p>
        )}
      </div>
    </ToolLayout>
  )
}
