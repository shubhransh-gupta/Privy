import { useMemo, useState } from 'react'
import { ToolLayout, ToolSection, ToolTextarea, StatBox } from '../../components/ToolLayout'
import { getToolById } from '../../lib/toolRegistry'
import { formatIndianCurrency } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { AlertTriangle } from 'lucide-react'

const tool = getToolById('invoice-parser')!

interface ExtractedField {
  label: string
  value: string
  confidence: 'high' | 'medium' | 'low'
}

const PATTERNS: { label: string; regex: RegExp; confidence: 'high' | 'medium' | 'low'; transform?: (m: string) => string }[] = [
  { label: 'Invoice Number', regex: /(?:invoice\s*(?:no|#|number)?[:\s]*)([A-Z0-9\-\/]+)/i, confidence: 'high' },
  { label: 'Invoice Date', regex: /(?:invoice\s*date|date)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i, confidence: 'high' },
  { label: 'Due Date', regex: /(?:due\s*date)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i, confidence: 'medium' },
  { label: 'GSTIN', regex: /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/, confidence: 'high' },
  { label: 'PAN', regex: /\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/, confidence: 'medium' },
  { label: 'Total Amount', regex: /(?:total|grand\s*total|amount\s*due|net\s*amount)[:\s]*(?:₹|Rs\.?\s*)?([\d,]+\.?\d*)/i, confidence: 'high', transform: (m) => m.replace(/,/g, '') },
  { label: 'Subtotal', regex: /(?:sub\s*total|subtotal)[:\s]*(?:₹|Rs\.?\s*)?([\d,]+\.?\d*)/i, confidence: 'medium', transform: (m) => m.replace(/,/g, '') },
  { label: 'CGST', regex: /CGST[:\s@]*[\d.]+%?[:\s]*(?:₹|Rs\.?\s*)?([\d,]+\.?\d*)/i, confidence: 'medium', transform: (m) => m.replace(/,/g, '') },
  { label: 'SGST', regex: /SGST[:\s@]*[\d.]+%?[:\s]*(?:₹|Rs\.?\s*)?([\d,]+\.?\d*)/i, confidence: 'medium', transform: (m) => m.replace(/,/g, '') },
  { label: 'IGST', regex: /IGST[:\s@]*[\d.]+%?[:\s]*(?:₹|Rs\.?\s*)?([\d,]+\.?\d*)/i, confidence: 'medium', transform: (m) => m.replace(/,/g, '') },
  { label: 'Vendor Name', regex: /(?:from|vendor|seller|supplier)[:\s]*([^\n\r]{3,60})/i, confidence: 'low' },
  { label: 'Email', regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/, confidence: 'high' },
  { label: 'Phone', regex: /(?:\+91[\s-]?)?[6-9]\d{9}/, confidence: 'medium' },
]

function extractFields(text: string): ExtractedField[] {
  const fields: ExtractedField[] = []
  const usedLabels = new Set<string>()

  for (const pattern of PATTERNS) {
    const match = text.match(pattern.regex)
    if (match && match[1] && !usedLabels.has(pattern.label)) {
      let value = match[1].trim()
      if (pattern.transform) value = pattern.transform(value)
      fields.push({ label: pattern.label, value, confidence: pattern.confidence })
      usedLabels.add(pattern.label)
    }
  }

  return fields
}

const CONFIDENCE_COLORS = {
  high: 'text-green-400 bg-green-600/10 border-green-600/30',
  medium: 'text-yellow-400 bg-yellow-600/10 border-yellow-600/30',
  low: 'text-orange-400 bg-orange-600/10 border-orange-600/30',
}

export default function InvoiceParser() {
  const [text, setText] = useState('')

  const fields = useMemo(() => extractFields(text), [text])

  const totalField = fields.find((f) => f.label === 'Total Amount')
  const totalAmount = totalField ? parseFloat(totalField.value) : null

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-200/80">
            Pattern-based extraction only — results are estimates. Always verify extracted data
            against the original invoice. No AI or cloud processing is used.
          </p>
        </div>

        <ToolTextarea
          value={text}
          onChange={setText}
          placeholder="Paste invoice text here..."
          rows={10}
        />

        {fields.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatBox label="Fields Found" value={fields.length} />
              {totalAmount !== null && !isNaN(totalAmount) && (
                <StatBox label="Total Amount" value={formatIndianCurrency(totalAmount)} />
              )}
              <StatBox
                label="High Confidence"
                value={fields.filter((f) => f.confidence === 'high').length}
              />
            </div>

            <ToolSection title="Extracted Fields">
              <div className="space-y-2">
                {fields.map((field) => (
                  <div
                    key={field.label}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50"
                  >
                    <div>
                      <p className="text-xs text-zinc-500">{field.label}</p>
                      <p className="text-sm font-medium mt-0.5">{field.value}</p>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded border capitalize shrink-0',
                        CONFIDENCE_COLORS[field.confidence]
                      )}
                    >
                      {field.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </ToolSection>
          </>
        ) : text.trim() ? (
          <p className="text-sm text-zinc-500">No fields detected. Try pasting more invoice text.</p>
        ) : null}
      </div>
    </ToolLayout>
  )
}
