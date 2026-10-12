"use client"

import { Button } from "@/components/ui/button"
import { MessagesSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { useShareOrCopy } from "@/lib/useShareOrCopy"

interface Props {
  title: string
}

export const ShareButton = ({ title }: Props) => {
  const t = useTranslations()
  const shareOrCopy = useShareOrCopy()

  return (
    <Button
      onClick={() =>
        shareOrCopy({
          title,
          text: t("Share.text", { group: title }),
          url: window.location.toString(),
          copied: t("Share.copied"),
        })
      }
    >
      <MessagesSquare size="16" className="mr-2" /> {t("Share.button")}
    </Button>
  )
}
