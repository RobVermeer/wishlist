"use client"

import { KeyboardEvent, useId, useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { maxInterests } from "@/lib/schema"

interface Props {
  title: string
  interests: { id: string; title: string }[]
  hint?: string
  note?: string
  // The id of the form that saves the interests. Without it, they can't be
  // changed.
  form?: string
}

export const Interests = ({ title, interests, hint, note, form }: Props) => {
  const t = useTranslations("Interests")
  const tErrors = useTranslations("Errors")
  const { toast } = useToast()
  const [items, setItems] = useState(() =>
    interests.map(interest => interest.title)
  )
  const [value, setValue] = useState("")
  const id = useId()
  const editable = Boolean(form)

  function add() {
    const added = value.trim()

    if (!added) return

    const error = items.some(item => item.toLowerCase() === added.toLowerCase())
      ? tErrors("interest.duplicate", { title: added })
      : items.length >= maxInterests
        ? tErrors("interest.tooMany", { max: maxInterests })
        : null

    if (error) {
      toast({ variant: "destructive", title: error })
      return
    }

    setItems(items => [...items, added])
    setValue("")
  }

  // Enter adds the interest instead of saving the whole form.
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    add()
  }

  function remove(title: string) {
    setItems(items => items.filter(item => item !== title))
  }

  const shown = editable ? items : interests.map(interest => interest.title)

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="grid gap-2 rounded-lg bg-secondary p-4"
    >
      <h3 id={`${id}-title`} className="font-semibold">
        {title}
      </h3>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}

      {shown.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {shown.map(interest => (
            <li
              key={interest}
              className="flex items-center gap-1 rounded-full bg-background py-1 pl-3 pr-3 text-sm has-[button]:pr-1"
            >
              {interest}
              {editable && (
                <>
                  <input
                    type="hidden"
                    name="interests"
                    value={interest}
                    form={form}
                  />
                  <button
                    type="button"
                    aria-label={t("removeLabel", { title: interest })}
                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    onClick={() => remove(interest)}
                  >
                    <X size="14" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {note && <p className="text-sm italic text-muted-foreground">{note}</p>}

      {editable && (
        <div className="flex gap-2">
          <Label htmlFor={`${id}-input`} className="sr-only">
            {t("label")}
          </Label>
          <Input
            id={`${id}-input`}
            value={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("placeholder")}
            className="bg-background"
          />
          <Button type="button" variant="outline" onClick={add}>
            <Plus size="16" className="mr-2" /> {t("add")}
          </Button>
        </div>
      )}
    </section>
  )
}
