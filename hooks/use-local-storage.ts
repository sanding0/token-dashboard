"use client"

import { useCallback, useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener("local-storage", onChange) // 同页写入也通知
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("local-storage", onChange)
  }
}

function parseStored<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function getServerSnapshot() {
  return null as string | null
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const getSnapshot = () => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const storedValue = parseStored(raw, initialValue)

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const prev = parseStored(raw, initialValue)
      const next = value instanceof Function ? value(prev) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
        window.dispatchEvent(new Event("local-storage"))
      } catch {
        // quota
      }
    },
    [key, raw, initialValue],
  )

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      window.dispatchEvent(new Event("local-storage"))
    } catch {
      /* ignore */
    }
  }, [key])

  const hydrated = typeof window !== "undefined"

  return [storedValue, setValue, { hydrated, remove }] as const
}