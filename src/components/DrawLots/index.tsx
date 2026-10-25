"use client"

import { FormEvent, useState, useTransition } from "react"
import { Dices, LoaderCircle, UserPlus, X } from "lucide-react"
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
  previous?: { id: string; name: string }[]
  redraw?: boolean
}

export const DrawLots = ({
  groupId,
  members,
  previous = [],
  redraw = false,
}: Props) => {
  const t = useTranslations("Draw.form")
  const tDraw = useTranslations("Draw")
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [extra, setExtra] = useState<{ name: string; email: string }[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  function addPerson() {
    setExtra([...extra, { name: name.trim(), email: email.trim() }])
    setName("")
    setEmail("")
  }

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createDraw(groupId, data)

    if (type === "error") {
      errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    setOpen(false)
    setExtra([])
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
        <Button variant={redraw ? "outline" : "default"}>
          <Dices size="16" className="mr-2" />{" "}
          {redraw ? tDraw("manage.redraw") : tDraw("manage.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{redraw ? t("redrawTitle") : t("title")}</DialogTitle>
          <DialogDescription>
            {redraw ? t("redrawText") : t("text")}
          </DialogDescription>
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
            {previous.map(person => (
              <div key={person.id} className="flex items-center gap-2">
                <Checkbox
                  id={`draw-${person.id}`}
                  name="previous"
                  value={person.id}
                  defaultChecked
                />
                <Label htmlFor={`draw-${person.id}`} className="font-normal">
                  {person.name}{" "}
                  <small className="text-muted-foreground">
                    {t("notInGroup")}
                  </small>
                </Label>
              </div>
            ))}
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium">
              {t("extra.title")}
            </legend>
            <p className="text-sm text-muted-foreground">{t("extra.text")}</p>
            {extra.length > 0 && (
              <ul className="grid gap-1">
                {extra.map((person, index) => (
                  <li
                    key={`${person.email}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm"
                  >
                    <span className="truncate">
                      {person.name}{" "}
                      <span className="text-muted-foreground">
                        {person.email}
                      </span>
                    </span>
                    <input type="hidden" name="extraName" value={person.name} />
                    <input
                      type="hidden"
                      name="extraEmail"
                      value={person.email}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0"
                      aria-label={t("extra.remove", { name: person.name })}
                      onClick={() =>
                        setExtra(extra.filter((_, other) => other !== index))
                      }
                    >
                      <X size="14" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="draw-extra-name" className="text-xs">
                  {t("extra.name")}
                </Label>
                <Input
                  id="draw-extra-name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder={t("extra.namePlaceholder")}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="draw-extra-email" className="text-xs">
                  {t("extra.email")}
                </Label>
                <Input
                  id="draw-extra-email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder={t("extra.emailPlaceholder")}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="justify-self-start"
              disabled={!name.trim() || !email.trim()}
              onClick={addPerson}
            >
              <UserPlus size="16" className="mr-2" /> {t("extra.add")}
            </Button>
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
