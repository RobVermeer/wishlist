import { useSyncExternalStore } from "react"

const storageKey = "closed-categories"
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? "[]"
  } catch {
    return "[]"
  }
}

function getServerSnapshot() {
  return "[]"
}

function parse(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useCategoryOpen(id: string) {
  const closed = parse(
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  )

  function setOpen(open: boolean) {
    const next = open
      ? closed.filter(closedId => closedId !== id)
      : [...closed.filter(closedId => closedId !== id), id]

    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {}

    listeners.forEach(listener => listener())
  }

  return [!closed.includes(id), setOpen] as const
}
