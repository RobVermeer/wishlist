"use client"

import { focusDialog } from "@/lib/utils"
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
import { RemoveButton } from "@/components/RemoveButton"
import { deleteWishlistCategoryById } from "@/lib/wishlistCategories/deleteWishlistCategoryById"
import { updateWishlistCategoryById } from "@/lib/wishlistCategories/updateWishlistCategoryById"
import { FormEvent, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save } from "lucide-react"
import { useTranslations } from "next-intl"
import { useUnsavedChanges } from "@/components/UnsavedChanges"

interface Props {
  id: string
  title: string
}

export const EditCategory = ({ id, title }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { setForm, onOpenChange, confirmation } = useUnsavedChanges({
    open,
    onOpenChange: setOpen,
  })
  const t = useTranslations("EditCategory")

  function showErrors(errors: string[]) {
    errors.forEach(title => {
      toast({ variant: "destructive", title })
    })
  }

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistCategoryById(id, data)

    if (type === "error") {
      showErrors(errors)
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
    const { type, errors } = await deleteWishlistCategoryById(id)

    if (type === "error") {
      showErrors(errors)
      return
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          aria-label={t("label", { title })}
        >
          <Pencil size="12" className="mr-2" /> {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={focusDialog}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <form
          ref={setForm}
          onSubmit={onSubmit}
          id={`change-category-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor={`category-title-${id}`}>{t("form.title")}</Label>
          <Input
            required
            id={`category-title-${id}`}
            name="title"
            defaultValue={title}
          />
        </form>
        <DialogFooter className="gap-2 md:gap-0">
          <div>
            <RemoveButton
              description={t("remove.description")}
              onConfirm={handleRemove}
            />
          </div>
          <Button type="submit" form={`change-category-${id}`}>
            <Save size="16" className="mr-2" /> {t("form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmation}
    </Dialog>
  )
}
