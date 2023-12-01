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
import { createGroupForUser } from "@/lib/groups/createGroupForUser"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"

export const NewGroup = () => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createGroupForUser(data)

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size="16" className="mr-2" /> {t("NewGroup.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("NewGroup.title")}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
          <Label htmlFor="title">{t("NewGroup.form.title")}</Label>
          <Input required id="title" name="title" />
          <Label htmlFor="theme">{t("Common.group.theme.label")}</Label>
          <Select name="theme">
            <SelectTrigger id="theme">
              <SelectValue placeholder={t("Common.group.theme.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default">
                  {t("Common.group.theme.none")}
                </SelectItem>
                <SelectItem value="sinterklaas">
                  {t("Common.group.theme.sinterklaas")}
                </SelectItem>
                <SelectItem value="christmas">
                  {t("Common.group.theme.christmas")}
                </SelectItem>
                <SelectItem value="birthday">
                  {t("Common.group.theme.birthday")}
                </SelectItem>
                <SelectItem value="baby">
                  {t("Common.group.theme.baby")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
        <DialogFooter>
          <Button type="submit" form="add">
            <Plus size="16" className="mr-2" /> {t("NewGroup.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
