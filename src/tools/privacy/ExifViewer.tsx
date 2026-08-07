import { useCallback, useState } from 'react'
import exifr from 'exifr'
import { ToolLayout, ToolSection, CopyButton } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'
import { AlertTriangle, MapPin } from 'lucide-react'

const tool = getToolById('exif-viewer')!

const GPS_KEYS = ['latitude', 'longitude', 'GPSLatitude', 'GPSLongitude', 'GPS']

export default function ExifViewer() {
  const [exifData, setExifData] = useState<Record<string, unknown> | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [hasGps, setHasGps] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0]
    setError(null)
    setFileName(file.name)
    setPreview(URL.createObjectURL(file))

    try {
      const data = await exifr.parse(file, { gps: true, xmp: true, iptc: true })
      if (!data || Object.keys(data).length === 0) {
        setExifData(null)
        setHasGps(false)
        return
      }

      const flat: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data)) {
        if (value instanceof Date) {
          flat[key] = value.toISOString()
        } else if (typeof value === 'object' && value !== null) {
          flat[key] = JSON.stringify(value)
        } else {
          flat[key] = value
        }
      }

      setExifData(flat)
      setHasGps(
        GPS_KEYS.some((k) => k in flat) ||
        Object.keys(flat).some((k) => k.toLowerCase().includes('gps') || k.toLowerCase().includes('location'))
      )
    } catch {
      setError('Could not read EXIF data from this file.')
      setExifData(null)
      setHasGps(false)
    }
  }, [])

  const exifText = exifData
    ? Object.entries(exifData).map(([k, v]) => `${k}: ${v}`).join('\n')
    : ''

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          onFiles={handleFiles}
          accept="image/*"
          label="Drop an image to view EXIF metadata"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        {hasGps && (
          <div className="flex items-start gap-3 rounded-lg border border-red-600/30 bg-red-600/10 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> GPS Location Detected
              </p>
              <p className="text-sm text-red-200/70 mt-1">
                This image contains GPS coordinates that reveal where the photo was taken.
                Remove metadata before sharing publicly.
              </p>
            </div>
          </div>
        )}

        {preview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img src={preview} alt={fileName ?? 'Preview'} className="rounded-lg max-h-64 object-contain mx-auto" />
              <p className="text-xs text-zinc-500 text-center mt-2">{fileName}</p>
            </div>

            <div>
              {exifData ? (
                <ToolSection title={`EXIF Data (${Object.keys(exifData).length} fields)`}>
                  <div className="max-h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(exifData).map(([key, value]) => (
                          <tr key={key} className="border-b border-zinc-800/50">
                            <td className="py-2 px-3 text-zinc-500 font-mono text-xs whitespace-nowrap">
                              {key}
                            </td>
                            <td
                              className={cn(
                                'py-2 px-3 font-mono text-xs break-all',
                                GPS_KEYS.some((g) => key.includes(g)) && 'text-red-400'
                              )}
                            >
                              {String(value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3">
                    <CopyButton text={exifText} label="Copy EXIF" />
                  </div>
                </ToolSection>
              ) : (
                <p className="text-sm text-zinc-500">No EXIF metadata found in this image.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
