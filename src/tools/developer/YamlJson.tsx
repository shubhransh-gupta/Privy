import { useMemo, useState } from 'react'
import { load, dump } from 'js-yaml'
import {
  ToolLayout,
  ToolSection,
  ToolTextarea,
  ToolButton,
  CopyButton,
  StatBox,
} from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'

const tool = getToolById('yaml-json')!

type Direction = 'yaml-to-json' | 'json-to-yaml'

const SAMPLE_YAML = `name: DevToolBoxs
version: 1.0
features:
  - json-formatter
  - jwt-decoder
  - base64
config:
  debug: true
  port: 3000`

const SAMPLE_JSON = `{
  "name": "DevToolBoxs",
  "version": 1.0,
  "features": ["json-formatter", "jwt-decoder"],
  "config": {
    "debug": true,
    "port": 3000
  }
}`

export default function YamlJson() {
  const [input, setInput] = useState(SAMPLE_YAML)
  const [direction, setDirection] = useState<Direction>('yaml-to-json')
  const [indent, setIndent] = useState(2)

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: null }
    try {
      if (direction === 'yaml-to-json') {
        const parsed = load(input)
        return { output: JSON.stringify(parsed, null, indent), error: null, parsed }
      }
      const parsed = JSON.parse(input)
      return { output: dump(parsed, { indent, lineWidth: -1, noRefs: true }), error: null, parsed }
    } catch (e) {
      return { output: '', error: (e as Error).message, parsed: null }
    }
  }, [input, direction, indent])

  const swap = () => {
    if (result.output && !result.error) {
      setInput(result.output)
      setDirection(direction === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json')
    }
  }

  const loadSample = () => {
    setInput(direction === 'yaml-to-json' ? SAMPLE_YAML : SAMPLE_JSON)
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <ToolButton
            variant={direction === 'yaml-to-json' ? 'primary' : 'secondary'}
            onClick={() => {
              setDirection('yaml-to-json')
              setInput(SAMPLE_YAML)
            }}
          >
            YAML → JSON
          </ToolButton>
          <ToolButton
            variant={direction === 'json-to-yaml' ? 'primary' : 'secondary'}
            onClick={() => {
              setDirection('json-to-yaml')
              setInput(SAMPLE_JSON)
            }}
          >
            JSON → YAML
          </ToolButton>
          <ToolButton variant="secondary" onClick={swap}>
            ⇄ Swap
          </ToolButton>
          <ToolButton variant="secondary" onClick={loadSample}>
            Load Sample
          </ToolButton>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-zinc-500">Indent</label>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-lg border border-zinc-700 bg-zinc-900/80 px-2 py-1.5 text-sm text-zinc-200"
            >
              {[2, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <ToolSection title={direction === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}>
          <ToolTextarea
            value={input}
            onChange={setInput}
            rows={10}
            mono
            placeholder={direction === 'yaml-to-json' ? 'Paste YAML...' : 'Paste JSON...'}
          />
        </ToolSection>

        {result.error && (
          <div className="rounded-lg border border-red-600/30 bg-red-600/10 px-4 py-3 text-sm text-red-400">
            Validation error: {result.error}
          </div>
        )}

        {!result.error && result.output && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Status" value="Valid ✓" />
              <StatBox label="Input chars" value={input.length} />
              <StatBox label="Output chars" value={result.output.length} />
            </div>

            <ToolSection title={direction === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}>
              <ToolTextarea value={result.output} onChange={() => {}} rows={10} mono />
              <CopyButton text={result.output} label="Copy Output" />
            </ToolSection>
          </>
        )}
      </div>
    </ToolLayout>
  )
}
