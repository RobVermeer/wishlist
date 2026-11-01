"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { maxWishlistItemLinks } from "@/lib/schema"
import { Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

interface Props {
  defaultValues?: string[]
}

export const LinkFields = ({ defaultValues = [] }: Props) => {
  const t = useTranslations("LinkFields")
  const [fields, setFields] = useState(() =>
    (defaultValues.length > 0 ? defaultValues : [""]).map((value, key) => ({
      key,
      value,
      added: false,
    }))
  )

  function add() {
    setFields(fields => [
      ...fields,
      {
        key: Math.max(...fields.map(({ key }) => key)) + 1,
        value: "",
        added: true,
      },
    ])
  }

  function remove(key: number) {
    setFields(fields => fields.filter(field => field.key !== key))
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium leading-none">
        {t.rich("label", {
          count: fields.length,
          small: chunks => <small>{chunks}</small>,
        })}
      </legend>
      {fields.map(({ key, value, added }, index) => (
        <div key={key} className="flex gap-2">
          <Input
            name="url"
            inputMode="url"
            defaultValue={value}
            autoFocus={added}
            aria-label={t("field", { number: index + 1 })}
          />
          {fields.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label={t("remove", { number: index + 1 })}
              onClick={() => remove(key)}
            >
              <X size="16" />
            </Button>
          )}
        </div>
      ))}
      {fields.length < maxWishlistItemLinks && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={add}
        >
          <Plus size="16" className="mr-2" /> {t("add")}
        </Button>
      )}
    </fieldset>
  )
}
