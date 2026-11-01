"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Marks the page as loading from a click on a link to another page until
// that page is shown, so the heart in the logo beats meanwhile.
export function NavigationStatus() {
  const pathname = usePathname()

  useEffect(() => {
    delete document.documentElement.dataset.loading
  }, [pathname])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return

      const link = (event.target as Element).closest("a")
      if (!link || link.target || link.hasAttribute("download")) return

      const url = new URL(link.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname)
        return

      document.documentElement.dataset.loading = ""
      // Stop beating if the page never comes, like after an error.
      clearTimeout(timeout)
      timeout = setTimeout(
        () => delete document.documentElement.dataset.loading,
        10_000
      )
    }

    // Before Link handles the click, which cancels the browser's navigation.
    document.addEventListener("click", onClick, { capture: true })
    return () => {
      document.removeEventListener("click", onClick, { capture: true })
      clearTimeout(timeout)
    }
  }, [])

  return null
}
