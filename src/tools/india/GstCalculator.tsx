import { useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { formatIndianCurrency, parseIndianNumber } from '../../lib/utils'
import { cn } from '../../lib/utils'

const tool = getToolById('gst-calculator')!
const GST_RATES = [0, 5, 12, 18, 28] as const

export default function GstCalculator() {
  const [amount, setAmount] = useState('10000')
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [rate, setRate] = useState<number>(18)
  const [customRate, setCustomRate] = useState('18')
  const [useCustom, setUseCustom] = useState(false)

  const effectiveRate = useCustom ? parseFloat(customRate) || 0 : rate
  const baseAmount = parseIndianNumber(amount)

  const result = useMemo(() => {
    if (baseAmount <= 0 || effectiveRate < 0) {
      return { base: 0, gst: 0, total: 0 }
    }
    if (mode === 'add') {
      const gst = (baseAmount * effectiveRate) / 100
      return { base: baseAmount, gst, total: baseAmount + gst }
    }
    const base = baseAmount / (1 + effectiveRate / 100)
    const gst = baseAmount - base
    return { base, gst, total: baseAmount }
  }, [baseAmount, effectiveRate, mode])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-2">
          {(['add', 'remove'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                mode === m
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              )}
            >
              {m === 'add' ? 'Add GST' : 'Remove GST'}
            </button>
          ))}
        </div>

        <ToolSection title={mode === 'add' ? 'Amount (excluding GST)' : 'Amount (including GST)'}>
          <ToolInput
            value={amount}
            onChange={setAmount}
            placeholder="Enter amount"
            type="text"
          />
        </ToolSection>

        <ToolSection title="GST Rate">
          <div className="flex flex-wrap gap-2 mb-3">
            {GST_RATES.map((r) => (
              <button
                key={r}
                onClick={() => { setRate(r); setUseCustom(false) }}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                  !useCustom && rate === r
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                )}
              >
                {r}%
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                useCustom
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              )}
            >
              Custom
            </button>
          </div>
          {useCustom && (
            <ToolInput
              label="Custom rate (%)"
              value={customRate}
              onChange={setCustomRate}
              type="number"
            />
          )}
        </ToolSection>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="Base Amount" value={formatIndianCurrency(result.base)} />
          <StatBox label={`GST (${effectiveRate}%)`} value={formatIndianCurrency(result.gst)} />
          <StatBox label="Total Amount" value={formatIndianCurrency(result.total)} />
        </div>

        <p className="text-xs text-zinc-500">
          CGST and SGST are each half of the total GST rate for intra-state supplies. IGST applies for inter-state.
        </p>
      </div>
    </ToolLayout>
  )
}
