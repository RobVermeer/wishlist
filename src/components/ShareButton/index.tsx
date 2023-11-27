"use client"

import { getGroupById } from "@/lib/groups/getGroupById"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MessagesSquare } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
  group: NonNullable<Awaited<ReturnType<typeof getGroupById>>>
}

export const ShareButton = ({ group }: Props) => {
  const { toast } = useToast()
  const t = useTranslations()

  async function share() {
    try {
      await navigator.share({
        title: group.title,
        text: t("Share.text", { group: group.title }),
        url: window.location.toString(),
      })
    } catch {
      navigator.clipboard.writeText(window.location.toString())
      toast({ title: t("Share.copied") })
    }
  }

  return (
    <Button onClick={share}>
      <MessagesSquare size="16" className="mr-2" /> {t("Share.button")}
    </Button>
  )
}
