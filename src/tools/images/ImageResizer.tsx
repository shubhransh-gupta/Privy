import { useCallback, useEffect, useState } from 'react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, ToolInput, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { downloadBlob, formatBytes } from '../../lib/utils'

const tool = getToolById('image-resizer')!

const PRESETS = [
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'Twitter/X Header', width: 1500, height: 500 },
  { name: 'Facebook Cover', width: 820, height: 312 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'HD 1080p', width: 1920, height: 1080 },
] as const

type ResizeMode = 'dimensions' | 'percentage'

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [origW, setOrigW] = useState(0)
  const [origH, setOrigH] = useState(0)
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [percentage, setPercentage] = useState('50')
  const [mode, setMode] = useState<ResizeMode>('dimensions')
  const [lockAspect, setLockAspect] = useState(true)
  const [originalSize, setOriginalSize] = useState(0)
  const [resultSize, setResultSize] = useState(0)

  const resize = useCallback(async () => {
    if (!file || !origW || !origH) return

    let targetW: number
    let targetH: number

    if (mode === 'percentage') {
      const pct = parseFloat(percentage) / 100
      if (isNaN(pct) || pct <= 0) return
      targetW = Math.round(origW * pct)
      targetH = Math.round(origH * pct)
    } else {
      targetW = parseInt(width, 10) || origW
      targetH = parseInt(height, 10) || origH
    }

    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, targetW, targetH)
    bitmap.close()

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Resize failed'))),
        file.type || 'image/png'
      )
    })

    setResultBlob(blob)
    setResultSize(blob.size)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(blob)
    })
  }, [file, origW, origH, width, height, percentage, mode])

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    setFile(f)
    setOriginalSize(f.size)
    const url = URL.createObjectURL(f)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    const bitmap = await createImageBitmap(f)
    setOrigW(bitmap.width)
    setOrigH(bitmap.height)
    setWidth(String(bitmap.width))
    setHeight(String(bitmap.height))
    bitmap.close()
  }, [])

  useEffect(() => {
    if (file && origW) resize()
  }, [file, origW, width, height, percentage, mode, resize])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [previewUrl, resultUrl])

  const handleWidthChange = (v: string) => {
    setWidth(v)
    if (lockAspect && origW && origH) {
      const w = parseInt(v, 10)
      if (!isNaN(w)) setHeight(String(Math.round((w / origW) * origH)))
    }
  }

  const handleHeightChange = (v: string) => {
    setHeight(v)
    if (lockAspect && origW && origH) {
      const h = parseInt(v, 10)
      if (!isNaN(h)) setWidth(String(Math.round((h / origH) * origW)))
    }
  }

  const applyPreset = (w: number, h: number) => {
    setMode('dimensions')
    setWidth(String(w))
    setHeight(String(h))
  }

  const outW = mode === 'percentage'
    ? Math.round(origW * (parseFloat(percentage) / 100)) || 0
    : parseInt(width, 10) || 0
  const outH = mode === 'percentage'
    ? Math.round(origH * (parseFloat(percentage) / 100)) || 0
    : parseInt(height, 10) || 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone accept="image/*" onFiles={handleFile} label="Drop an image to resize" />

        {file && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Original" value={`${origW}×${origH}`} />
              <StatBox label="Output" value={outW ? `${outW}×${outH}` : '—'} />
              <StatBox label="Original size" value={formatBytes(originalSize)} />
              <StatBox label="Output size" value={resultSize ? formatBytes(resultSize) : '—'} />
            </div>

            <ToolSection title="Resize mode">
              <div className="flex flex-wrap gap-2">
                {(['dimensions', 'percentage'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      mode === m
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {m === 'dimensions' ? 'Width × Height' : 'Percentage'}
                  </button>
                ))}
              </div>
            </ToolSection>

            {mode === 'dimensions' ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <ToolInput label="Width (px)" type="number" value={width} onChange={handleWidthChange} />
                <ToolInput label="Height (px)" type="number" value={height} onChange={handleHeightChange} />
              </div>
            ) : (
              <ToolInput
                label="Scale (%)"
                type="number"
                value={percentage}
                onChange={setPercentage}
              />
            )}

            {mode === 'dimensions' && (
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="accent-indigo-500"
                />
                Lock aspect ratio
              </label>
            )}

            <ToolSection title="Presets">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p.width, p.height)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-zinc-700 text-zinc-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                  >
                    {p.name} ({p.width}×{p.height})
                  </button>
                ))}
              </div>
            </ToolSection>

            <div className="grid sm:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Original</p>
                  <img src={previewUrl} alt="Original" className="rounded-lg border border-zinc-800 max-h-48 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
              {resultUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Resized</p>
                  <img src={resultUrl} alt="Resized" className="rounded-lg border border-zinc-800 max-h-48 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
            </div>

            {resultBlob && (
              <ToolButton
                onClick={() =>
                  downloadBlob(resultBlob, file.name.replace(/(\.[^.]+)?$/, `_${outW}x${outH}$1`))
                }
              >
                Download resized image
              </ToolButton>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
