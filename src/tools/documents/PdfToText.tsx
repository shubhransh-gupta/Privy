import { useCallback, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { getToolById } from '../../lib/toolRegistry'
import {
  ToolLayout,
  ToolButton,
  StatBox,
  CopyButton,
  ToolSection,
  ToolTextarea,
} from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { downloadBlob, formatBytes } from '../../lib/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const tool = getToolById('pdf-to-text')!

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function PdfToText() {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const extractText = useCallback(async (file: File) => {
    setLoading(true)
    setError('')
    setText('')
    setProgress(0)
    setFileName(file.name)
    setFileSize(file.size)

    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const numPages = pdf.numPages
      setPages(numPages)

      const parts: string[] = []
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
        parts.push(`--- Page ${i} ---\n${pageText}`)
        setProgress((i / numPages) * 100)
      }

      setText(parts.join('\n\n'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract text from PDF')
    } finally {
      setLoading(false)
      setProgress(100)
    }
  }, [])

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const base = fileName.replace(/\.pdf$/i, '') || 'extracted'
    downloadBlob(blob, `${base}.txt`)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          accept=".pdf,application/pdf"
          onFiles={(files) => extractText(files[0])}
          label="Drop a PDF file to extract text"
        />

        {loading && (
          <ProgressBar progress={progress} label="Extracting text…" />
        )}

        {error && (
          <p className="text-sm text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
            {error}
          </p>
        )}

        {text && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Pages" value={pages} />
              <StatBox label="Characters" value={text.length.toLocaleString()} />
              <StatBox label="Words" value={countWords(text).toLocaleString()} />
              <StatBox label="File size" value={formatBytes(fileSize)} />
            </div>

            <ToolSection title="Extracted text">
              <ToolTextarea
                value={text}
                onChange={setText}
                rows={16}
                mono
                className="font-mono text-xs"
              />
            </ToolSection>

            <div className="flex flex-wrap gap-2">
              <CopyButton text={text} label="Copy text" />
              <ToolButton onClick={handleDownload}>Download .txt</ToolButton>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
