import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function formatIndianCurrency(num: number): string {
  return `₹${formatIndianNumber(Math.round(num))}`
}

export function formatIndianCompact(num: number): string {
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(1).replace(/\.0$/, '')} Cr`
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(1).replace(/\.0$/, '')} Lakh`
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(1).replace(/\.0$/, '')} Thousand`
  return formatIndianCurrency(num)
}

export function parseIndianNumber(str: string): number {
  const cleaned = str.replace(/[₹,\s]/g, '')
  return parseFloat(cleaned) || 0
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}
