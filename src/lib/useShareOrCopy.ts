"use client"

import { useToast } from "@/components/ui/use-toast"

export function useShareOrCopy() {
  const { toast } = useToast()

  return async function shareOrCopy({
    title,
    intro,
    url,
    copied,
  }: {
    title: string
    intro: string
    url: string
    copied: string
  }) {
    // The link goes in the text on its own line, not in a separate url: some
    // targets, like copying on macOS, glue that to the text and break the link.
    const text = `${intro}\n${url}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    await navigator.clipboard.writeText(text)
    toast({ title: copied })
  }
}
