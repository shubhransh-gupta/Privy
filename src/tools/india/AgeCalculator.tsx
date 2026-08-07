import { useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolInput, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'

const tool = getToolById('age-calculator')!

export default function AgeCalculator() {
  const [dob, setDob] = useState('1990-01-15')

  const result = useMemo(() => {
    const birth = new Date(dob)
    if (isNaN(birth.getTime())) {
      return null
    }

    const today = new Date()
    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday <= today) {
      nextBirthday.setFullYear(today.getFullYear() + 1)
    }
    const daysUntilBirthday = Math.ceil(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    const totalDays = Math.floor(
      (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    )
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = years * 12 + months

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      daysUntilBirthday,
      nextBirthday: nextBirthday.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  }, [dob])

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <ToolSection title="Date of Birth">
          <ToolInput value={dob} onChange={setDob} type="date" />
        </ToolSection>

        {result ? (
          <>
            <div className="rounded-lg border border-indigo-600/30 bg-indigo-600/10 p-6 text-center">
              <p className="text-sm text-zinc-400 mb-2">Your Age</p>
              <p className="text-3xl font-bold text-indigo-300">
                {result.years} years, {result.months} months, {result.days} days
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Total Days" value={result.totalDays.toLocaleString('en-IN')} />
              <StatBox label="Total Weeks" value={result.totalWeeks.toLocaleString('en-IN')} />
              <StatBox label="Total Months" value={result.totalMonths.toLocaleString('en-IN')} />
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-sm text-zinc-400">Next Birthday</p>
              <p className="text-lg font-semibold mt-1">{result.nextBirthday}</p>
              <p className="text-sm text-indigo-400 mt-2">
                {result.daysUntilBirthday} day{result.daysUntilBirthday !== 1 ? 's' : ''} to go
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-red-400">Please enter a valid date of birth.</p>
        )}
      </div>
    </ToolLayout>
  )
}
