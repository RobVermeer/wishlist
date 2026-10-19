"use client"

import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"
import type { ManagerOption } from "@/lib/users/getManagerOptionsForUser"

interface Props {
  managers: ManagerOption[]
  defaultManagerIds?: string[]
}

export const WishlistManagersField = ({
  managers,
  defaultManagerIds = [],
}: Props) => {
  const t = useTranslations("Common.wishlist.managers")

  return (
    <fieldset className="grid gap-1">
      <legend className="mb-1 text-sm font-medium">{t("label")}</legend>
      <p className="mb-1 text-sm text-muted-foreground">
        {managers.length > 0 ? t("text") : t("empty")}
      </p>
      {managers.map(manager => (
        <div key={manager.id} className="flex items-center space-x-2">
          <Checkbox
            id={`manager-${manager.id}`}
            value={manager.id}
            name="managers"
            defaultChecked={defaultManagerIds.includes(manager.id)}
          />
          <label htmlFor={`manager-${manager.id}`}>{manager.name}</label>
        </div>
      ))}
    </fieldset>
  )
}
