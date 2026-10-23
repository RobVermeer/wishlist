import { useSyncExternalStore } from "react"
import {
  cookieName,
  parseOpenCategories,
  serializeOpenCategories,
} from "./openCategories"

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

function setOpenCategories(ids: string[]) {
  document.cookie = serializeOpenCategories(ids)
  listeners.forEach(listener => listener())
}

export function useCategoryOpen(id: string, openCategories: string) {
  const opened = parseOpenCategories(
    useSyncExternalStore(subscribe, getSnapshot, () => openCategories)
  )

  function setOpen(open: boolean) {
    setOpenCategories(
      open
        ? [...opened.filter(openedId => openedId !== id), id]
        : opened.filter(openedId => openedId !== id)
    )
  }

  return [opened.includes(id), setOpen] as const
}
