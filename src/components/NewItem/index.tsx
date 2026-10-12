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
import { createWishlistItemForUser } from "@/lib/wishlistItems/createWishlistItemForUser"
import { FormEvent, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"

interface Props {
  id: string
  categories: string[]
}

export const NewItem = ({ id, categories }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createWishlistItemForUser(id, data)

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size="16" className="mr-2" /> {t("NewItem.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("NewItem.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} id="add" className="grid gap-4 py-4">
          <Label htmlFor="title">{t("NewItem.form.title")}</Label>
          <Input required id="title" name="title" />

          <div className="flex items-center gap-3">
            <Checkbox id="unlimited" name="unlimited" />
            <Label htmlFor="unlimited">{t("NewItem.form.unlimited")}</Label>
          </div>

          <Label htmlFor="url">
            {t.rich("NewItem.form.url", {
              small: chunks => <small>{chunks}</small>,
            })}
          </Label>
          <Input id="url" name="url" />
          <Label htmlFor="category">
            {t.rich("NewItem.form.category", {
              small: chunks => <small>{chunks}</small>,
            })}
          </Label>
          <CategoryCombobox
            id="category"
            name="category"
            categories={categories}
          />
        </form>
        <DialogFooter>
          <Button type="submit" form="add">
            <Plus size="16" className="mr-2" /> {t("NewItem.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
