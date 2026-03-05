import { useEffect, useState } from 'react'

function parseJson<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T
  } catch {
    return undefined
  }
}

export function useLocalStorageState<T>(key: string, initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    const fallback = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue

    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return fallback

      const parsed = parseJson<T>(raw)
      return parsed ?? fallback
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Ignore write errors (e.g. private mode, quota exceeded)
    }
  }, [key, state])

  return [state, setState] as const
}
