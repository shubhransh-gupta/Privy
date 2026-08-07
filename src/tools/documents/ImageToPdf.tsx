import { useCallback, useMemo, useState } from 'react'
import { PDFDocument, PageSizes } from 'pdf-lib'
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { downloadBlob, formatBytes, cn } from '../../lib/utils'

const tool = getToolById('image-to-pdf')!

type PageSizeKey = 'fit' | 'a4' | 'letter' | 'a5'

interface ImageEntry {
  id: string
  file: File
  preview: string
  width: number
  height: number
}

const PAGE_SIZES: Record<Exclude<PageSizeKey, 'fit'>, [number, number]> = {
  a4: PageSizes.A4,
  letter: PageSizes.Letter,
  a5: PageSizes.A5,
}

async function loadImage(file: File): Promise<ImageEntry> {
  const preview = URL.createObjectURL(file)
  const img = await createImageBitmap(file)
  return { id: crypto.randomUUID(), file, preview, width: img.width, height: img.height }
}

async function embedImage(pdf: PDFDocument, file: File) {
  const buffer = await file.arrayBuffer()
  const type = file.type
  if (type === 'image/png') return pdf.embedPng(buffer)
  if (type === 'image/jpeg' || type === 'image/jpg') return pdf.embedJpg(buffer)
  // Convert other formats via canvas
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const pngBuffer = await new Promise<ArrayBuffer>((resolve) => {
    canvas.toBlob(async (blob) => {
      resolve(await blob!.arrayBuffer())
    }, 'image/png')
  })
  return pdf.embedPng(pngBuffer)
}

export default function ImageToPdf() {
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const [pageSize, setPageSize] = useState<PageSizeKey>('fit')
  const margin = 36
  const [building, setBuilding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  const totalSize = useMemo(() => entries.reduce((s, e) => s + e.file.size, 0), [entries])

  const addImages = useCallback(async (files: File[]) => {
    setError('')
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) {
      setError('Please select image files')
      return
    }
    const loaded = await Promise.all(images.map(loadImage))
    setEntries((prev) => [...prev, ...loaded])
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
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id)
      if (entry) URL.revokeObjectURL(entry.preview)
      return prev.filter((e) => e.id !== id)
    })
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

  const buildPdf = async () => {
    if (!entries.length) return
    setBuilding(true)
    setProgress(0)
    setError('')

    try {
      const pdf = await PDFDocument.create()

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i]
        const img = await embedImage(pdf, entry.file)
        const imgW = img.width
        const imgH = img.height

        let pageW: number
        let pageH: number

        if (pageSize === 'fit') {
          pageW = imgW + margin * 2
          pageH = imgH + margin * 2
        } else {
          ;[pageW, pageH] = PAGE_SIZES[pageSize]
        }

        const page = pdf.addPage([pageW, pageH])
        const maxW = pageW - margin * 2
        const maxH = pageH - margin * 2
        const scale = Math.min(maxW / imgW, maxH / imgH, 1)
        const drawW = imgW * scale
        const drawH = imgH * scale
        const x = (pageW - drawW) / 2
        const y = (pageH - drawH) / 2

        page.drawImage(img, { x, y, width: drawW, height: drawH })
        setProgress(((i + 1) / entries.length) * 100)
      }

      const bytes = await pdf.save()
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), 'images.pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create PDF')
    } finally {
      setBuilding(false)
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          multiple
          onFiles={addImages}
          label="Drop images to convert to PDF"
        />

        {entries.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Images" value={entries.length} />
              <StatBox label="Total size" value={formatBytes(totalSize)} />
              <StatBox label="Pages" value={entries.length} />
            </div>

            <ToolSection title="Page size">
              <div className="flex flex-wrap gap-2">
                {([
                  ['fit', 'Fit to image'],
                  ['a4', 'A4'],
                  ['letter', 'Letter'],
                  ['a5', 'A5'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPageSize(id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      pageSize === id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ToolSection>

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
                    <img
                      src={entry.preview}
                      alt=""
                      className="h-10 w-10 object-cover rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{entry.file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {entry.width}×{entry.height} · {formatBytes(entry.file.size)}
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

            {building && <ProgressBar progress={progress} label="Building PDF…" />}

            <ToolButton onClick={buildPdf} disabled={building}>
              Create PDF
            </ToolButton>
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
