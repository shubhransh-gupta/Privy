import { useCallback, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, ToolButton } from '../../components/ToolLayout'
import { FileDropzone } from '../../components/FileDropzone'
import { ProgressBar } from '../../components/ProgressBar'
import { getToolById } from '../../lib/toolRegistry'
import { downloadBlob, formatBytes } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { Lock, Unlock } from 'lucide-react'

const tool = getToolById('file-encryption')!

const SALT_LENGTH = 16
const IV_LENGTH = 12
const PBKDF2_ITERATIONS = 100000

async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptFile(file: File, password: string): Promise<Blob> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt.buffer)
  const data = await file.arrayBuffer()
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + encrypted.byteLength)
  combined.set(salt, 0)
  combined.set(iv, SALT_LENGTH)
  combined.set(new Uint8Array(encrypted), SALT_LENGTH + IV_LENGTH)

  return new Blob([combined], { type: 'application/octet-stream' })
}

async function decryptFile(encryptedBlob: Blob, password: string): Promise<Blob> {
  const buffer = await encryptedBlob.arrayBuffer()
  const data = new Uint8Array(buffer)

  if (data.length < SALT_LENGTH + IV_LENGTH + 16) {
    throw new Error('Invalid encrypted file')
  }

  const salt = data.slice(0, SALT_LENGTH)
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(password, salt.buffer)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new Blob([decrypted])
}

export default function FileEncryption() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0])
    setResult(null)
    setError(null)
  }, [])

  const process = useCallback(async () => {
    if (!file || !password) return
    if (mode === 'encrypt' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setProcessing(true)
    setProgress(30)
    setError(null)

    try {
      if (mode === 'encrypt') {
        setProgress(60)
        const blob = await encryptFile(file, password)
        setProgress(100)
        setResult({ blob, name: file.name + '.enc' })
      } else {
        setProgress(60)
        const blob = await decryptFile(file, password)
        setProgress(100)
        const name = file.name.replace(/\.enc$/, '') || 'decrypted.bin'
        setResult({ blob, name })
      }
    } catch {
      setError(mode === 'decrypt' ? 'Decryption failed. Wrong password or invalid file.' : 'Encryption failed.')
    }
    setProcessing(false)
  }, [file, password, confirmPassword, mode])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-2">
          {(['encrypt', 'decrypt'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setError(null) }}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2',
                mode === m
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              )}
            >
              {m === 'encrypt' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              {m === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-400">
          AES-256-GCM encryption with PBKDF2 key derivation ({PBKDF2_ITERATIONS.toLocaleString()} iterations).
          All processing is local in your browser.
        </p>

        <FileDropzone
          onFiles={handleFiles}
          label={mode === 'encrypt' ? 'Drop file to encrypt' : 'Drop .enc file to decrypt'}
        />

        {file && (
          <p className="text-sm text-zinc-400">
            Selected: {file.name} ({formatBytes(file.size)})
          </p>
        )}

        <ToolSection title="Password">
          <div className="space-y-3">
            <ToolInput
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="Enter password"
            />
            {mode === 'encrypt' && (
              <ToolInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                type="password"
                placeholder="Confirm password"
              />
            )}
          </div>
        </ToolSection>

        <ToolButton
          onClick={process}
          disabled={!file || !password || processing || (mode === 'encrypt' && !confirmPassword)}
        >
          {mode === 'encrypt' ? 'Encrypt File' : 'Decrypt File'}
        </ToolButton>

        {processing && <ProgressBar progress={progress} label={mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...'} />}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {result && (
          <div className="rounded-lg border border-green-600/30 bg-green-600/10 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-300">
                {mode === 'encrypt' ? 'File encrypted successfully' : 'File decrypted successfully'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">{result.name} ({formatBytes(result.blob.size)})</p>
            </div>
            <ToolButton
              variant="secondary"
              onClick={() => downloadBlob(result.blob, result.name)}
            >
              Download
            </ToolButton>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
