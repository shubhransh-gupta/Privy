import { useCallback, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { getToolById } from '../../lib/toolRegistry'
import { ToolLayout, ToolButton, StatBox, ToolSection } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { downloadBlob, formatBytes } from '../../lib/utils'

const tool = getToolById('pdf-compress')!

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [compressedSize, setCompressedSize] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const compress = useCallback(async (files: File[]) => {
    const f = files[0]
    setFile(f)
    setOriginalSize(f.size)
    setCompressedBlob(null)
    setError('')
    setCompressing(true)
    setProgress(10)

    try {
      const buffer = await f.arrayBuffer()
      setProgress(30)

      const src = await PDFDocument.load(buffer)
      setPageCount(src.getPageCount())
      setProgress(50)

      // Re-save via pdf-lib strips unused objects and may reduce size slightly.
      // Browser-based tools cannot recompress embedded images like desktop apps.
      const doc = await PDFDocument.create()
      const pages = await doc.copyPages(src, src.getPageIndices())
      pages.forEach((p) => doc.addPage(p))
      setProgress(80)

      const bytes = await doc.save({ useObjectStreams: true })
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
      setCompressedBlob(blob)
      setCompressedSize(blob.size)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compress PDF')
    } finally {
      setCompressing(false)
    }
  }, [])

  const savings = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100) : 0

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          <strong className="text-amber-300">Browser limitation:</strong> This tool re-saves the PDF
          structure locally, which may trim unused metadata. It cannot recompress embedded images
          or fonts the way desktop tools (Ghostscript, Adobe) do. Image-heavy PDFs may see little
          or no size reduction.
        </div>

        <FileDropzone
          accept=".pdf,application/pdf"
          onFiles={compress}
          label="Drop a PDF to compress"
        />

        {compressing && <ProgressBar progress={progress} label="Processing…" />}

        {file && !compressing && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Original" value={formatBytes(originalSize)} />
              <StatBox
                label="Compressed"
                value={compressedBlob ? formatBytes(compressedSize) : '—'}
              />
              <StatBox
                label="Saved"
                value={
                  compressedBlob
                    ? savings > 0
                      ? `${savings.toFixed(1)}%`
                      : savings < 0
                        ? `+${Math.abs(savings).toFixed(1)}%`
                        : '0%'
                    : '—'
                }
              />
              <StatBox label="Pages" value={pageCount} />
            </div>

            {compressedBlob && (
              <ToolSection>
                <p className="text-sm text-zinc-400 mb-3">
                  {savings > 0
                    ? `Reduced by ${formatBytes(originalSize - compressedSize)}.`
                    : savings < 0
                      ? 'Output is slightly larger — common when re-encoding structure without image compression.'
                      : 'Size unchanged — embedded content dominates file size.'}
                </p>
                <ToolButton
                  onClick={() =>
                    downloadBlob(
                      compressedBlob,
                      file.name.replace(/\.pdf$/i, '') + '_compressed.pdf'
                    )
                  }
                >
                  Download compressed PDF
                </ToolButton>
              </ToolSection>
            )}
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
