import { useCallback, useEffect, useState } from 'react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { downloadBlob, formatBytes } from '../../lib/utils'

const tool = getToolById('image-compressor')!

type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png' | 'image/avif'

const FORMATS: { id: OutputFormat; label: string; ext: string }[] = [
  { id: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/avif', label: 'AVIF', ext: 'avif' },
]

async function loadImage(file: File): Promise<{ bitmap: ImageBitmap; url: string }> {
  const url = URL.createObjectURL(file)
  const bitmap = await createImageBitmap(file)
  return { bitmap, url }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: OutputFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
      type,
      quality
    )
  })
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [compressedUrl, setCompressedUrl] = useState('')
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [quality, setQuality] = useState(0.8)
  const [format, setFormat] = useState<OutputFormat>('image/jpeg')
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 })
  const [processing, setProcessing] = useState(false)

  const compress = useCallback(async (f: File, q: number, fmt: OutputFormat) => {
    setProcessing(true)
    try {
      const { bitmap, url } = await loadImage(f)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setDimensions({ w: bitmap.width, h: bitmap.height })

      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      bitmap.close()

      const blob = await canvasToBlob(canvas, fmt, q)
      setCompressedBlob(blob)
      setCompressedSize(blob.size)
      setCompressedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
    } finally {
      setProcessing(false)
    }
  }, [])

  const handleFile = useCallback(
    async (files: File[]) => {
      const f = files[0]
      setFile(f)
      setOriginalSize(f.size)
      setCompressedBlob(null)
      await compress(f, quality, format)
    },
    [compress, quality, format]
  )

  useEffect(() => {
    if (file) compress(file, quality, format)
  }, [file, quality, format, compress])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    }
  }, [previewUrl, compressedUrl])

  const savings =
    originalSize > 0 && compressedSize > 0
      ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
      : '0'

  const ext = FORMATS.find((f) => f.id === format)?.ext ?? 'jpg'

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          onFiles={handleFile}
          label="Drop an image to compress"
        />

        {file && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Original" value={formatBytes(originalSize)} />
              <StatBox label="Compressed" value={compressedSize ? formatBytes(compressedSize) : '—'} />
              <StatBox label="Saved" value={compressedSize ? `${savings}%` : '—'} />
              <StatBox label="Dimensions" value={`${dimensions.w}×${dimensions.h}`} />
            </div>

            <ToolSection title="Format">
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

            <div className="grid sm:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Original</p>
                  <img src={previewUrl} alt="Original" className="rounded-lg border border-zinc-800 max-h-64 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
              {compressedUrl && !processing && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Compressed</p>
                  <img src={compressedUrl} alt="Compressed" className="rounded-lg border border-zinc-800 max-h-64 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
            </div>

            {compressedBlob && (
              <ToolButton
                onClick={() =>
                  downloadBlob(
                    compressedBlob,
                    file.name.replace(/\.[^.]+$/, '') + `_compressed.${ext}`
                  )
                }
                disabled={processing}
              >
                Download compressed image
              </ToolButton>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
