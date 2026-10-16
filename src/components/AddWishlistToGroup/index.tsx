"use client"

import { ListPlus } from "lucide-react"
import { useTranslations } from "next-intl"
import { FormEvent, startTransition, useState } from "react"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { addWishlistToGroup } from "@/lib/wishlists/addWishlistToGroup"

interface Props {
  group: { id: string; title: string }
  wishlists: { id: string; name: string }[]
}

export const AddWishlistToGroup = ({ group, wishlists }: Props) => {
  const t = useTranslations("Group.addWishlist")
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [wishlistId, setWishlistId] = useState(wishlists[0]?.id)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!wishlistId) return

    startTransition(async () => {
      const result = await addWishlistToGroup(wishlistId, group.id)

      if (result.type === "error") {
        result.errors.forEach(title => {
          toast({ variant: "destructive", title })
        })
        return
      }

      setOpen(false)
      toast({ title: t("toast") })
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ListPlus size="16" className="mr-2" /> {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("text", { group: group.title })}
          </DialogDescription>
        </DialogHeader>
        <form id="add-to-group" onSubmit={onSubmit}>
          <RadioGroup value={wishlistId} onValueChange={setWishlistId}>
            {wishlists.map(wishlist => (
              <div key={wishlist.id} className="flex items-center gap-2">
                <RadioGroupItem value={wishlist.id} id={`add-${wishlist.id}`} />
                <Label htmlFor={`add-${wishlist.id}`}>{wishlist.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </form>
        <DialogFooter>
          <Button type="submit" form="add-to-group">
            <ListPlus size="16" className="mr-2" /> {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
