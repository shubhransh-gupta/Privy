import { useState, useCallback, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSuggestedToolsForFile } from '../lib/toolRegistry'
export function FileDropOverlay() {
  const [visible, setVisible] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()

  const handleDragEnter = useCallback((e: DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setVisible(true)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setVisible(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    if (e.relatedTarget === null) setVisible(false)
  }, [])

  const suggestions = file ? getSuggestedToolsForFile(file) : []

  return (
    <>
      <div
        className="fixed inset-0 z-30 pointer-events-none"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {visible && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none">
          <div className="rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-500/10 px-16 py-12 text-center">
            <p className="text-xl font-medium text-indigo-300">Drop your file here</p>
            <p className="text-sm text-zinc-400 mt-2">We'll suggest the right tools</p>
          </div>
        </div>
      )}

      {file && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setFile(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md glass-card p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-1">What do you want to do?</h3>
            <p className="text-sm text-zinc-500 mb-4">{file.name}</p>
            <div className="space-y-2">
              {suggestions.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => { navigate(tool.route); setFile(null) }}
                  className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors"
                >
                  <span>{tool.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-zinc-500">{tool.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setFile(null)}
              className="mt-4 w-full text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
