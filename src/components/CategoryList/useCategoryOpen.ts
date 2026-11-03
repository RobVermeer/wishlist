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

// Opens a category from outside it, like after adding a wish to it, so the
// wish doesn't disappear into a closed category.
export function openCategory(id: string) {
  setOpenCategories([
    ...parseOpenCategories(getSnapshot()).filter(openedId => openedId !== id),
    id,
  ])
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
