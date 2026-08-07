import { useMemo, useState } from 'react'
import { ToolLayout, ToolInput, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { cn } from '../../lib/utils'

const tool = getToolById('date-calculator')!

type Mode = 'diff' | 'add' | 'subtract'

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let remaining = Math.abs(days)
  const direction = days >= 0 ? 1 : -1

  while (remaining > 0) {
    result.setDate(result.getDate() + direction)
    const day = result.getDay()
    if (day !== 0 && day !== 6) remaining--
  }
  return result
}

function countBusinessDays(start: Date, end: Date): number {
  const [from, to] = start <= end ? [start, end] : [end, start]
  let count = 0
  const current = new Date(from)
  while (current <= to) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
    current.setDate(current.getDate() + 1)
  }
  return start <= end ? count : -count
}

export default function DateCalculator() {
  const [mode, setMode] = useState<Mode>('diff')
  const [date1, setDate1] = useState(new Date().toISOString().slice(0, 10))
  const [date2, setDate2] = useState(new Date().toISOString().slice(0, 10))
  const [days, setDays] = useState('30')
  const [businessDaysOnly, setBusinessDaysOnly] = useState(false)

  const result = useMemo(() => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const numDays = parseInt(days, 10) || 0

    if (mode === 'diff') {
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null
      const ms = Math.abs(d2.getTime() - d1.getTime())
      const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24))
      const weeks = Math.floor(totalDays / 7)
      const businessDays = countBusinessDays(d1, d2)
      return {
        totalDays,
        weeks,
        businessDays: Math.abs(businessDays),
        direction: d2 >= d1 ? 'forward' : 'backward',
      }
    }

    if (isNaN(d1.getTime())) return null
    let resultDate: Date
    if (businessDaysOnly) {
      resultDate = addBusinessDays(d1, mode === 'add' ? numDays : -numDays)
    } else {
      resultDate = new Date(d1)
      resultDate.setDate(resultDate.getDate() + (mode === 'add' ? numDays : -numDays))
    }

    return {
      resultDate: resultDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  }, [mode, date1, date2, days, businessDaysOnly])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-2">
          {([
            ['diff', 'Date Difference'],
            ['add', 'Add Days'],
            ['subtract', 'Subtract Days'],
          ] as const).map(([m, label]) => (
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
              {label}
            </button>
          ))}
        </div>

        {mode === 'diff' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolInput label="Start Date" value={date1} onChange={setDate1} type="date" />
            <ToolInput label="End Date" value={date2} onChange={setDate2} type="date" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolInput label="Start Date" value={date1} onChange={setDate1} type="date" />
            <ToolInput label="Number of Days" value={days} onChange={setDays} type="number" />
          </div>
        )}

        {mode !== 'diff' && (
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={businessDaysOnly}
              onChange={(e) => setBusinessDaysOnly(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
            />
            Business days only (Mon–Fri)
          </label>
        )}

        {result && mode === 'diff' && 'totalDays' in result && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatBox label="Total Days" value={result.totalDays ?? 0} />
            <StatBox label="Weeks" value={result.weeks ?? 0} />
            <StatBox label="Business Days" value={result.businessDays ?? 0} />
          </div>
        )}

        {result && mode !== 'diff' && 'resultDate' in result && (
          <div className="rounded-lg border border-indigo-600/30 bg-indigo-600/10 p-6 text-center">
            <p className="text-sm text-zinc-400 mb-2">Result Date</p>
            <p className="text-2xl font-bold text-indigo-300">{result.resultDate}</p>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
