"use client"

import { Share2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { startTransition, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { getShareTokenForWishlist } from "@/lib/wishlists/getShareTokenForWishlist"
import { useShareOrCopy } from "@/lib/useShareOrCopy"

interface Props {
  wishlistId: string
  name: string
}

export const ShareWishlist = ({ wishlistId, name }: Props) => {
  const t = useTranslations("ShareWishlist")
  const { toast } = useToast()
  const shareOrCopy = useShareOrCopy()
  const [url, setUrl] = useState<string | null>(null)

  function onOpenChange(open: boolean) {
    if (!open || url) return

    startTransition(async () => {
      const result = await getShareTokenForWishlist(wishlistId)

      if (result.type === "error") {
        result.errors.forEach(title => {
          toast({ variant: "destructive", title })
        })
        return
      }

      setUrl(`${window.location.origin}/lijstje/${result.shareToken}`)
    })
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 size="16" className="mr-2" /> {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("text")}</DialogDescription>
        </DialogHeader>
        <Input
          readOnly
          aria-label={t("link")}
          value={url ?? ""}
          onFocus={event => event.target.select()}
        />
        <DialogFooter>
          <Button
            disabled={!url}
            onClick={() =>
              url &&
              shareOrCopy({
                title: name,
                text: t("shareText", { name }),
                url,
                copied: t("copied"),
              })
            }
          >
            <Share2 size="16" className="mr-2" /> {t("share")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
