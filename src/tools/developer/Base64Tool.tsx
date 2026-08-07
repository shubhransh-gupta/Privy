import { useMemo, useState } from 'react'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  ToolButton,
  CopyButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'

const tool = getToolById('base64')!

type Mode = 'encode' | 'decode'
type Encoding = 'utf8' | 'urlsafe'

function encodeBase64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  let encoded = btoa(binary)
  if (urlSafe) encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return encoded
}

function decodeBase64(input: string, urlSafe: boolean): { result: string; error?: string } {
  try {
    let str = input.trim()
    if (urlSafe) {
      str = str.replace(/-/g, '+').replace(/_/g, '/')
      const pad = str.length % 4
      if (pad) str += '='.repeat(4 - pad)
    }
    const binary = atob(str)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return { result: new TextDecoder('utf-8').decode(bytes) }
  } catch (e) {
    return { result: '', error: (e as Error).message }
  }
}

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<Mode>('encode')
  const [encoding, setEncoding] = useState<Encoding>('utf8')

  const output = useMemo(() => {
    if (!input.trim()) return { text: '', error: null }
    if (mode === 'encode') {
      return { text: encodeBase64(input, encoding === 'urlsafe'), error: null }
    }
    const decoded = decodeBase64(input, encoding === 'urlsafe')
    return { text: decoded.result, error: decoded.error ?? null }
  }, [input, mode, encoding])

  const swap = () => {
    if (output.text && !output.error) {
      setInput(output.text)
      setMode(mode === 'encode' ? 'decode' : 'encode')
    }
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <ToolButton variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>
            Encode
          </ToolButton>
          <ToolButton variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>
            Decode
          </ToolButton>
          <ToolButton variant={encoding === 'utf8' ? 'primary' : 'secondary'} onClick={() => setEncoding('utf8')}>
            UTF-8
          </ToolButton>
          <ToolButton variant={encoding === 'urlsafe' ? 'primary' : 'secondary'} onClick={() => setEncoding('urlsafe')}>
            URL-Safe
          </ToolButton>
          <ToolButton variant="secondary" onClick={swap}>
            ⇄ Swap
          </ToolButton>
        </div>

        <ToolSection title={mode === 'encode' ? 'Plain Text' : 'Base64 Input'}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            rows={6}
            mono={mode === 'decode'}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
          />
        </ToolSection>

        {output.error && (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            Decode error: {output.error}
          </div>
        )}

        {!output.error && output.text && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Input length" value={input.length} />
              <StatBox label="Output length" value={output.text.length} />
            </div>

            <ToolSection title={mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}>
              <ToolTextarea value={output.text} onChange={() => {}} rows={6} mono />
              <CopyButton text={output.text} />
            </ToolSection>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
