"use client"

import { Button } from "@/components/ui/button"
import { MessagesSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import { useShareOrCopy } from "@/lib/useShareOrCopy"

interface Props {
  title: string
  variant?: "default" | "outline"
  className?: string
}

export const ShareButton = ({ title, variant, className }: Props) => {
  const t = useTranslations()
  const shareOrCopy = useShareOrCopy()

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() =>
        shareOrCopy({
          title,
          url: window.location.toString(),
          copied: t("Share.copied"),
        })
      }
    >
      <MessagesSquare size="16" className="mr-2" /> {t("Share.button")}
    </Button>
  )
}
