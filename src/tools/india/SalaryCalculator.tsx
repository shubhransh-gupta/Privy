import { useMemo, useState } from 'react'
import { ToolLayout, ToolInput, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { formatIndianCurrency, parseIndianNumber } from '../../lib/utils'
import { AlertTriangle } from 'lucide-react'

const tool = getToolById('salary-calculator')!

export default function SalaryCalculator() {
  const [ctc, setCtc] = useState('1200000')
  const [basicPercent, setBasicPercent] = useState('40')
  const [hraPercent, setHraPercent] = useState('50')
  const [pfEnabled, setPfEnabled] = useState(true)
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new')

  const result = useMemo(() => {
    const annualCtc = parseIndianNumber(ctc)
    if (annualCtc <= 0) {
      return { basic: 0, hra: 0, pfEmployee: 0, pfEmployer: 0, taxable: 0, tax: 0, inHand: 0, monthly: 0 }
    }

    const basicPct = (parseFloat(basicPercent) || 40) / 100
    const hraPct = (parseFloat(hraPercent) || 50) / 100

    const basic = annualCtc * basicPct
    const hra = basic * hraPct
    const specialAllowance = annualCtc - basic - hra

    const pfWage = Math.min(basic, 180000) // ₹15,000/month cap
    const pfEmployee = pfEnabled ? pfWage * 0.12 : 0
    const pfEmployer = pfEnabled ? pfWage * 0.12 : 0

    const standardDeduction = 75000
    const taxableIncome = Math.max(0, annualCtc - pfEmployee - standardDeduction)

    const tax = estimateIncomeTax(taxableIncome, taxRegime)
    const inHand = annualCtc - pfEmployee - tax
    const monthly = inHand / 12

    return {
      basic,
      hra,
      specialAllowance,
      pfEmployee,
      pfEmployer,
      taxable: taxableIncome,
      tax,
      inHand,
      monthly,
    }
  }, [ctc, basicPercent, hraPercent, pfEnabled, taxRegime])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200/80">
            Estimates only. Actual in-hand salary depends on company policy, bonuses, reimbursements,
            professional tax, and individual tax deductions. Consult a CA for accurate figures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolInput label="Annual CTC (₹)" value={ctc} onChange={setCtc} />
          <ToolInput label="Basic (% of CTC)" value={basicPercent} onChange={setBasicPercent} type="number" />
          <ToolInput label="HRA (% of Basic)" value={hraPercent} onChange={setHraPercent} type="number" />
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Tax Regime</label>
            <select
              value={taxRegime}
              onChange={(e) => setTaxRegime(e.target.value as 'new' | 'old')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="new">New Regime (FY 2024-25)</option>
              <option value="old">Old Regime (simplified)</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={pfEnabled}
            onChange={(e) => setPfEnabled(e.target.checked)}
            className="rounded border-zinc-600 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
          />
          Include Employee PF (12% of basic, capped at ₹15,000/month)
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBox label="Basic" value={formatIndianCurrency(result.basic)} />
          <StatBox label="HRA" value={formatIndianCurrency(result.hra)} />
          <StatBox label="Special Allowance" value={formatIndianCurrency(result.specialAllowance ?? 0)} />
          <StatBox label="Employee PF" value={formatIndianCurrency(result.pfEmployee)} />
          <StatBox label="Est. Income Tax" value={formatIndianCurrency(result.tax)} />
          <StatBox label="Annual In-Hand" value={formatIndianCurrency(result.inHand)} />
        </div>

        <div className="rounded-lg border border-indigo-600/30 bg-indigo-600/10 p-4 text-center">
          <p className="text-xs text-zinc-400 mb-1">Estimated Monthly In-Hand</p>
          <p className="text-3xl font-bold text-indigo-300">{formatIndianCurrency(result.monthly)}</p>
        </div>
      </div>
    </ToolLayout>
  )
}

function estimateIncomeTax(taxable: number, regime: 'new' | 'old'): number {
  if (taxable <= 0) return 0

  if (regime === 'new') {
    let tax = 0
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.3
    if (taxable > 1200000) tax += (Math.min(taxable, 1500000) - 1200000) * 0.2
    if (taxable > 900000) tax += (Math.min(taxable, 1200000) - 900000) * 0.15
    if (taxable > 600000) tax += (Math.min(taxable, 900000) - 600000) * 0.1
    if (taxable > 300000) tax += (Math.min(taxable, 600000) - 300000) * 0.05
    return tax * 1.04 // 4% cess
  }

  // Simplified old regime
  let tax = 0
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.3
  if (taxable > 500000) tax += (Math.min(taxable, 1000000) - 500000) * 0.2
  if (taxable > 250000) tax += (Math.min(taxable, 500000) - 250000) * 0.05
  return tax * 1.04
}
