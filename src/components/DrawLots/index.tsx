"use client"

import { FormEvent, useState, useTransition } from "react"
import { Dices, LoaderCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useToast } from "@/components/ui/use-toast"
import { createDraw } from "@/lib/draws/createDraw"

interface Props {
  groupId: string
  members: { id: string; name: string }[]
}

export const DrawLots = ({ groupId, members }: Props) => {
  const t = useTranslations("Draw.form")
  const tDraw = useTranslations("Draw")
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createDraw(groupId, data)

    if (type === "error") {
      errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    setOpen(false)
    toast({ title: tDraw("toast") })
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
          <Dices size="16" className="mr-2" /> {tDraw("manage.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("text")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} id="draw" className="grid gap-4 py-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">
              {t("participants")}
            </legend>
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-2">
                <Checkbox
                  id={`draw-${member.id}`}
                  name="members"
                  value={member.id}
                  defaultChecked
                />
                <Label htmlFor={`draw-${member.id}`} className="font-normal">
                  {member.name}
                </Label>
              </div>
            ))}
          </fieldset>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="draw-budget">
                {t.rich("budget", { small: chunks => <small>{chunks}</small> })}
              </Label>
              <Input
                id="draw-budget"
                name="budget"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="25"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draw-date">
                {t.rich("date", { small: chunks => <small>{chunks}</small> })}
              </Label>
              <Input id="draw-date" name="date" type="date" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="draw" disabled={pending}>
            {pending ? (
              <LoaderCircle size="16" className="mr-2 animate-spin" />
            ) : (
              <Dices size="16" className="mr-2" />
            )}
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
