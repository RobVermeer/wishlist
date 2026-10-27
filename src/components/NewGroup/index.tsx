"use client"

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
import { Label } from "@/components/ui/label"
import { createGroupForUser } from "@/lib/groups/createGroupForUser"
import { FormEvent, ReactNode, startTransition, useState } from "react"
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

interface Props {
  trigger: ReactNode
}

export const NewGroup = ({ trigger }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createGroupForUser(data)

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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("NewGroup.title")}</DialogTitle>
          <DialogDescription>
            {t.rich("NewGroup.text", {
              b: chunks => (
                <b className="font-medium text-foreground">{chunks}</b>
              ),
            })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} id="add" className="grid gap-4 py-4">
          <Label htmlFor="title">{t("NewGroup.form.title")}</Label>
          <Input
            required
            id="title"
            name="title"
            placeholder={t("NewGroup.form.placeholder")}
          />
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
