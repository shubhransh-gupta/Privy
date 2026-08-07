import { useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { formatIndianCurrency, parseIndianNumber } from '../../lib/utils'

const tool = getToolById('emi-calculator')!

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('5000000')
  const [rate, setRate] = useState('8.5')
  const [tenure, setTenure] = useState('20')

  const result = useMemo(() => {
    const p = parseIndianNumber(principal)
    const r = (parseFloat(rate) || 0) / 12 / 100
    const n = (parseFloat(tenure) || 0) * 12

    if (p <= 0 || n <= 0) {
      return { emi: 0, totalPayment: 0, totalInterest: 0, schedule: [] as { month: number; principal: number; interest: number; balance: number }[] }
    }

    const emi = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const schedule: { month: number; principal: number; interest: number; balance: number }[] = []
    let balance = p
    let totalInterest = 0

    for (let i = 1; i <= n; i++) {
      const interest = balance * r
      const princ = emi - interest
      balance = Math.max(0, balance - princ)
      totalInterest += interest
      if (i <= 12 || i % 12 === 0 || i === n) {
        schedule.push({ month: i, principal: princ, interest, balance })
      }
    }

    return {
      emi,
      totalPayment: emi * n,
      totalInterest,
      schedule,
      principalAmount: p,
    }
  }, [principal, rate, tenure])

  const principalAmount = result.principalAmount ?? 0
  const principalPct = result.totalPayment > 0
    ? (principalAmount / result.totalPayment) * 100
    : 50
  const interestPct = 100 - principalPct

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ToolInput label="Loan Amount (₹)" value={principal} onChange={setPrincipal} />
          <ToolInput label="Interest Rate (% p.a.)" value={rate} onChange={setRate} type="number" />
          <ToolInput label="Tenure (years)" value={tenure} onChange={setTenure} type="number" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatBox label="Monthly EMI" value={formatIndianCurrency(result.emi)} />
          <StatBox label="Total Interest" value={formatIndianCurrency(result.totalInterest)} />
          <StatBox label="Total Payment" value={formatIndianCurrency(result.totalPayment)} />
        </div>

        <ToolSection title="Principal vs Interest Breakdown">
          <div className="space-y-4">
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div
                className="bg-indigo-500 transition-all flex items-center justify-center text-xs font-medium"
                style={{ width: `${principalPct}%` }}
              >
                {principalPct > 15 && `${principalPct.toFixed(0)}% Principal`}
              </div>
              <div
                className="bg-amber-500 transition-all flex items-center justify-center text-xs font-medium"
                style={{ width: `${interestPct}%` }}
              >
                {interestPct > 15 && `${interestPct.toFixed(0)}% Interest`}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-indigo-500" />
                Principal: {formatIndianCurrency(principalAmount)}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                Interest: {formatIndianCurrency(result.totalInterest)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="text-left py-2 pr-4">Month</th>
                    <th className="text-right py-2 px-2">Principal</th>
                    <th className="text-right py-2 px-2">Interest</th>
                    <th className="text-right py-2 pl-2">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="border-b border-zinc-800/50">
                      <td className="py-2 pr-4 text-zinc-400">{row.month}</td>
                      <td className="text-right py-2 px-2">{formatIndianCurrency(row.principal)}</td>
                      <td className="text-right py-2 px-2 text-amber-400">{formatIndianCurrency(row.interest)}</td>
                      <td className="text-right py-2 pl-2">{formatIndianCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ToolSection>
      </div>
    </ToolLayout>
  )
}
