import { useCallback, useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, ToolSection, StatBox } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { downloadBlob } from '../../lib/utils'

const tool = getToolById('image-redactor')!

type RedactMode = 'solid' | 'blur' | 'pixelate'

interface RedactRect {
  id: string
  x: number
  y: number
  w: number
  h: number
}

function applyRedactions(
  ctx: CanvasRenderingContext2D,
  rects: RedactRect[],
  mode: RedactMode,
  color: string,
  blurAmount: number,
  pixelSize: number
) {
  for (const rect of rects) {
    const { x, y, w, h } = rect
    const ix = Math.round(x)
    const iy = Math.round(y)
    const iw = Math.round(w)
    const ih = Math.round(h)

    if (mode === 'solid') {
      ctx.fillStyle = color
      ctx.fillRect(ix, iy, iw, ih)
    } else if (mode === 'blur') {
      const temp = document.createElement('canvas')
      temp.width = iw
      temp.height = ih
      const tctx = temp.getContext('2d')!
      tctx.filter = `blur(${blurAmount}px)`
      tctx.drawImage(ctx.canvas, ix, iy, iw, ih, 0, 0, iw, ih)
      ctx.drawImage(temp, ix, iy)
    } else {
      const temp = document.createElement('canvas')
      const smallW = Math.max(1, Math.floor(iw / pixelSize))
      const smallH = Math.max(1, Math.floor(ih / pixelSize))
      temp.width = smallW
      temp.height = smallH
      const tctx = temp.getContext('2d')!
      tctx.imageSmoothingEnabled = false
      tctx.drawImage(ctx.canvas, ix, iy, iw, ih, 0, 0, smallW, smallH)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(temp, 0, 0, smallW, smallH, ix, iy, iw, ih)
      ctx.imageSmoothingEnabled = true
    }
  }
}

export default function ImageRedactor() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [rects, setRects] = useState<RedactRect[]>([])
  const [mode, setMode] = useState<RedactMode>('solid')
  const [color, setColor] = useState('#000000')
  const [blurAmount, setBlurAmount] = useState(12)
  const [pixelSize, setPixelSize] = useState(12)
  const [drawing, setDrawing] = useState(false)
  const [startPt, setStartPt] = useState({ x: 0, y: 0 })
  const [currentRect, setCurrentRect] = useState<RedactRect | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const displayScale = useRef(1)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    setFile(f)
    setRects([])
    const url = URL.createObjectURL(f)
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    const bitmap = await createImageBitmap(f)
    setImgSize({ w: bitmap.width, h: bitmap.height })
    bitmap.close()
  }, [])

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  const toImageCoords = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = imgSize.w / rect.width
    const scaleY = imgSize.h / rect.height
    return {
      x: Math.max(0, Math.min(imgSize.w, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(imgSize.h, (e.clientY - rect.top) * scaleY)),
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = toImageCoords(e)
    setDrawing(true)
    setStartPt(pt)
    setCurrentRect({ id: crypto.randomUUID(), x: pt.x, y: pt.y, w: 0, h: 0 })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing) return
    const pt = toImageCoords(e)
    setCurrentRect({
      id: 'temp',
      x: Math.min(startPt.x, pt.x),
      y: Math.min(startPt.y, pt.y),
      w: Math.abs(pt.x - startPt.x),
      h: Math.abs(pt.y - startPt.y),
    })
  }

  const onPointerUp = () => {
    if (currentRect && currentRect.w > 5 && currentRect.h > 5) {
      setRects((prev) => [...prev, { ...currentRect, id: crypto.randomUUID() }])
    }
    setDrawing(false)
    setCurrentRect(null)
  }

  const exportRedacted = async () => {
    if (!file) return
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = imgSize.w
    exportCanvas.height = imgSize.h
    const ctx = exportCanvas.getContext('2d')!

    const bitmap = await createImageBitmap(file)
    ctx.drawImage(bitmap, 0, 0)
    bitmap.close()

    applyRedactions(ctx, rects, mode, color, blurAmount, pixelSize)

    const blob = await new Promise<Blob>((resolve, reject) => {
      exportCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Export failed'))),
        file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'
      )
    })
    downloadBlob(blob, file.name.replace(/(\.[^.]+)?$/, '_redacted$1'))
  }

  const maxDisplayW = 640
  displayScale.current = imgSize.w > maxDisplayW ? maxDisplayW / imgSize.w : 1

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200/90">
          Draw rectangles over sensitive areas. Redactions are applied to actual pixels on export —
          the original content cannot be recovered from the downloaded file.
        </div>

        <FileDropzone accept="image/*" onFiles={handleFile} label="Drop an image to redact" />

        {file && imgSize.w > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Regions" value={rects.length} />
              <StatBox label="Image size" value={`${imgSize.w}×${imgSize.h}`} />
            </div>

            <ToolSection title="Redaction style">
              <div className="flex flex-wrap gap-2">
                {([
                  ['solid', 'Solid fill'],
                  ['blur', 'Blur'],
                  ['pixelate', 'Pixelate'],
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

            {mode === 'solid' && (
              <ToolSection title="Fill color">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-16 rounded cursor-pointer bg-transparent"
                />
              </ToolSection>
            )}

            {mode === 'blur' && (
              <ToolSection title={`Blur strength: ${blurAmount}px`}>
                <input
                  type="range"
                  min={4}
                  max={40}
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </ToolSection>
            )}

            {mode === 'pixelate' && (
              <ToolSection title={`Pixel size: ${pixelSize}px`}>
                <input
                  type="range"
                  min={4}
                  max={40}
                  value={pixelSize}
                  onChange={(e) => setPixelSize(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </ToolSection>
            )}

            <ToolSection title="Draw rectangles to mark redaction areas">
              <div
                className="relative inline-block max-w-full overflow-hidden rounded-lg border border-zinc-800"
                style={{ maxWidth: maxDisplayW }}
              >
                <canvas
                  ref={canvasRef}
                  className="block w-full h-auto cursor-crosshair touch-none"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                />
                <div className="absolute inset-0 pointer-events-none">
                  {rects.map((r) => (
                    <div
                      key={r.id}
                      className="absolute border-2 border-indigo-400 bg-indigo-500/25"
                      style={{
                        left: `${(r.x / imgSize.w) * 100}%`,
                        top: `${(r.y / imgSize.h) * 100}%`,
                        width: `${(r.w / imgSize.w) * 100}%`,
                        height: `${(r.h / imgSize.h) * 100}%`,
                      }}
                    />
                  ))}
                  {currentRect && (
                    <div
                      className="absolute border-2 border-dashed border-indigo-400 bg-indigo-500/25"
                      style={{
                        left: `${(currentRect.x / imgSize.w) * 100}%`,
                        top: `${(currentRect.y / imgSize.h) * 100}%`,
                        width: `${(currentRect.w / imgSize.w) * 100}%`,
                        height: `${(currentRect.h / imgSize.h) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            </ToolSection>

            {rects.length > 0 && (
              <ToolSection title="Marked regions">
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {rects.map((r, i) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between text-sm text-zinc-400 px-2 py-1 rounded hover:bg-zinc-800/50"
                    >
                      <span>
                        #{i + 1}: {Math.round(r.w)}×{Math.round(r.h)} at ({Math.round(r.x)}, {Math.round(r.y)})
                      </span>
                      <button
                        type="button"
                        onClick={() => setRects((prev) => prev.filter((x) => x.id !== r.id))}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </ToolSection>
            )}

            <div className="flex gap-2">
              <ToolButton onClick={exportRedacted} disabled={!rects.length}>
                Export redacted image
              </ToolButton>
              <ToolButton variant="secondary" onClick={() => setRects([])}>
                Clear regions
              </ToolButton>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
