import { useCallback, useState } from 'react'
import CryptoJS from 'crypto-js'
import { ToolLayout, ToolSection, ToolTextarea, ToolButton, CopyButton, StatBox } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { getToolById } from '../../lib/toolRegistry'
import { formatBytes } from '../../lib/utils'
import { cn } from '../../lib/utils'

const tool = getToolById('hash-generator')!

type HashAlgo = 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA-1' | 'MD5'

const ALGOS: HashAlgo[] = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1', 'MD5']

async function hashText(text: string, algo: HashAlgo): Promise<string> {
  if (algo === 'MD5') {
    return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex)
  }

  const webCryptoMap: Partial<Record<HashAlgo, string>> = {
    'SHA-256': 'SHA-256',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
    'SHA-1': 'SHA-1',
  }

  const webAlgo = webCryptoMap[algo]
  if (webAlgo && crypto.subtle) {
    const data = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest(webAlgo, data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Fallback via crypto-js
  const map: Record<string, typeof CryptoJS.SHA256> = {
    'SHA-256': CryptoJS.SHA256,
    'SHA-384': CryptoJS.SHA384,
    'SHA-512': CryptoJS.SHA512,
    'SHA-1': CryptoJS.SHA1,
  }
  return map[algo](text).toString(CryptoJS.enc.Hex)
}

async function hashFile(file: File, algo: HashAlgo, onProgress: (p: number) => void): Promise<string> {
  const buffer = await file.arrayBuffer()
  onProgress(50)

  if (algo === 'MD5') {
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer) as unknown as number[])
    onProgress(100)
    return CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex)
  }

  const webCryptoMap: Partial<Record<HashAlgo, string>> = {
    'SHA-256': 'SHA-256',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
    'SHA-1': 'SHA-1',
  }

  const webAlgo = webCryptoMap[algo]
  if (webAlgo && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest(webAlgo, buffer)
    onProgress(100)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer) as unknown as number[])
  const map: Record<string, typeof CryptoJS.SHA256> = {
    'SHA-256': CryptoJS.SHA256,
    'SHA-384': CryptoJS.SHA384,
    'SHA-512': CryptoJS.SHA512,
    'SHA-1': CryptoJS.SHA1,
  }
  onProgress(100)
  return map[algo](wordArray).toString(CryptoJS.enc.Hex)
}

export default function HashGenerator() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [text, setText] = useState('')
  const [algo, setAlgo] = useState<HashAlgo>('SHA-256')
  const [hash, setHash] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState(0)
  const [progress, setProgress] = useState(0)
  const [computing, setComputing] = useState(false)

  const computeTextHash = useCallback(async () => {
    setComputing(true)
    const result = await hashText(text, algo)
    setHash(result)
    setComputing(false)
  }, [text, algo])

  const handleFile = useCallback(
    async (files: File[]) => {
      const file = files[0]
      setFileName(file.name)
      setFileSize(file.size)
      setComputing(true)
      setProgress(0)
      const result = await hashFile(file, algo, setProgress)
      setHash(result)
      setComputing(false)
    },
    [algo]
  )

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-2">
          {(['text', 'file'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-all',
                mode === m
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              )}
            >
              {m === 'text' ? 'Text Hash' : 'File Hash'}
            </button>
          ))}
        </div>

        <ToolSection title="Algorithm">
          <div className="flex flex-wrap gap-2">
            {ALGOS.map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  algo === a
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </ToolSection>

        {mode === 'text' ? (
          <>
            <ToolTextarea
              value={text}
              onChange={setText}
              placeholder="Enter text to hash..."
              rows={4}
            />
            <ToolButton onClick={computeTextHash} disabled={computing || !text}>
              Compute Hash
            </ToolButton>
          </>
        ) : (
          <>
            <FileDropzone onFiles={handleFile} label="Drop a file to hash" />
            {fileName && <StatBox label="File" value={`${fileName} (${formatBytes(fileSize)})`} />}
            {computing && <ProgressBar progress={progress} label="Hashing file..." />}
          </>
        )}

        {hash && (
          <ToolSection title="Hash Output">
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4 font-mono text-sm break-all">
              {hash}
            </div>
            <div className="flex gap-2 mt-3">
              <CopyButton text={hash} />
              <StatBox label="Length" value={`${hash.length} chars`} />
            </div>
          </ToolSection>
        )}
      </div>
    </ToolLayout>
  )
}
