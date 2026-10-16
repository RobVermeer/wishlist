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
import { CategoryCombobox } from "@/components/CategoryCombobox"
import { MoreOptions } from "@/components/MoreOptions"
import { RemoveButton } from "@/components/RemoveButton"
import { deleteWishlistItemById } from "@/lib/wishlistItems/deleteWishlistItemById"
import { updateWishlistItemById } from "@/lib/wishlistItems/updateWishlistItemById"
import type { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { FormEvent, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { Checkbox } from "../ui/checkbox"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
  categories: string[]
}

export const EditItem = ({ item, categories }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title, url, unlimited } = item
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistItemById(id, data)

    if (type === "error") {
      errors.forEach(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    setOpen(false)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => handleSubmit(data))
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
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("EditItem.title")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor="title">{t("EditItem.form.title")}</Label>
          <Input required id="title" name="title" defaultValue={title} />

          <MoreOptions defaultOpen={Boolean(url || item.category || unlimited)}>
            <Label htmlFor="url">
              {t.rich("EditItem.form.url", {
                small: chunks => <small>{chunks}</small>,
              })}
            </Label>
            <Input id="url" name="url" defaultValue={url || ""} />
            <Label htmlFor="category">
              {t.rich("EditItem.form.category", {
                small: chunks => <small>{chunks}</small>,
              })}
            </Label>
            <CategoryCombobox
              id="category"
              name="category"
              categories={categories}
              defaultValue={item.category?.title ?? ""}
            />

            <div className="flex items-center gap-3">
              <Checkbox
                id="unlimited"
                name="unlimited"
                defaultChecked={unlimited}
              />
              <Label htmlFor="unlimited">{t("EditItem.form.unlimited")}</Label>
            </div>
          </MoreOptions>
        </form>
        <DialogFooter className="gap-2 md:gap-0">
          <div>
            <RemoveButton
              description={t("EditItem.remove.description")}
              onConfirm={handleRemove}
            />
          </div>
          <Button type="submit" form={`change-${id}`}>
            <Save size="16" className="mr-2" /> {t("EditItem.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
