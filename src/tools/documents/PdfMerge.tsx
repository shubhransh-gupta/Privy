import { useCallback, useMemo, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { downloadBlob, formatBytes, cn } from '../../lib/utils'

const tool = getToolById('pdf-merge')!

interface PdfEntry {
  id: string
  file: File
  pageCount: number
}

export default function PdfMerge() {
  const [entries, setEntries] = useState<PdfEntry[]>([])
  const [merging, setMerging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  const totalSize = useMemo(() => entries.reduce((sum, e) => sum + e.file.size, 0), [entries])
  const totalPages = useMemo(() => entries.reduce((sum, e) => sum + e.pageCount, 0), [entries])

  const addFiles = useCallback(async (files: File[]) => {
    setError('')
    const pdfs = files.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))
    if (!pdfs.length) {
      setError('Please select valid PDF files')
      return
    }

    const newEntries: PdfEntry[] = []
    for (const file of pdfs) {
      try {
        const buffer = await file.arrayBuffer()
        const doc = await PDFDocument.load(buffer)
        newEntries.push({
          id: crypto.randomUUID(),
          file,
          pageCount: doc.getPageCount(),
        })
      } catch {
        setError(`Could not read "${file.name}"`)
      }
    }
    setEntries((prev) => [...prev, ...newEntries])
  }, [])

  const moveEntry = (index: number, direction: -1 | 1) => {
    const next = index + direction
    if (next < 0 || next >= entries.length) return
    setEntries((prev) => {
      const copy = [...prev]
      ;[copy[index], copy[next]] = [copy[next], copy[index]]
      return copy
    })
  }

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return
    setEntries((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(dragIndex, 1)
      copy.splice(targetIndex, 0, item)
      return copy
    })
    setDragIndex(null)
  }

  const merge = async () => {
    if (entries.length < 2) return
    setMerging(true)
    setProgress(0)
    setError('')

    try {
      const merged = await PDFDocument.create()
      for (let i = 0; i < entries.length; i++) {
        const buffer = await entries[i].file.arrayBuffer()
        const src = await PDFDocument.load(buffer)
        const pages = await merged.copyPages(src, src.getPageIndices())
        pages.forEach((p) => merged.addPage(p))
        setProgress(((i + 1) / entries.length) * 100)
      }

      const bytes = await merged.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), 'merged.pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to merge PDFs')
    } finally {
      setMerging(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf,application/pdf"
          multiple
          onFiles={addFiles}
          label="Drop PDF files to merge (add more anytime)"
        />

        {entries.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Files" value={entries.length} />
              <StatBox label="Total pages" value={totalPages} />
              <StatBox label="Estimated size" value={formatBytes(totalSize)} />
            </div>

            <ToolSection title="Order (drag to reorder)">
              <ul className="space-y-2">
                {entries.map((entry, index) => (
                  <li
                    key={entry.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2',
                      dragIndex === index && 'border-indigo-500/50 bg-indigo-500/5'
                    )}
                  >
                    <GripVertical className="h-4 w-4 text-zinc-600 shrink-0 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{entry.file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {entry.pageCount} pages · {formatBytes(entry.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveEntry(index, -1)}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEntry(index, 1)}
                        disabled={index === entries.length - 1}
                        className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </ToolSection>

            {merging && <ProgressBar progress={progress} label="Merging PDFs…" />}

            <div className="flex gap-2">
              <ToolButton onClick={merge} disabled={entries.length < 2 || merging}>
                Merge & Download
              </ToolButton>
              <ToolButton variant="secondary" onClick={() => setEntries([])}>
                Clear all
              </ToolButton>
            </div>
          </>
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
