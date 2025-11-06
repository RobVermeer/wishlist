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
import { createWishlistItemForUser } from "@/lib/wishlistItems/createWishlistItemForUser"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"

interface Props {
  id: string
}

export const NewItem = ({ id }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createWishlistItemForUser(id, data)

    if (type === "error") {
      return errors.map(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    setOpen(false)
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
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
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
