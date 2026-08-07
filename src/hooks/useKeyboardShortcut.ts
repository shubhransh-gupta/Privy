import { useEffect, useCallback } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { meta?: boolean; ctrl?: boolean; shift?: boolean } = { meta: true }
) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const metaMatch = modifiers.meta ? e.metaKey || e.ctrlKey : true
      const ctrlMatch = modifiers.ctrl !== undefined ? (modifiers.ctrl ? e.ctrlKey : !e.ctrlKey) : true
      const shiftMatch = modifiers.shift !== undefined ? (modifiers.shift ? e.shiftKey : !e.shiftKey) : true

      if (e.key.toLowerCase() === key.toLowerCase() && metaMatch && ctrlMatch && shiftMatch) {
        e.preventDefault()
        callback()
      }
    },
    [key, callback, modifiers]
  )

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — Privy` : 'Privy — Your private toolbox for the web'
    return () => { document.title = prev }
  }, [title])
}
