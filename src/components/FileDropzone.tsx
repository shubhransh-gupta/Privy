import { useCallback, useState, type DragEvent, type ReactNode } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '../lib/utils'

interface FileDropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  className?: string
  children?: ReactNode
  label?: string
}

export function FileDropzone({
  onFiles,
  accept,
  multiple = false,
  className,
  children,
  label = 'Drop files here or click to browse',
}: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length) onFiles(multiple ? files : [files[0]])
    },
    [onFiles, multiple]
  )

  return (
    <label
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all min-h-[160px]',
        dragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-900/80',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(multiple ? files : [files[0]])
          e.target.value = ''
        }}
      />
      {children ?? (
        <>
          <Upload className="h-8 w-8 text-zinc-500" />
          <p className="text-sm text-zinc-400 text-center">{label}</p>
        </>
      )}
    </label>
  )
}
