"use client"

import { useToast } from "@/components/ui/use-toast"

export function useShareOrCopy() {
  const { toast } = useToast()

  return async function shareOrCopy({
    title,
    url,
    copied,
  }: {
    title: string
    url: string
    copied: string
  }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    await navigator.clipboard.writeText(url)
    toast({ title: copied })
  }
}
