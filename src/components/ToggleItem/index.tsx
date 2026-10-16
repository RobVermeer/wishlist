"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { toggleWishlistItemById } from "@/lib/wishlistItems/toggleWishlistItemById"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  id: string
  boughtByMe: boolean
}

export const ToggleItem = ({ id, boughtByMe }: Props) => {
  const { toast } = useToast()
  const t = useTranslations("Toggle")

  async function onToggle() {
    const { type, errors } = await toggleWishlistItemById(id)

    if (type === "error") {
      errors.forEach(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    toast({ title: boughtByMe ? t("undo") : t("checked") })
  }

  return (
    <form action={onToggle} className="flex shrink-0 items-center gap-2">
      {boughtByMe && (
        <span className="flex items-center gap-1 text-sm text-primary">
          <Check size="16" strokeWidth="2.5" /> {t("boughtByMe")}
        </span>
      )}
      <Button type="submit" variant="outline" size="sm">
        {boughtByMe ? t("cancel") : t("buy")}
      </Button>
    </form>
  )
}
