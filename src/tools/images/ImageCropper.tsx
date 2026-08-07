import { useCallback, useEffect, useRef, useState } from 'react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { downloadBlob } from '../../lib/utils'

const tool = getToolById('image-cropper')!

const RATIO_PRESETS = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '4:5', ratio: 4 / 5 },
  { label: '5:4', ratio: 5 / 4 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '9:16', ratio: 9 / 16 },
  { label: '3:2', ratio: 3 / 2 },
  { label: '2:3', ratio: 2 / 3 },
  { label: '4:3', ratio: 4 / 3 },
] as const

interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'create'

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 })
  const [ratio, setRatio] = useState<number | null>(null)
  const [resultUrl, setResultUrl] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ mode: DragMode; startX: number; startY: number; startCrop: CropRect } | null>(null)

  const displayScale = useRef(1)

  const handleFile = useCallback(async (files: File[]) => {
    const f = files[0]
    setFile(f)
    const url = URL.createObjectURL(f)
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    const bitmap = await createImageBitmap(f)
    setImgSize({ w: bitmap.width, h: bitmap.height })
    setCrop({ x: 0, y: 0, w: bitmap.width, h: bitmap.height })
    bitmap.close()
    setResultBlob(null)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
  }, [])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [imageUrl, resultUrl])

  const toImageCoords = (clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(imgSize.w, (clientX - rect.left) / displayScale.current))
    const y = Math.max(0, Math.min(imgSize.h, (clientY - rect.top) / displayScale.current))
    return { x, y }
  }

  const clampCrop = (c: CropRect): CropRect => {
    let { x, y, w, h } = c
    w = Math.max(10, Math.min(w, imgSize.w))
    h = Math.max(10, Math.min(h, imgSize.h))
    x = Math.max(0, Math.min(x, imgSize.w - w))
    y = Math.max(0, Math.min(y, imgSize.h - h))
    return { x, y, w, h }
  }

  const onPointerDown = (e: React.PointerEvent, mode: DragMode) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = toImageCoords(e.clientX, e.clientY)
    dragRef.current = { mode, startX: pt.x, startY: pt.y, startCrop: { ...crop } }
    if (mode === 'create') {
      setCrop({ x: pt.x, y: pt.y, w: 1, h: 1 })
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const pt = toImageCoords(e.clientX, e.clientY)
    const dx = pt.x - drag.startX
    const dy = pt.y - drag.startY
    const sc = drag.startCrop

    let next: CropRect

    if (drag.mode === 'move') {
      next = { ...sc, x: sc.x + dx, y: sc.y + dy }
    } else if (drag.mode === 'create') {
      let w = pt.x - sc.x
      let h = pt.y - sc.y
      if (ratio) {
        if (Math.abs(w) / ratio > Math.abs(h)) h = Math.sign(h || 1) * Math.abs(w) / ratio
        else w = Math.sign(w || 1) * Math.abs(h) * ratio
      }
      next = {
        x: w < 0 ? sc.x + w : sc.x,
        y: h < 0 ? sc.y + h : sc.y,
        w: Math.abs(w),
        h: Math.abs(h),
      }
    } else {
      next = { ...sc }
      if (drag.mode.includes('w')) { next.x = sc.x + dx; next.w = sc.w - dx }
      if (drag.mode.includes('e')) next.w = sc.w + dx
      if (drag.mode.includes('n')) { next.y = sc.y + dy; next.h = sc.h - dy }
      if (drag.mode.includes('s')) next.h = sc.h + dy
      if (ratio) {
        next.h = next.w / ratio
        if (drag.mode.includes('n')) next.y = sc.y + sc.h - next.h
      }
    }

    setCrop(clampCrop(next))
  }

  const onPointerUp = () => {
    dragRef.current = null
  }

  const applyCrop = async () => {
    if (!file || crop.w < 1 || crop.h < 1) return
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(crop.w)
    canvas.height = Math.round(crop.h)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(
      bitmap,
      crop.x, crop.y, crop.w, crop.h,
      0, 0, canvas.width, canvas.height
    )
    bitmap.close()

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Crop failed'))),
        file.type || 'image/png'
      )
    })
    setResultBlob(blob)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(blob)
    })
  }

  const applyRatio = (r: number | null) => {
    setRatio(r)
    if (r && crop.w) {
      setCrop(clampCrop({ ...crop, h: crop.w / r }))
    }
  }

  const maxDisplayW = 640
  displayScale.current = imgSize.w > maxDisplayW ? maxDisplayW / imgSize.w : 1
  const displayW = imgSize.w * displayScale.current
  const displayH = imgSize.h * displayScale.current

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone accept="image/*" onFiles={handleFile} label="Drop an image to crop" />

        {file && imgSize.w > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Original" value={`${imgSize.w}×${imgSize.h}`} />
              <StatBox label="Crop area" value={`${Math.round(crop.w)}×${Math.round(crop.h)}`} />
              <StatBox label="Ratio" value={ratio ? RATIO_PRESETS.find((p) => p.ratio === ratio)?.label ?? ratio.toFixed(2) : 'Free'} />
            </div>

            <ToolSection title="Aspect ratio">
              <div className="flex flex-wrap gap-2">
                {RATIO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyRatio(p.ratio)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      ratio === p.ratio
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </ToolSection>

            <ToolSection title="Drag on image to select crop area">
              <div
                ref={containerRef}
                className="relative inline-block max-w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 select-none touch-none"
                style={{ width: displayW, height: displayH }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                <img
                  src={imageUrl}
                  alt=""
                  draggable={false}
                  className="block w-full h-full object-contain pointer-events-none"
                />
                <div
                  className="absolute border-2 border-indigo-400 bg-indigo-500/20 cursor-move"
                  style={{
                    left: crop.x * displayScale.current,
                    top: crop.y * displayScale.current,
                    width: crop.w * displayScale.current,
                    height: crop.h * displayScale.current,
                  }}
                  onPointerDown={(e) => onPointerDown(e, 'move')}
                >
                  {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
                    <div
                      key={corner}
                      className="absolute w-3 h-3 bg-indigo-400 rounded-sm"
                      style={{
                        top: corner.includes('n') ? -4 : undefined,
                        bottom: corner.includes('s') ? -4 : undefined,
                        left: corner.includes('w') ? -4 : undefined,
                        right: corner.includes('e') ? -4 : undefined,
                        cursor: `${corner}-resize`,
                      }}
                      onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, corner) }}
                    />
                  ))}
                </div>
                <div
                  className="absolute inset-0 cursor-crosshair"
                  onPointerDown={(e) => onPointerDown(e, 'create')}
                  style={{ zIndex: crop.w > 10 ? -1 : 1 }}
                />
              </div>
            </ToolSection>

            {resultUrl && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">Cropped preview</p>
                <img src={resultUrl} alt="Cropped" className="rounded-lg border border-zinc-800 max-h-64 object-contain bg-zinc-900/50" />
              </div>
            )}

            <div className="flex gap-2">
              <ToolButton onClick={applyCrop}>Apply crop</ToolButton>
              {resultBlob && (
                <ToolButton
                  variant="secondary"
                  onClick={() =>
                    downloadBlob(resultBlob, file.name.replace(/(\.[^.]+)?$/, `_cropped$1`))
                  }
                >
                  Download
                </ToolButton>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
