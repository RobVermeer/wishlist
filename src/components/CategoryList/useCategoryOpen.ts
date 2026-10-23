import { useSyncExternalStore } from "react"
import {
  cookieName,
  parseClosedCategories,
  serializeClosedCategories,
} from "./closedCategories"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  const cookie = document.cookie
    .split("; ")
    .find(cookie => cookie.startsWith(`${cookieName}=`))

  return cookie?.slice(cookieName.length + 1) ?? ""
}

function setClosedCategories(ids: string[]) {
  document.cookie = serializeClosedCategories(ids)
  listeners.forEach(listener => listener())
}

export function useCategoryOpen(id: string, closedCategories: string) {
  const closed = parseClosedCategories(
    useSyncExternalStore(subscribe, getSnapshot, () => closedCategories)
  )

  function setOpen(open: boolean) {
    setClosedCategories(
      open
        ? closed.filter(closedId => closedId !== id)
        : [...closed.filter(closedId => closedId !== id), id]
    )
  }

  return [!closed.includes(id), setOpen] as const
}
