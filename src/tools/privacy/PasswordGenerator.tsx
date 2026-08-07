import { useCallback, useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, ToolButton, StatBox, CopyButton } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'
import { RefreshCw } from 'lucide-react'

const tool = getToolById('password-generator')!

const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
}

function estimateEntropy(length: number, poolSize: number): number {
  if (poolSize <= 0 || length <= 0) return 0
  return Math.round(length * Math.log2(poolSize))
}

function strengthLabel(bits: number): { label: string; color: string } {
  if (bits >= 128) return { label: 'Very Strong', color: 'text-green-400' }
  if (bits >= 80) return { label: 'Strong', color: 'text-green-400' }
  if (bits >= 60) return { label: 'Good', color: 'text-yellow-400' }
  if (bits >= 40) return { label: 'Fair', color: 'text-orange-400' }
  return { label: 'Weak', color: 'text-red-400' }
}

export default function PasswordGenerator() {
  const [length, setLength] = useState('16')
  const [useLower, setUseLower] = useState(true)
  const [useUpper, setUseUpper] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [password, setPassword] = useState('')

  const pool = useMemo(() => {
    let chars = ''
    if (useLower) chars += CHAR_SETS.lowercase
    if (useUpper) chars += CHAR_SETS.uppercase
    if (useNumbers) chars += CHAR_SETS.numbers
    if (useSymbols) chars += CHAR_SETS.symbols
    return chars
  }, [useLower, useUpper, useNumbers, useSymbols])

  const generate = useCallback(() => {
    const len = Math.max(4, Math.min(128, parseInt(length, 10) || 16))
    if (!pool) return

    const array = new Uint32Array(len)
    crypto.getRandomValues(array)
    let result = ''
    for (let i = 0; i < len; i++) {
      result += pool[array[i] % pool.length]
    }
    setPassword(result)
  }, [length, pool])

  const entropy = estimateEntropy(parseInt(length, 10) || 16, pool.length)
  const strength = strengthLabel(entropy)

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-3 font-mono text-lg break-all min-h-[52px]">
            {password || <span className="text-zinc-600">Click generate</span>}
          </div>
          <ToolButton onClick={generate} className="shrink-0">
            <RefreshCw className="h-4 w-4 inline mr-1" /> Generate
          </ToolButton>
        </div>

        {password && (
          <div className="flex gap-2">
            <CopyButton text={password} />
          </div>
        )}

        <ToolInput
          label="Length"
          value={length}
          onChange={setLength}
          type="number"
        />

        <ToolSection title="Character Sets">
          <div className="grid grid-cols-2 gap-3">
            {([
              ['Lowercase (a-z)', useLower, setUseLower],
              ['Uppercase (A-Z)', useUpper, setUseUpper],
              ['Numbers (0-9)', useNumbers, setUseNumbers],
              ['Symbols (!@#...)', useSymbols, setUseSymbols],
            ] as const).map(([label, checked, setter]) => (
              <label
                key={label}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                  checked ? 'border-indigo-600/50 bg-indigo-600/10' : 'border-zinc-800 bg-zinc-900/50'
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setter(e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-900 text-indigo-600"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </ToolSection>

        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Entropy" value={`${entropy} bits`} />
          <StatBox label="Strength" value={strength.label} />
        </div>

        <p className="text-xs text-zinc-500">
          Passwords are generated using crypto.getRandomValues() — never sent to any server.
        </p>
      </div>
    </ToolLayout>
  )
}
