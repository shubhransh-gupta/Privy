import { useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { formatIndianCurrency, parseIndianNumber, cn } from '../../lib/utils'
import { Plus, Trash2 } from 'lucide-react'

const tool = getToolById('bill-splitter')!

interface Person {
  id: string
  name: string
  share: string
}

export default function BillSplitter() {
  const [bill, setBill] = useState('2500')
  const [tipPercent, setTipPercent] = useState('10')
  const [mode, setMode] = useState<'equal' | 'unequal'>('equal')
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Person 1', share: '1' },
    { id: '2', name: 'Person 2', share: '1' },
  ])

  const billAmount = parseIndianNumber(bill)
  const tip = (billAmount * (parseFloat(tipPercent) || 0)) / 100
  const total = billAmount + tip

  const splits = useMemo(() => {
    if (total <= 0) return people.map((p) => ({ ...p, amount: 0 }))

    if (mode === 'equal') {
      const perPerson = total / people.length
      return people.map((p) => ({ ...p, amount: perPerson }))
    }

    const totalShares = people.reduce((sum, p) => sum + (parseFloat(p.share) || 0), 0)
    if (totalShares <= 0) return people.map((p) => ({ ...p, amount: 0 }))

    return people.map((p) => ({
      ...p,
      amount: (total * (parseFloat(p.share) || 0)) / totalShares,
    }))
  }, [total, people, mode])

  const addPerson = () => {
    setPeople((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Person ${prev.length + 1}`, share: '1' },
    ])
  }

  const removePerson = (id: string) => {
    if (people.length <= 2) return
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolInput label="Bill Amount (₹)" value={bill} onChange={setBill} />
          <ToolInput label="Tip (%)" value={tipPercent} onChange={setTipPercent} type="number" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Bill" value={formatIndianCurrency(billAmount)} />
          <StatBox label="Tip" value={formatIndianCurrency(tip)} />
          <StatBox label="Total" value={formatIndianCurrency(total)} />
        </div>

        <div className="flex gap-2">
          {(['equal', 'unequal'] as const).map((m) => (
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
              {m === 'equal' ? 'Equal Split' : 'Unequal Split'}
            </button>
          ))}
        </div>

        <ToolSection title="People">
          <div className="space-y-3">
            {splits.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
              >
                <ToolInput
                  value={person.name}
                  onChange={(v) =>
                    setPeople((prev) =>
                      prev.map((p) => (p.id === person.id ? { ...p, name: v } : p))
                    )
                  }
                  className="flex-1"
                />
                {mode === 'unequal' && (
                  <ToolInput
                    value={person.share}
                    onChange={(v) =>
                      setPeople((prev) =>
                        prev.map((p) => (p.id === person.id ? { ...p, share: v } : p))
                      )
                    }
                    placeholder="Share"
                    type="number"
                    className="w-24"
                  />
                )}
                <div className="text-right min-w-[100px]">
                  <p className="text-sm font-semibold">{formatIndianCurrency(person.amount)}</p>
                </div>
                <button
                  onClick={() => removePerson(person.id)}
                  disabled={people.length <= 2}
                  className="p-2 text-zinc-500 hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addPerson}
            className="mt-3 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
          >
            <Plus className="h-4 w-4" /> Add person
          </button>
        </ToolSection>
      </div>
    </ToolLayout>
  )
}
