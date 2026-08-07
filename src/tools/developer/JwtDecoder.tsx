import { useMemo, useState } from 'react'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  CopyButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'

const tool = getToolById('jwt-decoder')!

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) base64 += '='.repeat(4 - pad)
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

function decodePart(part: string): { json: string; error?: string } {
  try {
    const decoded = base64UrlDecode(part)
    const parsed = JSON.parse(decoded)
    return { json: JSON.stringify(parsed, null, 2) }
  } catch (e) {
    return { json: '', error: (e as Error).message }
  }
}

function getExpirationStatus(exp?: number): { label: string; color: string } | null {
  if (exp === undefined) return null
  const now = Math.floor(Date.now() / 1000)
  const date = new Date(exp * 1000)
  if (exp < now) return { label: `Expired ${date.toLocaleString()}`, color: 'text-red-400' }
  const diff = exp - now
  if (diff < 3600) return { label: `Expires soon: ${date.toLocaleString()}`, color: 'text-amber-400' }
  return { label: `Valid until ${date.toLocaleString()}`, color: 'text-green-400' }
}

export default function JwtDecoder() {
  const [token, setToken] = useState('')

  const decoded = useMemo(() => {
    const trimmed = token.trim()
    if (!trimmed) return null

    const parts = trimmed.split('.')
    if (parts.length !== 3) {
      return { error: 'JWT must have exactly 3 parts separated by dots (header.payload.signature)' }
    }

    const [headerPart, payloadPart, signature] = parts
    const header = decodePart(headerPart)
    const payload = decodePart(payloadPart)

    if (header.error || payload.error) {
      return { error: header.error || payload.error }
    }

    let exp: number | undefined
    try {
      exp = JSON.parse(payload.json).exp as number | undefined
    } catch {
      /* ignore */
    }

    return {
      header: header.json,
      payload: payload.json,
      signature,
      expStatus: getExpirationStatus(exp),
      parts: 3,
    }
  }, [token])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-600/30 bg-amber-600/10 px-4 py-3 text-sm text-amber-300">
          ⚠️ This tool decodes JWTs locally for inspection only. It does <strong>not</strong> verify signatures.
          Never trust decoded content from untrusted tokens without proper cryptographic verification.
        </div>

        <ToolSection title="JWT Token">
          <ToolTextarea
            value={token}
            onChange={setToken}
            rows={4}
            mono
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
        </ToolSection>

        {decoded && 'error' in decoded && (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            {decoded.error}
          </div>
        )}

        {decoded && !('error' in decoded) && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Parts" value={decoded.parts} />
              <StatBox
                label="Expiration"
                value={decoded.expStatus?.label ?? 'No exp claim'}
              />
            </div>

            {decoded.expStatus && (
              <p className={cn('text-sm font-medium', decoded.expStatus.color)}>{decoded.expStatus.label}</p>
            )}

            <ToolSection title="Header">
              <ToolTextarea value={decoded.header} onChange={() => {}} rows={6} mono />
              <CopyButton text={decoded.header} label="Copy Header" />
            </ToolSection>

            <ToolSection title="Payload">
              <ToolTextarea value={decoded.payload} onChange={() => {}} rows={10} mono />
              <CopyButton text={decoded.payload} label="Copy Payload" />
            </ToolSection>

            <ToolSection title="Signature (encoded, not verified)">
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 font-mono text-xs text-zinc-400 break-all">
                {decoded.signature}
              </div>
            </ToolSection>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
