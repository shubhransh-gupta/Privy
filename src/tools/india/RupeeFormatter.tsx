import { useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, StatBox, CopyButton } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import {
  formatIndianCurrency,
  formatIndianNumber,
  formatIndianCompact,
  parseIndianNumber,
} from '../../lib/utils'

const tool = getToolById('rupee-formatter')!

export default function RupeeFormatter() {
  const [input, setInput] = useState('10000000')

  const num = parseIndianNumber(input)

  const formatted = useMemo(() => {
    if (isNaN(num)) return { standard: '—', currency: '—', compact: '—', words: '—' }
    return {
      standard: formatIndianNumber(num),
      currency: formatIndianCurrency(num),
      compact: formatIndianCompact(num),
      words: numberToIndianWords(num),
    }
  }, [num])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Enter Number">
          <ToolInput
            value={input}
            onChange={setInput}
            placeholder="e.g. 1,00,00,000 or 10000000"
          />
        </ToolSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatBox label="Indian Number Format" value={formatted.standard} />
          <StatBox label="Currency Format" value={formatted.currency} />
          <StatBox label="Compact Format" value={formatted.compact} />
          <StatBox label="In Words" value={formatted.words} />
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyButton text={formatted.standard} label="Copy Number" />
          <CopyButton text={formatted.currency} label="Copy Currency" />
          <CopyButton text={formatted.compact} label="Copy Compact" />
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400 space-y-1">
          <p className="font-medium text-zinc-300">Indian Numbering System</p>
          <p>1,000 = One Thousand</p>
          <p>1,00,000 = One Lakh</p>
          <p>1,00,00,000 = One Crore</p>
        </div>
      </div>
    </ToolLayout>
  )
}

function numberToIndianWords(n: number): string {
  if (n === 0) return 'Zero'
  if (n < 0) return `Minus ${numberToIndianWords(-n)}`
  if (!Number.isFinite(n)) return '—'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function twoDigits(num: number): string {
    if (num < 20) return ones[num]
    return `${tens[Math.floor(num / 10)]}${num % 10 ? ' ' + ones[num % 10] : ''}`.trim()
  }

  function threeDigits(num: number): string {
    if (num >= 100) {
      return `${ones[Math.floor(num / 100)]} Hundred${num % 100 ? ' ' + twoDigits(num % 100) : ''}`
    }
    return twoDigits(num)
  }

  const intPart = Math.floor(Math.abs(n))
  let remaining = intPart
  const parts: string[] = []

  if (remaining >= 1e7) {
    parts.push(`${threeDigits(Math.floor(remaining / 1e7))} Crore`)
    remaining %= 1e7
  }
  if (remaining >= 1e5) {
    parts.push(`${threeDigits(Math.floor(remaining / 1e5))} Lakh`)
    remaining %= 1e5
  }
  if (remaining >= 1e3) {
    parts.push(`${threeDigits(Math.floor(remaining / 1e3))} Thousand`)
    remaining %= 1e3
  }
  if (remaining > 0) {
    parts.push(threeDigits(remaining))
  }

  const decimal = Math.round((Math.abs(n) - intPart) * 100)
  let result = parts.join(' ')
  if (decimal > 0) result += ` and ${twoDigits(decimal)} Paise`
  return result + ' Rupees'
}
