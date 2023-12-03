"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteWishlistItemById } from "@/lib/wishlistItems/deleteWishlistItemById"
import { updateWishlistItemById } from "@/lib/wishlistItems/updateWishlistItemById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, Trash } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
}

export const EditItem = ({ item }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title, url } = item
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistItemById(id, data)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    setOpen(false)
  }

  async function handleRemove() {
    await deleteWishlistItemById(id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="absolute right-1" size="sm" variant="outline">
          <Pencil size="12" className="mr-2" /> {t("EditItem.button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("EditItem.title")}</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor="title">{t("EditItem.form.title")}</Label>
          <Input required id="title" name="title" defaultValue={title} />
          <Label htmlFor="url">
            {t.rich("EditItem.form.url", {
              small: (chunks) => <small>{chunks}</small>,
            })}
          </Label>
          <Input id="url" name="url" defaultValue={url || ""} />
        </form>
        <DialogFooter className="gap-2 md:gap-0">
          <form action={handleRemove}>
            <Button className="w-full" type="submit" variant="outline">
              <Trash size="16" className="mr-2" /> {t("EditItem.remove")}
            </Button>
          </form>
          <Button type="submit" form={`change-${id}`}>
            <Save size="16" className="mr-2" /> {t("EditItem.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
