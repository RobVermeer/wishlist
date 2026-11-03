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
import { LinkFields } from "@/components/LinkFields"
import { openCategory } from "@/components/CategoryList/useCategoryOpen"
import { createWishlistItemForUser } from "@/lib/wishlistItems/createWishlistItemForUser"
import { FormEvent, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"

interface Props {
  id: string
  categories: string[]
  // Adds the wish to this category, from a small button next to it.
  category?: string
}

export const NewItem = ({ id, categories, category }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const result = await createWishlistItemForUser(id, data)

    if (result.type === "error") {
      result.errors.forEach(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    if (result.categoryId) openCategory(result.categoryId)
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
        {category ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 px-2.5"
            aria-label={t("NewItem.toCategory", { category })}
          >
            <Plus size="16" />
          </Button>
        ) : (
          <Button>
            <Plus size="16" className="mr-2" /> {t("NewItem.button")}
          </Button>
        )}
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

          <LinkFields />
          <Label htmlFor="category">
            {t.rich("NewItem.form.category", {
              small: chunks => <small>{chunks}</small>,
            })}
          </Label>
          <CategoryCombobox
            id="category"
            name="category"
            categories={categories}
            defaultValue={category}
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
