"use client"

import {
  FormEvent,
  startTransition,
  useId,
  useState,
  useTransition,
} from "react"
import { useTranslations } from "next-intl"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RemoveButton } from "@/components/RemoveButton"
import { createWishlistInterest } from "@/lib/wishlistInterests/createWishlistInterest"
import { deleteWishlistInterestById } from "@/lib/wishlistInterests/deleteWishlistInterestById"

interface Props {
  wishlistId: string
  title: string
  interests: { id: string; title: string }[]
  hint?: string
  note?: string
  editable?: boolean
}

export const Interests = ({
  wishlistId,
  title,
  interests,
  hint,
  note,
  editable = false,
}: Props) => {
  const t = useTranslations("Interests")
  const { toast } = useToast()
  const [value, setValue] = useState("")
  const [adding, startAdding] = useTransition()
  const id = useId()

  function showErrors(errors: string[]) {
    errors.forEach(title => {
      toast({ variant: "destructive", title })
    })
  }

  async function handleSubmit(data: FormData) {
    const result = await createWishlistInterest(wishlistId, data)

    if (result.type === "error") {
      showErrors(result.errors)
      return
    }

    // Keep what was typed in the meantime.
    const added = data.get("title")
    setValue(current => (current === added ? "" : current))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startAdding(() => handleSubmit(data))
  }

  function onRemove(interestId: string) {
    startTransition(async () => {
      const result = await deleteWishlistInterestById(interestId)

      if (result.type === "error") showErrors(result.errors)
    })
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="grid gap-2 rounded-lg bg-secondary p-4"
    >
      <h3 id={`${id}-title`} className="font-semibold">
        {title}
      </h3>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}

      {interests.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <li
              key={interest.id}
              className="flex items-center gap-1 rounded-full bg-background py-1 pl-3 pr-3 text-sm has-[button]:pr-1"
            >
              {interest.title}
              {editable && (
                <RemoveButton
                  description={t("remove", { title: interest.title })}
                  onConfirm={() => onRemove(interest.id)}
                >
                  <button
                    type="button"
                    aria-label={t("removeLabel", { title: interest.title })}
                    className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X size="14" />
                  </button>
                </RemoveButton>
              )}
            </li>
          ))}
        </ul>
      )}
      {note && <p className="text-sm italic text-muted-foreground">{note}</p>}

      {editable && (
        <form onSubmit={onSubmit} className="flex gap-2">
          <Label htmlFor={`${id}-input`} className="sr-only">
            {t("label")}
          </Label>
          <Input
            id={`${id}-input`}
            name="title"
            value={value}
            onChange={event => setValue(event.target.value)}
            placeholder={t("placeholder")}
            className="bg-background"
          />
          <Button type="submit" variant="outline" disabled={adding}>
            <Plus size="16" className="mr-2" /> {t("add")}
          </Button>
        </form>
      )}
    </section>
  )
}
