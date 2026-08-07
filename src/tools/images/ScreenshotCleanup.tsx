import { useCallback, useEffect, useState } from 'react'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { downloadBlob, formatBytes } from '../../lib/utils'

const tool = getToolById('screenshot-cleanup')!

interface Bounds {
  left: number
  top: number
  right: number
  bottom: number
}

function isBackgroundPixel(r: number, g: number, b: number, a: number, threshold: number): boolean {
  if (a < 10) return true
  return r >= threshold && g >= threshold && b >= threshold
}

function findContentBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  padding: number
): Bounds | null {
  let left = width
  let top = height
  let right = 0
  let bottom = 0
  let found = false

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (!isBackgroundPixel(data[i], data[i + 1], data[i + 2], data[i + 3], threshold)) {
        found = true
        left = Math.min(left, x)
        right = Math.max(right, x)
        top = Math.min(top, y)
        bottom = Math.max(bottom, y)
      }
    }
  }

  if (!found) return null

  return {
    left: Math.max(0, left - padding),
    top: Math.max(0, top - padding),
    right: Math.min(width - 1, right + padding),
    bottom: Math.min(height - 1, bottom + padding),
  }
}

export default function ScreenshotCleanup() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 })
  const [croppedSize, setCroppedSize] = useState({ w: 0, h: 0 })
  const [originalBytes, setOriginalBytes] = useState(0)
  const [resultBytes, setResultBytes] = useState(0)
  const [threshold, setThreshold] = useState(245)
  const [padding, setPadding] = useState(0)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [processing, setProcessing] = useState(false)

  const process = useCallback(
    async (f: File, thresh: number, pad: number) => {
      setProcessing(true)
      try {
        const bitmap = await createImageBitmap(f)
        setOriginalSize({ w: bitmap.width, h: bitmap.height })

        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(bitmap, 0, 0)
        bitmap.close()

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const detected = findContentBounds(
          imageData.data,
          canvas.width,
          canvas.height,
          thresh,
          pad
        )

        if (!detected) {
          setBounds(null)
          setResultBlob(null)
          setResultUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return ''
          })
          return
        }

        setBounds(detected)
        const cropW = detected.right - detected.left + 1
        const cropH = detected.bottom - detected.top + 1
        setCroppedSize({ w: cropW, h: cropH })

        const out = document.createElement('canvas')
        out.width = cropW
        out.height = cropH
        const octx = out.getContext('2d')!
        octx.drawImage(
          canvas,
          detected.left,
          detected.top,
          cropW,
          cropH,
          0,
          0,
          cropW,
          cropH
        )

        const blob = await new Promise<Blob>((resolve, reject) => {
          out.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Crop failed'))),
            f.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'
          )
        })

        setResultBlob(blob)
        setResultBytes(blob.size)
        setResultUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(blob)
        })
      } finally {
        setProcessing(false)
      }
    },
    []
  )

  const handleFile = useCallback(
    async (files: File[]) => {
      const f = files[0]
      setFile(f)
      setOriginalBytes(f.size)
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(f)
      })
      await process(f, threshold, padding)
    },
    [process, threshold, padding]
  )

  useEffect(() => {
    if (file) process(file, threshold, padding)
  }, [file, threshold, padding, process])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [previewUrl, resultUrl])

  const pixelsRemoved =
    originalSize.w && croppedSize.w
      ? originalSize.w * originalSize.h - croppedSize.w * croppedSize.h
      : 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          onFiles={handleFile}
          label="Drop a screenshot to auto-crop whitespace"
        />

        {file && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Original" value={`${originalSize.w}×${originalSize.h}`} />
              <StatBox label="Cropped" value={croppedSize.w ? `${croppedSize.w}×${croppedSize.h}` : '—'} />
              <StatBox label="Pixels trimmed" value={pixelsRemoved > 0 ? pixelsRemoved.toLocaleString() : '—'} />
              <StatBox label="File size" value={resultBytes ? formatBytes(resultBytes) : formatBytes(originalBytes)} />
            </div>

            <ToolSection title={`Whitespace threshold: ${threshold} (higher = stricter)`}>
              <input
                type="range"
                min={200}
                max={255}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </ToolSection>

            <ToolSection title={`Padding: ${padding}px`}>
              <input
                type="range"
                min={0}
                max={50}
                value={padding}
                onChange={(e) => setPadding(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500"
              />
            </ToolSection>

            {bounds && (
              <p className="text-sm text-zinc-500">
                Detected content bounds: left {bounds.left}, top {bounds.top}, right {bounds.right}, bottom {bounds.bottom}
              </p>
            )}

            {!bounds && !processing && (
              <p className="text-sm text-amber-400/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                No non-white content detected. Try lowering the threshold.
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {previewUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Original</p>
                  <img src={previewUrl} alt="Original" className="rounded-lg border border-zinc-800 max-h-64 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
              {resultUrl && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Cleaned</p>
                  <img src={resultUrl} alt="Cleaned" className="rounded-lg border border-zinc-800 max-h-64 w-full object-contain bg-zinc-900/50" />
                </div>
              )}
            </div>

            {resultBlob && (
              <ToolButton
                onClick={() =>
                  downloadBlob(resultBlob, file.name.replace(/(\.[^.]+)?$/, '_cleaned$1'))
                }
                disabled={processing}
              >
                Download cleaned screenshot
              </ToolButton>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  )
}
