"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MessagesSquare } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
  title: string
}

export const ShareButton = ({ title }: Props) => {
  const { toast } = useToast()
  const t = useTranslations()

  async function share() {
    const url = window.location.toString()

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: t("Share.text", { group: title }),
          url,
        })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    await navigator.clipboard.writeText(url)
    toast({ title: t("Share.copied") })
  }

  return (
    <Button onClick={share}>
      <MessagesSquare size="16" className="mr-2" /> {t("Share.button")}
    </Button>
  )
}
