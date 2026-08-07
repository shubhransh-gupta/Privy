import { useCallback, useState } from 'react'
import { ToolLayout, ToolSection, StatBox } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { getToolById } from '../../lib/toolRegistry'
import { formatBytes } from '../../lib/utils'
import { Copy, Files } from 'lucide-react'

const tool = getToolById('duplicate-detector')!

interface FileHash {
  name: string
  size: number
  hash: string
}

interface DuplicateGroup {
  hash: string
  files: FileHash[]
  wastedBytes: number
}

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function DuplicateDetector() {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [groups, setGroups] = useState<DuplicateGroup[]>([])
  const [totalFiles, setTotalFiles] = useState(0)
  const [totalSavings, setTotalSavings] = useState(0)

  const handleFiles = useCallback(async (files: File[]) => {
    setScanning(true)
    setProgress(0)
    setGroups([])
    setTotalFiles(files.length)

    const hashMap = new Map<string, FileHash[]>()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const hash = await hashFile(file)
      const entry: FileHash = { name: file.name, size: file.size, hash }

      if (!hashMap.has(hash)) hashMap.set(hash, [])
      hashMap.get(hash)!.push(entry)
      setProgress(((i + 1) / files.length) * 100)
    }

    const duplicates: DuplicateGroup[] = []
    let savings = 0

    for (const [hash, fileList] of hashMap) {
      if (fileList.length > 1) {
        const wasted = fileList.slice(1).reduce((sum, f) => sum + f.size, 0)
        savings += wasted
        duplicates.push({ hash, files: fileList, wastedBytes: wasted })
      }
    }

    duplicates.sort((a, b) => b.wastedBytes - a.wastedBytes)
    setGroups(duplicates)
    setTotalSavings(savings)
    setScanning(false)
  }, [])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <p className="text-sm text-zinc-400">
          Compare files by SHA-256 hash to find exact duplicates. All hashing happens locally.
        </p>

        <FileDropzone
          onFiles={handleFiles}
          multiple
          label="Drop multiple files to scan for duplicates"
        />

        {scanning && <ProgressBar progress={progress} label="Hashing files..." />}

        {totalFiles > 0 && !scanning && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatBox label="Files Scanned" value={totalFiles} />
            <StatBox label="Duplicate Groups" value={groups.length} />
            <StatBox label="Potential Savings" value={formatBytes(totalSavings)} />
          </div>
        )}

        {groups.length > 0 && (
          <ToolSection title="Duplicate Groups">
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.hash}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Files className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium">{group.files.length} identical files</span>
                    </div>
                    <span className="text-xs text-amber-400">
                      Save {formatBytes(group.wastedBytes)}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {group.files.map((f, i) => (
                      <li key={i} className="flex justify-between text-sm text-zinc-400">
                        <span className="truncate mr-4">{f.name}</span>
                        <span className="shrink-0">{formatBytes(f.size)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-zinc-600 font-mono mt-2 truncate" title={group.hash}>
                    <Copy className="h-3 w-3 inline mr-1" />
                    {group.hash.slice(0, 16)}...
                  </p>
                </div>
              ))}
            </div>
          </ToolSection>
        )}

        {totalFiles > 0 && !scanning && groups.length === 0 && (
          <p className="text-sm text-green-400 text-center py-4">No duplicate files found.</p>
        )}
      </div>
    </ToolLayout>
  )
}
