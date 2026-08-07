import { useCallback, useState } from 'react'
import exifr from 'exifr'
import { ToolLayout, ToolSection, ToolButton } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { getToolById } from '../../lib/toolRegistry'
import { downloadBlob, formatBytes } from '../../lib/utils'
import { CheckCircle, Image as ImageIcon } from 'lucide-react'

const tool = getToolById('metadata-remover')!

interface ProcessedFile {
  name: string
  originalSize: number
  cleanedSize: number
  blob: Blob
  preview: string
}

export default function MetadataRemover() {
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processed, setProcessed] = useState<ProcessedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const stripMetadata = useCallback(async (file: File) => {
    const metadata = await exifr.parse(file).catch(() => null)
    void metadata

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = objectUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(objectUrl)

    const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
        mime,
        mime === 'image/jpeg' ? 0.92 : undefined
      )
    })

    const preview = URL.createObjectURL(blob)
    return {
      name: file.name.replace(/\.[^.]+$/, '') + (mime === 'image/png' ? '.png' : '.jpg'),
      originalSize: file.size,
      cleanedSize: blob.size,
      blob,
      preview,
    }
  }, [])

  const handleFiles = useCallback(
    async (files: File[]) => {
      setError(null)
      setProcessing(true)
      setProgress(0)
      const results: ProcessedFile[] = []

      for (let i = 0; i < files.length; i++) {
        try {
          const result = await stripMetadata(files[i])
          results.push(result)
        } catch {
          setError(`Failed to process ${files[i].name}`)
        }
        setProgress(((i + 1) / files.length) * 100)
      }

      setProcessed((prev) => [...prev, ...results])
      setProcessing(false)
    },
    [stripMetadata]
  )

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <p className="text-sm text-zinc-400">
          Re-encodes images via canvas to strip EXIF, GPS, camera info, and other metadata.
          Processing happens entirely in your browser.
        </p>

        <FileDropzone
          onFiles={handleFiles}
          accept="image/*"
          multiple
          label="Drop images to remove metadata"
        />

        {processing && <ProgressBar progress={progress} label="Processing images..." />}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {processed.length > 0 && (
          <ToolSection title="Cleaned Images">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {processed.map((file, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
                >
                  <img src={file.preview} alt={file.name} className="w-full h-40 object-cover" />
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {formatBytes(file.originalSize)} → {formatBytes(file.cleanedSize)}
                    </div>
                    <ToolButton
                      variant="secondary"
                      className="w-full"
                      onClick={() => downloadBlob(file.blob, file.name)}
                    >
                      Download
                    </ToolButton>
                  </div>
                </div>
              ))}
            </div>
          </ToolSection>
        )}

        {processed.length === 0 && !processing && (
          <div className="flex items-center justify-center gap-2 text-zinc-600 py-4">
            <ImageIcon className="h-5 w-5" />
            <span className="text-sm">No images processed yet</span>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
