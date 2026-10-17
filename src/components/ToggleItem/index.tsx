"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toggleWishlistItemById } from "@/lib/wishlistItems/toggleWishlistItemById"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  id: string
  boughtByMe: boolean
}

export const ToggleItem = ({ id, boughtByMe }: Props) => {
  const { toast } = useToast()
  const t = useTranslations("Toggle")

  async function toggle(bought: boolean, canRevert: boolean) {
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

    toast({
      title: bought ? t("undo") : t("checked"),
      action: canRevert ? (
        <ToastAction
          altText={t("revert")}
          onClick={() => toggle(!bought, false)}
        >
          {t("revert")}
        </ToastAction>
      ) : undefined,
    })
  }

  return (
    <form
      action={() => toggle(boughtByMe, true)}
      className="flex shrink-0 items-center gap-2"
    >
      {boughtByMe && (
        <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold-foreground dark:text-gold">
          <Check size="16" strokeWidth="2.5" /> {t("boughtByMe")}
        </span>
      )}
      <Button type="submit" variant="outline" size="sm">
        {boughtByMe ? t("cancel") : t("buy")}
      </Button>
    </form>
  )
}
