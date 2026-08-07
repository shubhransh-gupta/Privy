import { useCallback, useEffect, useState } from 'react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { downloadBlob, formatBytes } from '../../lib/utils'

const tool = getToolById('image-converter')!

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/avif'

const FORMATS: { id: OutputFormat; label: string; ext: string; mime: string }[] = [
  { id: 'image/png', label: 'PNG', ext: 'png', mime: 'image/png' },
  { id: 'image/jpeg', label: 'JPEG', ext: 'jpg', mime: 'image/jpeg' },
  { id: 'image/webp', label: 'WebP', ext: 'webp', mime: 'image/webp' },
  { id: 'image/avif', label: 'AVIF', ext: 'avif', mime: 'image/avif' },
]

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [format, setFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(0.92)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultUrl, setResultUrl] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [resultSize, setResultSize] = useState(0)
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })
  const [sourceFormat, setSourceFormat] = useState('')

  const convert = useCallback(async (f: File, fmt: OutputFormat, q: number) => {
    const bitmap = await createImageBitmap(f)
    setDimensions({ w: bitmap.width, h: bitmap.height })

    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!

    if (fmt === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Conversion failed'))),
        fmt,
        fmt === 'image/png' ? undefined : q
      )
    })

    setResultBlob(blob)
    setResultSize(blob.size)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(blob)
    })
  }, [])

  const handleFile = useCallback(
    async (files: File[]) => {
      const f = files[0]
      setFile(f)
      setOriginalSize(f.size)
      setSourceFormat(f.type || 'unknown')
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(f)
      })
      await convert(f, format, quality)
    },
    [convert, format, quality]
  )

  useEffect(() => {
    if (file) convert(file, format, quality)
  }, [file, format, quality, convert])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [previewUrl, resultUrl])

  const ext = FORMATS.find((f) => f.id === format)?.ext ?? 'png'

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone accept="image/*" onFiles={handleFile} label="Drop an image to convert" />

        {file && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Source format" value={sourceFormat.split('/')[1]?.toUpperCase() ?? '—'} />
              <StatBox label="Target format" value={ext.toUpperCase()} />
              <StatBox label="Original size" value={formatBytes(originalSize)} />
              <StatBox label="Converted size" value={resultSize ? formatBytes(resultSize) : '—'} />
            </div>

            <ToolSection title="Convert to">
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      format === f.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </ToolSection>

            {format !== 'image/png' && (
              <ToolSection title={`Quality: ${Math.round(quality * 100)}%`}>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </ToolSection>
            )}

            <StatBox label="Dimensions" value={`${dimensions.w}×${dimensions.h}`} />

            <div className="grid sm:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Original</p>
                  <img src={previewUrl} alt="Original" className="rounded-lg border border-zinc-800 max-h-64 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
              {resultUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Converted</p>
                  <img src={resultUrl} alt="Converted" className="rounded-lg border border-zinc-800 max-h-64 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
            </div>

            {resultBlob && (
              <ToolButton
                onClick={() =>
                  downloadBlob(resultBlob, file.name.replace(/\.[^.]+$/, '') + `.${ext}`)
                }
              >
                Download {ext.toUpperCase()}
              </ToolButton>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
