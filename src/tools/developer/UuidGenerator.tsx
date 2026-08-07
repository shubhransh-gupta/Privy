import { useCallback, useState } from 'react'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import {
  ToolLayout,
  ToolSection,
  ToolButton,
  CopyButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { downloadBlob, copyToClipboard } from '../../lib/utils'

const tool = getToolById('uuid-generator')!

type Version = 'v4' | 'v7'
type Quantity = 1 | 10 | 100 | 1000

function generateUuids(version: Version, count: number): string[] {
  const gen = version === 'v4' ? uuidv4 : uuidv7
  return Array.from({ length: count }, () => gen())
}

export default function UuidGenerator() {
  const [version, setVersion] = useState<Version>('v4')
  const [quantity, setQuantity] = useState<Quantity>(1)
  const [uuids, setUuids] = useState<string[]>(() => generateUuids('v4', 1))
  const [copied, setCopied] = useState(false)

  const regenerate = useCallback(() => {
    setUuids(generateUuids(version, quantity))
    setCopied(false)
  }, [version, quantity])

  const handleCopyAll = async () => {
    const ok = await copyToClipboard(uuids.join('\n'))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([uuids.join('\n') + '\n'], { type: 'text/plain' })
    downloadBlob(blob, `uuids-${version}-${quantity}.txt`)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <ToolButton variant={version === 'v4' ? 'primary' : 'secondary'} onClick={() => setVersion('v4')}>
            UUID v4 (Random)
          </ToolButton>
          <ToolButton variant={version === 'v7' ? 'primary' : 'secondary'} onClick={() => setVersion('v7')}>
            UUID v7 (Timestamp)
          </ToolButton>
          <div className="h-6 w-px bg-zinc-700 mx-1" />
          {([1, 10, 100, 1000] as Quantity[]).map((q) => (
            <ToolButton
              key={q}
              variant={quantity === q ? 'primary' : 'secondary'}
              onClick={() => setQuantity(q)}
            >
              {q}
            </ToolButton>
          ))}
          <ToolButton variant="primary" onClick={regenerate} className="ml-auto">
            Generate
          </ToolButton>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Version" value={version.toUpperCase()} />
          <StatBox label="Count" value={uuids.length} />
          <StatBox label="Format" value="RFC 4122" />
        </div>

        {version === 'v7' && (
          <p className="text-xs text-zinc-500">
            UUID v7 embeds a Unix timestamp in the first 48 bits, making IDs sortable by creation time.
          </p>
        )}

        <ToolSection title="Generated UUIDs">
          <div className="rounded-lg border border-zinc-700 bg-zinc-900/80 p-4 max-h-80 overflow-auto font-mono text-sm space-y-1">
            {uuids.map((id, i) => (
              <div key={i} className="flex items-center justify-between gap-2 group">
                <span className="text-zinc-300">{id}</span>
                <CopyButton text={id} label="Copy" />
              </div>
            ))}
          </div>
        </ToolSection>

        <div className="flex flex-wrap gap-2">
          <ToolButton variant="secondary" onClick={handleCopyAll}>
            {copied ? '✓ Copied All' : 'Copy All'}
          </ToolButton>
          <ToolButton variant="secondary" onClick={handleDownload}>
            Download .txt
          </ToolButton>
        </div>
      </div>
    </ToolLayout>
  )
}
