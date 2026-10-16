"use client"

import { RefreshCw, Share2 } from "lucide-react"
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
import { resetShareTokenForWishlist } from "@/lib/wishlists/resetShareTokenForWishlist"
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

  function loadLink(
    getToken: typeof getShareTokenForWishlist,
    success?: string
  ) {
    startTransition(async () => {
      const result = await getToken(wishlistId)

      if (result.type === "error") {
        result.errors.forEach(title => {
          toast({ variant: "destructive", title })
        })
        return
      }

      setUrl(`${window.location.origin}/lijstje/${result.shareToken}`)

      if (success) toast({ title: success })
    })
  }

  function onOpenChange(open: boolean) {
    if (open && !url) loadLink(getShareTokenForWishlist)
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
        <p className="text-sm text-muted-foreground">{t("resetText")}</p>
        <DialogFooter className="gap-2 md:gap-0">
          <Button
            variant="outline"
            disabled={!url}
            onClick={() =>
              loadLink(resetShareTokenForWishlist, t("resetToast"))
            }
          >
            <RefreshCw size="16" className="mr-2" /> {t("reset")}
          </Button>
          <Button
            disabled={!url}
            onClick={() =>
              url &&
              shareOrCopy({
                title: name,
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
